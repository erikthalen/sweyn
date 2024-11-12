import fs from 'node:fs/promises'
import path from 'node:path'

const sweynDir = '.sweyn'
const source = './packages/sweyn'
const destination = './template'

const packageJSONSrc = await fs.readFile(path.join(source, 'package.json'))
const packageJSON = await fs.readFile(path.join(destination, 'package.json'))

const src = JSON.parse(packageJSONSrc)
const dest = JSON.parse(packageJSON)

await fs.writeFile(
  path.join(destination, 'package.json'),
  JSON.stringify(
    {
      version: src.version,
      ...dest,
      devDependencies: src.devDependencies,
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
