# Database

There's a small api for handling SQLite databases, build in.

It uses [better-sqlite3](https://github.com/WiseLibs/better-sqlite3).

```ts
import { createDatabase } from './.sweyn/index.ts'

const { db, createTable } = createDatabase('database.db')

createTable('users', {
  first_name: 'string',
  last_name: 'string',
})

db.prepare('INSERT INTO users (first_name, last_name) VALUES (?, ?)').run(
  'John',
  'Doe'
)

const user = db.prepare('SELECT * FROM users WHERE first_name = ?').get('John')

// user = {
//   id: 1,
//   created_at: '2024-11-22 10:51:05',
//   first_name: 'John',
//   last_name: 'Doe'
// }
```

## Backup

To create backups of all databases, the `https://<site_url>/db/backup` can be hit.

It will create backup files in a folder called `./backups`.

