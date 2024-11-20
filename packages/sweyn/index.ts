import path from 'node:path'
import http from 'node:http'
import fs from 'node:fs/promises'
import { renderFile, renderVariables } from './renderer.ts'
import { HMRServer, injectHMR } from './hmr.ts'
import { createServer, middlewares, staticFolders } from './server.ts'
import { registerRoute, withoutWildcards } from './routes.ts'
import { createCms } from './cms.ts'
import type { Config } from './types.ts'
import getApiRoutes from './api.ts'
import { getFilenamesInDirectory } from './utils.ts'

function defaultHandler(filename: string, port?: number) {
  return async (req: http.IncomingMessage) => {
    const page = await renderFile(filename, {
      [withoutWildcards(filename)]: req.url?.toString().substring(1),
    })

    if (process.env.NODE_ENV === 'dev') {
      return injectHMR(page, port || 8080)
    } else {
      return page
    }
  }
}

async function init(config?: Config) {
  const defaults = {
    static: ['app', 'pages', 'sweyn'].concat(config?.static || []),
    pagesDir: './pages',
    snippetsDir: './snippets',
    apiDir: './api',
    port: config?.port || 3003,
    hmrPort: config?.hmrPort || 8080,
  }

  HMRServer(defaults.hmrPort)

  defaults.static.forEach(s => staticFolders.add(s))
  config?.plugins?.forEach(p => middlewares.add(p))

  if (config?.cms) {
    createCms({
      username: config.cms.login,
      password: config.cms.password,
    })
  }

  registerRoute({
    route: '/',
    handler: defaultHandler('index', defaults.hmrPort),
  })

  registerRoute({
    route: 'error',
    handler: defaultHandler('error', defaults.hmrPort),
  })

  const files = await getFilenamesInDirectory(defaults.pagesDir)

  files
    .filter(file => file !== 'index.html' && file !== 'error.html')
    .map(file => {
      const { name } = path.parse(file)

      registerRoute({
        route: '/' + name,
        handler: defaultHandler(name, config?.hmrPort),
      })
    })

  const apiRoutes = await getApiRoutes(defaults.apiDir)

  apiRoutes?.forEach(registerRoute)

  config?.routes?.forEach(item => {
    registerRoute({
      method: item.method,
      route: item.route,
      handler: item.handler,
    })
  })

  const snippets = await getFilenamesInDirectory(defaults.snippetsDir)

  snippets.forEach(async snippet => {
    const { name } = path.parse(snippet)

    const handler = async (req, res) => {
      const { searchParams } = new URL('http://foo.com' + req.url)
      const file = await fs.readFile(path.join(defaults.snippetsDir, snippet))

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
  createServer.listen(defaults.port, () =>
    console.log(`http://localhost:${defaults.port}`)
  )
}

export { init as createServer, renderFile }
