import fs from 'node:fs/promises'
import path from 'node:path'

const sweynDir = '.sweyn'
const source = './packages/sweyn'
const destination = './template'

const packageJSONSrc = await fs.readFile(path.join(source, 'package.json'))
const packageJSON = await fs.readFile(path.join(destination, 'package.json'))

const src = JSON.parse(packageJSONSrc.toString())
const dest = JSON.parse(packageJSON.toString())

/**
 * remove old .sweyn folder
 */
await fs.rm(path.join(destination, sweynDir), {
  recursive: true,
  force: true,
})

await fs.mkdir(path.join(destination, sweynDir))

await fs.writeFile(
  path.join(destination, 'package.json'),
  JSON.stringify(
    {
      version: src.version,
      ...dest,
      dependencies:
        dest.dependencies || src.dependencies
          ? {
              ...(dest.dependencies || {}),
              ...(src.dependencies || {}),
            }
          : undefined,
      devDependencies:
        dest.devDependencies || src.devDependencies
          ? {
              ...(dest.devDependencies || {}),
              ...(src.devDependencies || {}),
            }
          : undefined,
    },
    null,
    2
  )
)

await fs.cp(path.join(source), path.join(destination, sweynDir), {
  recursive: true,
})

fs.rm(path.join(destination, sweynDir, 'node_modules'), {
  recursive: true,
  force: true,
})
fs.rm(path.join(destination, sweynDir, 'package.json'), {
  recursive: true,
  force: true,
})

console.log('Done copying sweyn folder to /template')
