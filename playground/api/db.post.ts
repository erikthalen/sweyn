import { readBody } from 'sweyn/server.ts'
import { db } from './../server.config.ts'

export async function set(req, res) {
  const body = await readBody(req)
  const clean = decodeURIComponent(body.replace('+', ' '))
  const data = clean.split('&').map(v => v.split('='))
  const entries = Object.fromEntries(data)

  const changes = db
    .prepare('INSERT INTO foobar (first) VALUES (?)')
    .run(entries.data)

  return changes
}
