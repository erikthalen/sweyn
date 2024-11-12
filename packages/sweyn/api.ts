import fs from 'node:fs'
import fsPromise from 'node:fs/promises'
import path from 'path'
import http from 'node:http'

type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options?: Record<string, Record<string, string>>
) => void

type Route = {
  method?: string
  route: string
  handler: RouteHandler
}

async function getFilenamesInDirectory(dir) {
  if (!fs.existsSync(dir)) return

  return await fsPromise.readdir(dir)
}

const base = './api'

async function getApiRoutes(dir) {
  const filenames = await getFilenamesInDirectory(dir)

  if (!filenames) return []

  const endpoints = filenames.map(async filename => {
    const [route, method] = path.parse(filename).name.split('.')
    const modules = await import(path.resolve(base, filename))

    if (Object.values(modules).length === 1) {
      return [
        {
          method: method?.toUpperCase() || 'GET',
          route,
          handler: Object.values(modules)[0] as RouteHandler,
        },
      ]
    }

    let result: Route[] = []

    for (let module in modules) {
      const nestedEndpoint = path.join('/', route, module)

      result.push({
        method: method?.toUpperCase() || 'GET',
        route: nestedEndpoint,
        handler: modules[module] as RouteHandler,
      })
    }

    return result
  })

  return (await Promise.all(endpoints)).flat()
}

export default await getApiRoutes(base)
