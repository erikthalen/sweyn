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

export function authenticate(req, res, login) {
  const { authorization } = req.headers

  if (!authorization) {
    res.setHeader('WWW-Authenticate', 'Basic')
    throw { status: 401, message: 'Not authorized' }
  }

  const [_, encodedLogin] = authorization.split(' ')
  const [user, pw] = Buffer.from(encodedLogin, 'base64')
    .toString('ascii')
    .split(':')

  if (user === login.username && pw === login.password) {
    return true
  } else {
    res.setHeader('WWW-Authenticate', 'Basic')
    throw { status: 401, message: 'Not authorized' }
  }
}