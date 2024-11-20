import path from 'path'
import type { Route, RouteHandler } from './types.ts'
import { getFilenamesInDirectory } from './utils.ts'

async function getApiRoutes(dir) {
  const filenames = await getFilenamesInDirectory(dir)

  if (!filenames) return []

  const endpoints = filenames.map(async filename => {
    const [route, method] = path.parse(filename).name.split('.')
    const modules = await import(path.resolve(dir, filename))

    if (Object.values(modules).length === 1) {
      return [
        {
          method,
          route: path.join('/api', route),
          handler: Object.values(modules)[0] as RouteHandler,
        },
      ]
    }

    let result: Route[] = []

    for (let module in modules) {
      result.push({
        method,
        route: path.join('/api', route, module),
        handler: modules[module] as RouteHandler,
      })
    }

    return result
  })

  return (await Promise.all(endpoints)).flat()
}

export default getApiRoutes
