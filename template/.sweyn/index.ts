import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import fsPromise from 'node:fs/promises'
import { renderFile, renderVariables } from './renderer.ts'
import { HMRServer, injectHMR } from './hmr.ts'
import { createServer, middlewares, routes, staticFolders } from './server.ts'
import api from './api.ts'
import { createCms } from './cms.ts'

export type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options?: Record<string, Record<string, string>>
) => void

export type Route = {
  method?: string
  route: string
  handler: RouteHandler
}

export type Config = {
  port?: number
  hmrPort?: number
  static?: string | string[]
  cms?: {
    login: string
    password: string
  }
  plugins?: ((req: http.IncomingMessage, res: http.ServerResponse) => void)[]
  routes?: Route[]
}

function defaultHandler(file: string, port?: number) {
  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const page = await renderFile(file, {
      [file.replace('[', '').replace(']', '')]: req.url,
    })

    if (process.env.NODE_ENV === 'dev') {
      return injectHMR(page, port || 8080)
    } else {
      return page
    }
  }
}

function registerRoute({ method = 'GET', route, handler }) {
  routes.get(method)?.set(route, handler)
}

async function init(config?: Config) {
  const defaults = {
    static: ['app', 'pages', 'sweyn'].concat(config?.static || []),
    pagesDir: './pages',
    snippetsDir: './snippets',
    snippetsBaseEndpoint: '/snippets',
    apiBaseEndpoint: '/api',
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

  if (fs.existsSync(defaults.pagesDir)) {
    const files = await fsPromise.readdir(defaults.pagesDir)
    files.map(file => {
      const path = file.replace('.html', '')
      const route = '/' + (path === 'index' ? '' : path)

      registerRoute({ route, handler: defaultHandler(path, config?.hmrPort) })
    })
  }

  /**
   * register files in /api as routes
   */
  api?.forEach(({ method, route, handler }) => {
    registerRoute({
      method,
      route: path.join(defaults.apiBaseEndpoint, route),
      handler,
    })
  })

  config?.routes?.forEach(item => {
    registerRoute({
      method: item.method?.toUpperCase(),
      route: item.route,
      handler: item.handler,
    })
  })

  /**
   * register /snippets/file as routes
   */
  if (fs.existsSync(defaults.snippetsDir)) {
    const snippets = await fsPromise.readdir(defaults.snippetsDir)

    snippets.forEach(async snippet => {
      const name = path.parse(snippet).name
      const route = path.join(defaults.snippetsBaseEndpoint, name)

      const handler = async (req, res) => {
        const { searchParams } = new URL('http://foo.com' + req.url)
        const data = Object.fromEntries(searchParams.entries())

        const file = await fsPromise.readFile(
          path.join(defaults.snippetsDir, snippet)
        )

        res.setHeader('Content-Type', 'text/html')

        return renderVariables(file.toString(), data)
      }

      registerRoute({ route, handler })
    })
  }

  /**
   * start server
   */
  createServer.listen(defaults.port, () =>
    console.log(`http://localhost:${defaults.port}`)
  )
}

export { init as createServer, renderFile }
