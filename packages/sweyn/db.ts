import Database from 'better-sqlite3'
import { registerRoute, routes } from './routes.ts'

export function createDatabase(filename = './db.sqlite') {
  const db = new Database(filename)

  db.pragma('journal_mode = WAL')

  registerRoute({
    route: '/db/backup',
    handler: async (req, res) => {
      try {
        const filename = `./backups/backup-${Date.now()}.db`

        await db.backup(filename)

        return { code: 200, message: filename + ' saves successfully!' }
      } catch (error) {
        console.log('backup failed:', error)
      }
    },
  })

  process.on('exit', () => db.close())
  process.on('SIGHUP', () => process.exit(128 + 1))
  process.on('SIGINT', () => process.exit(128 + 2))
  process.on('SIGTERM', () => process.exit(128 + 15))

  function createTable(name, columns) {
    const defaults = {
      id: 'integer primary key autoincrement',
      created_at: "date default (datetime('now'))",
    }

    const cols = Object.entries({ ...defaults, ...columns }).reduce(
      (acc, cur, i, arr) => {
        return `${acc}\n${cur[0]} ${cur[1]}${i !== arr.length - 1 ? ',' : ''}`
      },
      ''
    )

    db.exec(`CREATE TABLE IF NOT EXISTS ${name} (${cols});`)
  }

  return {
    db,
    createTable,
  }
}
