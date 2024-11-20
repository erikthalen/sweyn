import fs from 'node:fs/promises'

export async function getFilenamesInDirectory(dir) {
  try {
    return await fs.readdir(dir)
  } catch (error) {
    return []
  }
}
