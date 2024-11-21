import path from 'node:path'
import http from 'node:http'
import fs from 'node:fs/promises'
import { renderFile, renderVariables } from './renderer.ts'
import { injectHMR } from './hmr.ts'
import { createServer, middlewares, staticFolders } from './server.ts'
import { registerRoute, routes, withoutWildcards } from './routes.ts'
import { createCms, getContent } from './cms.ts'
import type { Config } from './types.ts'
import api from './api.ts'
import { getFilenamesInDirectory, isNotFolder } from './utils.ts'

function defaultHandler(filename: string) {
  return async (req: http.IncomingMessage) => {
    const page = await renderFile(filename, {
      [withoutWildcards(filename)]: req.url?.toString().substring(1),
    })

    if (process.env.NODE_ENV === 'dev') {
      return injectHMR(page)
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
  }

  registerRoute({
    route: '/',
    handler: defaultHandler('index'),
  })

  registerRoute({
    route: 'error',
    handler: defaultHandler('error'),
  })

  defaults.static.forEach(s => staticFolders.add(s))
  config?.plugins?.forEach(p => middlewares.add(p))

  if (config?.cms) {
    createCms({
      cmsIndexRoot: config.cms.cmsIndexRoot,
      username: config.cms.login,
      password: config.cms.password,
    })
  }

  const files = await getFilenamesInDirectory(defaults.pagesDir, {
    recursive: true,
  })

  files
    .filter(isNotFolder)
    .filter(file => !['index.html', 'error.html'].includes(file))
    .map(file => {
      const { dir, name } = path.parse(file)

      registerRoute({
        route: path.join('/' + dir, name),
        handler: defaultHandler(path.join(dir, name)),
      })
    })

  const apiFiles = await api.readFiles(defaults.apiDir)
  const apiRoutes = await api.compileRoutes(defaults.apiDir, apiFiles)

  apiRoutes?.forEach(registerRoute)

  config?.routes?.forEach(item => {
    registerRoute({
      method: item.method,
      route: item.route,
      handler: async (req, res, options) => {
        if (process.env.NODE_ENV === 'dev') {
          return injectHMR(await item.handler(req, res, options))
        } else {
          return item.handler(req, res, options)
        }
      },
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

export { init as createServer, renderFile, getContent }
