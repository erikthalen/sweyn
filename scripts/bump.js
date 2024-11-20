import fs from 'node:fs/promises'

const rootPackageJSONFile = await fs.readFile('./package.json')
const rootPackageJSON = JSON.parse(rootPackageJSONFile)

const [major, minor, patch] = rootPackageJSON.version.split('.').map(v => parseInt(v))

const newVersion = [major, minor, patch + 1].join('.')

delete rootPackageJSON.version

await fs.writeFile(
  './package.json',
  JSON.stringify(
    {
      version: newVersion,
      ...rootPackageJSON,
    },
    null,
    2
  )
)

console.log('Bumped root version to: ' + newVersion)
