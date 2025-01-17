#!/usr/bin/env node
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blue: '\x1b[34m',
  black: '\x1b[30m',
  green: '\x1b[32m',
}

console.log(
  `${colors.reset + colors.blue}Create a new sweyn app${colors.reset}`
)

const name = process.argv[2]

if (fsSync.existsSync(path.join(process.cwd(), name))) {
  console.warn(`The folder ${path.join(process.cwd(), name)} already exists`)
  console.error('Aborting')
  process.exit(1)
}

async function copyTemplateFiles(name) {
  try {
    await fs.cp(
      path.join(import.meta.dirname, '../template'),
      path.join(process.cwd(), name),
      { recursive: true }
    )

    /**
     * update name in package.json
     */
    const packageJSON = await fs.readFile(
      path.join(process.cwd(), name, 'package.json')
    )

    await fs.writeFile(
      path.join(process.cwd(), name, 'package.json'),
      JSON.stringify({ name, ...JSON.parse(packageJSON) }, null, 2)
    )

    /**
     * update <title> in index.html
     */
    const indexHTML = await fs.readFile(
      path.join(process.cwd(), name, 'index.html'),
      { encoding: 'utf8' }
    )

    await fs.writeFile(
      path.join(process.cwd(), name, 'index.html'),
      indexHTML.replace('<title>sweyn-app</title>', `<title>${name}</title>`)
    )

    console.log(
      `${colors.reset + colors.green}Successfully created project in /${
        name + colors.reset
      }`
    )

    console.log(
      `${colors.reset + colors.dim}Installing required packages...${
        colors.reset
      }`
    )

    process.chdir(name)

    const s = spawn('pnpm', ['install'], { stdio: 'inherit' })

    s.on('close', code => {
      console.log('')
      console.log(`${colors.reset + colors.blue}Run:${colors.reset}`)
      console.log(`${colors.reset + colors.green}$ cd ${name}${colors.reset}`)
      console.log(`${colors.reset + colors.green}$ pnpm run dev${colors.reset}`)
      console.log(`${colors.reset + colors.blue}to get started${colors.reset}`)
      console.log('')
      process.exit()
    })
  } catch (error) {
    console.log(error)
  }
}

await copyTemplateFiles(name)
