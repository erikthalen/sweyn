import http from 'node:http'
import fs, { createReadStream } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { URL } from 'node:url'
import {
  asParts,
  getMatchingRoute,
  isWildcard,
  withoutWildcards,
} from './routes.ts'

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

export async function readBody(req): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => (body += chunk.toString()))
    req.on('error', reject)
    req.on('end', () => resolve(body))
  })
}

export function createRequestHandler(callback) {
  return async function (req, res) {
    try {
      const result = await callback(req, res)

      if (result instanceof Error) {
        return res.writeHead(500).end(JSON.stringify(result))
      }

      if (res.headersSent) return

      if (result && typeof result.on === 'function') {
        const contentType = CONTENT_TYPES[extname(resolve(req.url))]
        if (contentType) res.setHeader('Content-Type', contentType)
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

const requestHandler = await createRequestHandler(async (req, res) => {
  const { method, url } = req
  const { pathname, searchParams } = new URL('https://foobar.com' + url)

  // is request for a static file?
  if (extname(pathname)) {
    return await streamFileFromStaticFolder(url)
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

  return handler(req, res, options)
})

export const createServer = http.createServer(requestHandler)
