import path from 'node:path'
import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import fs from 'node:fs/promises'
import { renderFile, renderVariables, renderLayout } from './renderer.ts'
// import { destroyHRM, HMRServer, injectHMR, watchFilesAdded } from './hmr.ts'
import { createServer, middlewares, staticFolders } from './server.ts'
import { registerRoute, withoutWildcards, clearRoutes } from './routes.ts'
import { createCms, getContent } from './cms.ts'
import type { Config, RouteHandler, RouteHandlerOptions } from './types.ts'
import api from './api.ts'
import { getFilenamesInDirectory, isNotFolder } from './utils.ts'
import createDatabase from './db.ts'
import { createAnalytics } from './analytics.ts'
import {
  disconnectHMR,
  HMRServer,
  injectHMR,
  watchFilesAdded,
} from './hmr-ws.ts'

export let config: Config = {}
let server: http.Server | null = null

const app = {
  version: generateVersion(),
}

function generateVersion() {
  return Date.now()
}

export function refreshAppVersion() {
  app.version = generateVersion()
}

function defaultHandler(filename: string) {
  return (
    req: IncomingMessage,
    res: ServerResponse,
    options?: RouteHandlerOptions
  ) => {
    return renderFile(filename, {
      [withoutWildcards(filename)]: req.url?.toString().substring(1),
      version: app.version.toString(),
      ...(options?.error || {}),
    })
  }
}

export function withHMR(handler: RouteHandler | string) {
  if (process.env.NODE_ENV !== 'development') {
    return handler
  }

  if (typeof handler === 'string') {
    return injectHMR(handler)
  }

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    options?: RouteHandlerOptions
  ) => {
    const response = await handler(req, res, options)
    return injectHMR(response)
  }
}

async function init(userConfig?: Config) {
  config = userConfig || config

  const defaults = {
    static: ['dist', 'pages'].concat(config?.static || []),
    port: config?.port || 3003,
  }

  // initHRM()
  HMRServer()

  defaults.static.forEach(s => staticFolders.add(s))

  if (config?.analytics) {
    const { recordVisitor } = createAnalytics(config)
    middlewares.add(recordVisitor)
  }

  registerRoute({
    route: '/',
    handler: withHMR(defaultHandler('index')),
  })

  registerRoute({
    route: 'error',
    handler: withHMR(defaultHandler('error')),
  })

  if (config?.admin) {
    createCms({
      sweynRoot: config.root,
      username: config.admin.login,
      password: config.admin.password,
    })
  }

  const files = await getFilenamesInDirectory('./pages', {
    recursive: true,
  })

  files
    .filter(isNotFolder)
    .filter(file => !['index.html', 'error.html'].includes(file))
    .map(file => {
      const { dir, name } = path.parse(file)

      registerRoute({
        route: path.join('/' + dir, name),
        handler: withHMR(defaultHandler(path.join(dir, name))),
      })
    })

  const apiFiles = await api.readFiles('./api')
  const apiRoutes = await api.compileRoutes('./api', apiFiles)

  apiRoutes?.forEach(registerRoute)

  config?.routes?.forEach(item => {
    registerRoute({
      method: item.method,
      route: item.route,
      handler: withHMR(item.handler),
    })
  })

  const snippets = await getFilenamesInDirectory('./snippets')

  snippets.forEach(async snippet => {
    const { name } = path.parse(snippet)

    const handler = async (req: IncomingMessage, res: ServerResponse) => {
      const { searchParams } = new URL('http://foo.com' + req.url)
      const file = await fs.readFile(path.join('./snippets', snippet))

      res.setHeader('Content-Type', 'text/html')

      return renderVariables(
        file.toString(),
        Object.fromEntries(searchParams.entries())
      )
    }

    registerRoute({
      route: path.join('/snippets', name),
      handler,
    })
  })

  /**
   * start server
   */
  if (!server) {
    server = createServer()
  }

  server.listen(defaults.port, () =>
    console.log(`http://localhost:${defaults.port}`)
  )

  watchFilesAdded(() => {
    // cleanup
    disconnectHMR()
    defaults.static.forEach(s => staticFolders.delete(s))
    clearRoutes()
    server?.close()

    // re-init
    init()
  })
}

export {
  init as createServer,
  renderFile,
  getContent,
  renderLayout,
  createDatabase,
}
