import type { ObjectEncodingOptions } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function getFilenamesInDirectory(
  dir,
  options?:
    | (ObjectEncodingOptions & {
        withFileTypes?: false | undefined
        recursive?: boolean | undefined
      })
    | BufferEncoding
    | null
) {
  try {
    const files = await fs.readdir(dir, options)
    return files.filter(file => file !== '.DS_Store')
  } catch (error) {
    return []
  }
}

export function isNotFolder(filename) {
  return path.extname(filename) !== ''
}
