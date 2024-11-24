import path from 'path'
import type { RouteHandler } from './types.ts'
import { getFilenamesInDirectory, isNotFolder } from './utils.ts'

async function readFiles(dir: string): Promise<string[]> {
  const filenames = await getFilenamesInDirectory(dir, { recursive: true })
  return filenames.filter(isNotFolder)
}

async function compileRoutes(rootdir, files) {
  const endpoints = files.map(async filename => {
    const { dir, name } = path.parse(filename)
    const [route, method] = name.split('.')
    const modules = await import(path.resolve(rootdir, filename))
    const functions = Object.entries(modules)

    return functions.map(([moduleName, handler]) => {
      const url = path.join(
        '/api',
        dir,
        route,
        moduleName.replace('default', '')
      )

      return {
        method,
        route: url,
        handler: handler as RouteHandler,
      }
    })
  })

  return (await Promise.all(endpoints)).flat()
}

export default { readFiles, compileRoutes }
