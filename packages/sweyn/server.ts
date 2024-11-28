import http, {
  IncomingMessage,
  ServerResponse,
  type RequestListener,
} from 'node:http'
import fs, { createReadStream } from 'node:fs'
import { join, extname } from 'node:path'
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

      if (result && isReadStream(result)) {
        const { pathname } = new URL(req.url, 'https://foobar.com')
        const contentType = CONTENT_TYPES[extname(pathname)]

        if (contentType) res.setHeader('Content-Type', contentType)

        if (contentType !== 'text/html') {
          res.setHeader('Cache-Control', 'max-age=31536000')
        }

        result.pipe(res.writeHead(200))
        return
      }

      if (Buffer.isBuffer(result) || typeof result === 'string') {
        return res.writeHead(200).end(result)
      }

      return res.writeHead(200).end(JSON.stringify(result))
    } catch (error) {
      console.log('error', error)
      res.writeHead(error.status || 500).end(JSON.stringify(error))
    }
  }
}

const requestHandler = ({
  callbacks = [],
}: { callbacks?: RequestListener[] } = {}) =>
  createRequestHandler(async (req: IncomingMessage, res: ServerResponse) => {
    const { method, url } = req
    const { pathname, searchParams } = new URL(url, 'https://foobar.com')

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

    callbacks.forEach(callback => {
      if (typeof callback === 'function') {
        callback(req, res)
      }
    })

    return handler(req, res, options)
  })

export const createServer = ({ callbacks }: { callbacks: RequestListener[] }) =>
  http.createServer(requestHandler({ callbacks }))
