import { db } from '../server.config.ts'

export function get(req, res) {
  const { searchParams } = new URL('https://foobar.com' + req.url)

  const id = searchParams.get('id')

  const rows = db.prepare('SELECT * FROM foobar').all()

  return rows
}
