import { readFile } from 'fs/promises'
import { normalize, join, resolve, extname } from 'path'

const DOUBLE_CURLY_BRACKETS = /\{{(.*?)\}}/g // {{ foo }}
const DOUBLE_SQUARE_BRACKETS = /\[\[(.*?)\]]/g // [[ foo ]]
const DOUBLE_TAGS = /\<<(.*?)\>>/g // << foo >>

let extension = '.html'

const partialPaths = ['pages', 'snippets']
const layoutPaths = ['', 'layouts']

const getFile = name => async path => {
  const fileName = extname(name) ? name : name + extension
  return await readFile(join(resolve(path), normalize(fileName)), {
    encoding: 'utf8',
  })
}

const renderLayout = async (fileContent: string, layout = 'index') => {
  try {
    const layoutfile = await Promise.any(layoutPaths.map(getFile(layout)))

    const slot = '<slot></slot>'

    return layoutfile.replace(slot, fileContent)
  } catch (error) {
    return fileContent
  }
}

const renderPartials = async fileString => {
  const matches = [...fileString.matchAll(DOUBLE_SQUARE_BRACKETS)]

  if (!matches.length) return fileString

  let output = fileString

  await Promise.all(
    matches.map(async ([match, name]) => {
      let content

      try {
        content = await Promise.any(partialPaths.map(getFile(name.trim())))
      } catch (error) {
        content = ''
        console.log('404 - Missing partial: ' + match)
      }

      output = output.replace(match, content || '')
      return
    })
  )

  return await renderPartials(output)
}

export const renderVariables = (fileString, data = {}) => {
  const matches = [...fileString.matchAll(DOUBLE_CURLY_BRACKETS)]

  if (!matches.length) return fileString

  return matches.reduce(
    (acc, [match, variable]) =>
      acc.replaceAll(match, data[variable.trim()] || ''),
    fileString
  )
}

export const renderFileString = async (fileString, data?) => {
  const layout = await renderLayout(fileString)
  const partial = await renderPartials(layout)
  const result = renderVariables(partial, data)

  return result
}

export const renderFile = async (name, data?): Promise<string> => {
  try {
    const filePromises = await Promise.allSettled(
      partialPaths.map(getFile(name))
    )

    const file = filePromises.find(p => p.status === 'fulfilled')?.value || ''

    return renderFileString(file, data)
  } catch (error) {
    console.log(error)
    throw '500 - Found no partial to render: ' + name
  }
}
