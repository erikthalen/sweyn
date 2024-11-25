import path from 'node:path'
import http from 'node:http'
import fs from 'node:fs/promises'
import { renderFile, renderVariables, renderLayout } from './renderer.ts'
import { HMRServer, withHMR } from './hmr.ts'
import { createServer, middlewares, staticFolders } from './server.ts'
import { registerRoute, routes, withoutWildcards } from './routes.ts'
import { createCms, getContent } from './cms.ts'
import type { Config } from './types.ts'
import api from './api.ts'
import { getFilenamesInDirectory, isNotFolder } from './utils.ts'
import createDatabase from './db.ts'
import { createAnalytics } from './analytics.ts'

export let config: Config = {}

const app = {
  version: generateVersion(),
}

function generateVersion() {
  return [...Array(20)].map(() => Math.random().toString(36)[2]).join('')
}

export function refreshAppVersion() {
  app.version = generateVersion()
}

function defaultHandler(filename: string) {
  return (req: http.IncomingMessage) => {
    return renderFile(filename, {
      [withoutWildcards(filename)]: req.url?.toString().substring(1),
      version: app.version,
    })
  }
}

async function init(userConfig?: Config) {
  config = userConfig

  const defaults = {
    static: ['app', 'pages', 'sweyn'].concat(config?.static || []),
    port: config?.port || 3003,
  }

  HMRServer()

  const { recordVisitor } = config.analytics ? createAnalytics(config) : {}

  registerRoute({
    route: '/',
    handler: withHMR(defaultHandler('index')),
  })

  registerRoute({
    route: 'error',
    handler: withHMR(defaultHandler('error')),
  })

  defaults.static.forEach(s => staticFolders.add(s))
  // config?.plugins?.forEach(p => middlewares.add(p))

  if (config?.admin) {
    createCms({
      rootdir: config.root,
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

    const handler = async (req, res) => {
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

  // console.log(routes)

  /**
   * start server
   */
  createServer({ callbacks: [recordVisitor] }).listen(defaults.port, () =>
    console.log(`http://localhost:${defaults.port}`)
  )
}

export {
  init as createServer,
  renderFile,
  getContent,
  renderLayout,
  createDatabase,
}
