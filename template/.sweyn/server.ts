import http from 'node:http'
import fs, { createReadStream } from 'node:fs'
import { normalize, join, resolve, extname } from 'node:path'
import { URL } from 'node:url'

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

export const routes = new Map([
  ['GET', new Map()],
  ['POST', new Map()],
  ['PUT', new Map()],
  ['PATCH', new Map()],
  ['DELETE', new Map()],
])

export const middlewares = new Set()

const getRouteHandler = (requestedRoute, method = 'GET') => {
  try {
    const result = routes.get(method).get(requestedRoute)

    // found a route exactly matching the requested route
    if (result) return { handler: result }

    // no exact match, try fuzzy finding a route
    const [_, ...reqUrlArr] = requestedRoute.split('/')

    let matchedRoutes = []

    routes.get(method).forEach((handler, registeredRoute) => {
      const [_, ...regUrlArr] = registeredRoute.split('/')

      if (regUrlArr.length !== reqUrlArr.length) return
      if (!regUrlArr.find(part => part.startsWith('['))) return

      const isMatch = reqUrlArr.every((part, idx) => {
        return part === regUrlArr[idx] || regUrlArr[idx].startsWith('[')
      })

      if (!isMatch) return

      const matches = regUrlArr
        .map(
          (part, idx) =>
            part.startsWith('[') && {
              key: part.replace('[', '').replace(']', ''),
              value: reqUrlArr[idx],
            }
        )
        .filter(Boolean)

      matchedRoutes.push({ matches, handler })
    })

    const matchedRoutesSorted = matchedRoutes.toSorted((a, b) => {
      return a.matches.length - b.matches.length
    })

    return matchedRoutesSorted.at(0)
  } catch (error) {
    throw { status: 404, message: 'No route found' + error }
  }
}

const getFileFromFS =
  (name: string) =>
  (path: string): Promise<fs.ReadStream> => {
    return new Promise((res, rej) => {
      try {
        const stream = createReadStream(join(resolve(path), normalize(name)))
        stream.on('error', rej)
        stream.on('open', () => res(stream))
      } catch (error) {
        rej(error)
      }
    })
  }

export async function streamFile(filename) {
  try {
    return await Promise.any(
      Array.from(staticFolders).map(getFileFromFS(filename))
    )
  } catch (error) {
    throw { status: 404, message: 'streamFile dit not find ' + filename }
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
      console.log(error)
      res.writeHead(error.status || 500).end(JSON.stringify(error))
    }
  }
}

export const requestHandler = await createRequestHandler(async (req, res) => {
  const { method, url, headers } = req
  const { pathname, searchParams } = new URL('https://' + headers.host + url)

  // is request for a static file?
  if (extname(normalize(pathname))) {
    return await streamFile(resolve(url))
  }

  const result =
    getRouteHandler(resolve(pathname), method) || getRouteHandler('error')

  if (typeof result.handler === 'string')
    return await streamFile(result.handler)

  const handlerFunction = await Promise.resolve(result.handler)

  if (typeof handlerFunction === 'function') {
    const options = {
      query: Object.fromEntries(searchParams),
      route: {},
    }

    result.matches?.forEach(match => {
      options.route[match.key] = match.value
    })

    return handlerFunction(req, res, options)
  }

  throw { status: 500, message: 'could not handle request' }
})

export const createServer = http.createServer(requestHandler)
