import { marked } from 'marked'
import fs from 'fs/promises'
import path from 'path'
import { renderLayout } from './renderer.ts'

try {
  await fs.rm('./dist', { recursive: true })
} catch (error) {}

try {
  await fs.mkdir('./dist')
} catch (error) {
  process.exit(1)
}

let filenames: string[] = []

try {
  const files = await fs.readdir('./content', { recursive: true })
  filenames = files.filter(file => file !== '.DS_Store')
} catch (error) {
  process.exit(1)
}

const fileContents = await Promise.all(
  filenames.map(async filename => {
    const fileContent = await fs.readFile(path.join('./content', filename), {
      encoding: 'utf8',
    })
    const parsedHTML = await marked.parse(fileContent)
    const parsedHTMLFile = await renderLayout(parsedHTML)
    const { name } = path.parse(filename)

    await fs.writeFile(path.join('./dist', name + '.html'), parsedHTMLFile)
  })
)

// console.log(parsedHTMLContent)
