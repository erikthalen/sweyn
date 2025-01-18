import fs from 'node:fs/promises'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { registerRoute } from './routes.ts'

let dbs: { name: string; db: DatabaseSync }[] = []

async function backupDatabases() {
  if (!(await fs.stat('./backups').catch(e => false))) {
    await fs.mkdir('./backups')
  }

  dbs.forEach(async ({ name, db }) => {
    const { name: dbname } = path.parse(name)

    const filename = `./backups/${dbname}-${Date.now()}.db`
    db.exec(`VACUUM INTO '${filename}';`)

    console.log('Done backing up:', filename)
  })
}

export default function createDatabase(name = 'data.db') {
  const db = new DatabaseSync(name)

  dbs.push({ name, db })

  // db.pragma('journal_mode = WAL')

  registerRoute({
    route: '/db/backup',
    handler: async () => {
      try {
        await backupDatabases()

        return { code: 200, message: 'Database(s) backed up successfully!' }
      } catch (error) {
        console.log('backup failed:', error)
      }
    },
  })

  process.on('exit', () => db.close())
  process.on('SIGHUP', () => process.exit(128 + 1))
  process.on('SIGINT', () => process.exit(128 + 2))
  process.on('SIGTERM', () => process.exit(128 + 15))

  function createTable(tableName: string, columns: Record<string, string>) {
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

    db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (${cols});`)
  }

  return { db, createTable }
}
