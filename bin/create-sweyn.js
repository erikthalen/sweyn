#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { spawn } from 'node:child_process'

console.log('Create a new sweyn app')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blue: '\x1b[34m',
  black: '\x1b[30m',
  green: '\x1b[32m',
}

const name = process.argv[2]

async function copyTemplateFiles(name) {
  try {
    await fs.cp(
      path.join(import.meta.dirname, '../template'),
      path.join(process.cwd(), name),
      { recursive: true }
    )

    const packageJSON = await fs.readFile(
      path.join(process.cwd(), name, 'package.json')
    )

    await fs.writeFile(
      path.join(process.cwd(), name, 'package.json'),
      JSON.stringify({ name, ...JSON.parse(packageJSON) }, null, 2)
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
      console.log(`Run`)
      console.log(`${colors.reset + colors.green}cd ${name}${colors.reset}`)
      console.log(`${colors.reset + colors.green}pnpm run dev${colors.reset}`)
      console.log(`to get started`)
      process.exit()
    })
  } catch (error) {
    console.log(error)
  }
}

await copyTemplateFiles(name)

// rl.question(
//   `${colors.reset + colors.dim + colors.black}Name of the project: ${
//     colors.reset + colors.blue + colors.underscore
//   }`,
//   async name => {
//     rl.close()

//     try {
//       await fs.cp(
//         path.join(import.meta.dirname, '../template'),
//         path.join(process.cwd(), name),
//         { recursive: true }
//       )

//       console.log(
//         `${colors.reset + colors.green}Successfully created project in /${
//           name + colors.reset
//         }`
//       )

//       process.chdir(name)

//       const s = spawn('pnpm', ['install'])

//       s.stdout.on('data', function (msg) {
//         console.log(msg.toString())
//       })
//     } catch (error) {
//       console.log(error)
//     }
//   }
// )
