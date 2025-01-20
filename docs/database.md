# Database

The framework provides a small API for handling **SQLite databases**, powered by the [node:sqlite](https://nodejs.org/api/sqlite.html) library. It allows you to easily create and interact with SQLite databases directly in your server-side code.

The **database instance (`db`)** returned by `createDatabase()` is an instance of the `DatabaseSync` class from [node:sqlite](https://nodejs.org/api/sqlite.html). This gives you access to all the features and methods provided by `node:sqlite` for querying and managing your SQLite database.

## Creating and Managing Databases

You can create and interact with an SQLite database by using the `createDatabase()` function. This function provides access to the database instance (`db`) and a method to create tables (`createTable()`).

### Example: Creating a Database and Table

```ts
import { createDatabase } from './.sweyn/index.ts';

// Create a database (SQLite file) named 'database.db'
const { db, createTable } = createDatabase('database.db');

// Create a 'users' table with fields for first and last name
createTable('users', {
  first_name: 'string',
  last_name: 'string',
});

// Insert a new record into the 'users' table
db.prepare('INSERT INTO users (first_name, last_name) VALUES (?, ?)').run(
  'John',
  'Doe'
);

// Fetch the record where the first name is 'John'
const user = db.prepare('SELECT * FROM users WHERE first_name = ?').get('John');

// The resulting user object will look like this:
console.log(user);
// {
//   id: 1,
//   created_at: '2024-11-22 10:51:05',
//   first_name: 'John',
//   last_name: 'Doe'
// }
```

### Explanation:
- **`createDatabase('database.db')`**: This creates a new SQLite database file named `database.db`.
- **`createTable('users', {...})`**: Defines a `users` table with columns `first_name` and `last_name`.
- **`db.prepare(...).run(...)`**: Inserts a new user into the table.
- **`db.prepare(...).get(...)`**: Retrieves the user record with the first name "John".

### `db` – Instance of [node:sqlite](https://nodejs.org/api/sqlite.html)

The `db` object returned by `createDatabase()` is an instance of the `Database` class from the [node:sqlite](https://nodejs.org/api/sqlite.html) library. It allows you to perform SQL operations, such as:

- **Preparing statements**: `db.prepare()` allows you to prepare SQL statements, which you can execute using `.run()` for inserts/updates, `.get()` for fetching a single row, or `.all()` for fetching multiple rows.
- **Transactions**: You can use `db.transaction()` to wrap multiple queries in a transaction, ensuring they are executed atomically.

For full documentation on `node:sqlite` and its methods, refer to the official [node:sqlite page](https://nodejs.org/api/sqlite.html).

## Backup Database

To create a backup of all databases, you can trigger the backup functionality by sending a request to the `/db/backup` route. This will create backup copies of all the databases in a folder called `./backups`.

### Example: Creating a Database Backup

To create a backup, simply visit the following URL:

```
https://<site_url>/db/backup
```

This request will trigger the creation of backup files in the `./backups` directory on the server. The backups are stored as `.db` files, which you can use for restoration or archiving purposes.

### Backup Location

All backup files will be stored in the `./backups` folder, relative to the root of your project.

### Restoring from Backup

You can manually restore the database from a backup by copying the backup file over the existing database file (e.g., `database.db`), or by using an SQLite tool to import the backup file directly.
