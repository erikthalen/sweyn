import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import fs, { createReadStream, ReadStream } from 'node:fs'
import { join, extname } from 'node:path'
import { URL } from 'node:url'
import {
  asParts,
  getMatchingRoute,
  isWildcard,
  withoutWildcards,
} from './routes.ts'
import type { RouteHandlerOptions } from './types.ts'

const CONTENT_TYPES: Record<string, string> = {
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

const getFileFromFS = (
  path: string,
  filename: string
): Promise<fs.ReadStream> => {
  return new Promise((resolve, reject) => {
    try {
      const stream = createReadStream(join(path, filename))
      stream.on('error', reject)
      stream.on('open', () => resolve(stream))
    } catch (error) {
      reject(error)
    }
  })
}

export async function streamFileFromStaticFolder(filename: string) {
  try {
    return await Promise.any(
      Array.from(staticFolders).map(path => getFileFromFS(path, filename))
    )
  } catch (error) {
    throw {
      status: 404,
      message: 'streamFileFromStaticFolder dit not find ' + filename,
    }
  }
}

export async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => (body += chunk.toString()))
    req.on('error', reject)
    req.on('end', () => resolve(body))
  })
}

function isReadStream(value: string | ReadStream) {
  return typeof value !== 'string' && typeof value.on === 'function'
}

export function createRequestHandler(
  callback: (
    req: IncomingMessage,
    res: ServerResponse
  ) => Promise<ReadStream | string>
) {
  return async function (req: IncomingMessage, res: ServerResponse) {
    try {
      const result = await callback(req, res)

      if (res.headersSent) return

      if (result && isReadStream(result)) {
        const { pathname } = new URL(req.url || '', 'https://foobar.com')
        const contentType = CONTENT_TYPES[extname(pathname)]

        if (contentType) res.setHeader('Content-Type', contentType)

        if (
          contentType !== 'text/html' &&
          contentType !== 'application/javascript' &&
          contentType !== 'text/css'
        ) {
          res.setHeader('Cache-Control', 'max-age=31536000')
        }

        ;(result as ReadStream).pipe(res.writeHead(200))
        return
      }

      if (Buffer.isBuffer(result) || typeof result === 'string') {
        return res.writeHead(200).end(result)
      }

      return res.writeHead(200).end(JSON.stringify(result))
    } catch (error) {
      type ResolvedError = {
        type: string
        status: number
        response: string
      }
      const resolvedError = (await Promise.resolve(error)) as ResolvedError

      if (resolvedError?.type === 'error-page') {
        res
          .setHeader('Content-Type', 'text/html')
          .writeHead(resolvedError?.status || 404)
          .end(resolvedError?.response)
      } else {
        const status = (error as { status: number }).status || 500
        res.writeHead(status).end(JSON.stringify(error))
      }
    }
  }
}

const requestHandler = createRequestHandler(
  async (req: IncomingMessage, res: ServerResponse) => {
    const { method, url } = req
    const { pathname, searchParams } = new URL(url || '', 'https://foobar.com')

    // is request for a static file?
    if (extname(pathname)) {
      return await streamFileFromStaticFolder(pathname)
    }

    const result = getMatchingRoute(pathname, method)

    const { route, handler } = result.handler
      ? result
      : getMatchingRoute('error')

    if (!route || !handler) throw { status: 404, message: 'no route found' }

    const options: RouteHandlerOptions = {
      query: Object.fromEntries(searchParams),
      route: {},
      error: null,
    }

    const urlParts = asParts(url)
    const routeParts = asParts(route)

    routeParts.forEach((part, idx) => {
      if (isWildcard(part)) {
        options.route[withoutWildcards(part)] = urlParts[idx]
      }
    })

    middlewares.forEach(middleware => {
      if (typeof middleware === 'function') {
        middleware(req, res)
      }
    })

    if (typeof handler === 'string') return handler

    if (route === 'error') {
      options.error = {
        statusCode: 404,
        message: 'Page not found',
      }
    }

    return handler(req, res, options)
  }
)

export const createServer = () => http.createServer(requestHandler)
