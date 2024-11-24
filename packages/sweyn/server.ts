import http, { IncomingMessage, ServerResponse } from 'node:http'
import fs, { createReadStream } from 'node:fs'
import { join, extname } from 'node:path'
import { URL } from 'node:url'
import {
  asParts,
  getMatchingRoute,
  isWildcard,
  withoutWildcards,
} from './routes.ts'
import analytics from './analytics.ts'

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.txt': 'text/plain',
  '.md': 'text/plain',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

export const staticFolders = new Set(['', 'public'])

export const middlewares = new Set()

const getFileFromFS =
  (filename: string) =>
  (path: string): Promise<fs.ReadStream> => {
    return new Promise((res, rej) => {
      try {
        const stream = createReadStream(join(path, filename))
        stream.on('error', rej)
        stream.on('open', () => res(stream))
      } catch (error) {
        rej(error)
      }
    })
  }

export async function streamFileFromStaticFolder(filename) {
  try {
    return await Promise.any(
      Array.from(staticFolders).map(getFileFromFS(filename))
    )
  } catch (error) {
    throw {
      status: 404,
      message: 'streamFileFromStaticFolder dit not find ' + filename,
    }
  }
}

export async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => (body += chunk.toString()))
    req.on('error', reject)
    req.on('end', () => resolve(body))
  })
}

function isReadStream(value) {
  return typeof value.on === 'function'
}

export function createRequestHandler(callback) {
  return async function (req, res) {
    try {
      const result = await callback(req, res)

      if (req.url === '/hmr-update') console.log(req.url)

      if (result instanceof Error) {
        return res.writeHead(500).end(JSON.stringify(result))
      }

      if (res.headersSent) return

      if (result && isReadStream(result)) {
        const { pathname } = new URL('https://foobar.com' + req.url)
        const contentType = CONTENT_TYPES[extname(pathname)]

        if (contentType) res.setHeader('Content-Type', contentType)

        if (contentType !== 'text/html') {
          res.setHeader('Cache-Control', 'max-age=31536000')
        }

        return result.pipe(res.writeHead(200))
      }

      if (res.headersSent) return

      if (typeof result === 'string') {
        return res.writeHead(200).end(result)
      }

      if (res.headersSent) return

      if (Buffer.isBuffer(result)) {
        return res.writeHead(200).end(result)
      }

      if (res.headersSent) return

      return res.writeHead(200).end(JSON.stringify(result))
    } catch (error) {
      console.log('error', error)
      res.writeHead(error.status || 500).end(JSON.stringify(error))
    }
  }
}

const requestHandler = ({
  withAnalytics = false,
}: { withAnalytics?: boolean } = {}) =>
  createRequestHandler(async (req: IncomingMessage, res: ServerResponse) => {
    const { method, url } = req
    const { pathname, searchParams } = new URL('https://foobar.com' + url)

    // is request for a static file?
    if (extname(pathname)) {
      return await streamFileFromStaticFolder(pathname)
    }

    const { route, handler } =
      getMatchingRoute(pathname, method) || getMatchingRoute('error')

    if (!route || !handler) throw { status: 404, message: 'no route found' }

    const options = {
      query: Object.fromEntries(searchParams),
      route: {},
    }

    const urlParts = asParts(url)
    const routeParts = asParts(route)

    routeParts.forEach((part, idx) => {
      if (isWildcard(part)) {
        options.route[withoutWildcards(part)] = urlParts[idx]
      }
    })

    if (withAnalytics) {
      console.log('pageload', req.url)
      analytics(req)
    }

    return handler(req, res, options)
  })

export const createServer = ({ withAnalytics }: { withAnalytics: boolean }) =>
  http.createServer(requestHandler({ withAnalytics }))
