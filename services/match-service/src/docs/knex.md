# Knex

## Explanations

In `package.json` file:

```json
...
{
  "scripts": {
    "migrate": "knex migrate:latest",
    "migrate:make": "knex migrate:make",
    "migrate:rollback": "knex migrate:rollback"
  }
}
...
```

- `migrate`: Runs the command `knex migrate:latest`, which applies all pending migrations to the database. Migrations are scripts that make changes to the database schema, such as creating or altering tables. Running this command ensures that your database schema is up-to-date with the latest changes defines in your migrations files

- `migrate:make`: Run the command `knex migrate:make`, which creates a new migration file.

  - Usage: `migrate:make create_users_table`. This will create a new migration file for creating a users table

- `migrate:rollback`: Runs the command `knex migrate:rollback`, which rolls back the most recently applied migratoin. This is useful for undoing changes if state.

This scripts simplify the process of managing database migrations.

## Example usage

Run `npm migrate:make <tablename>

Inside the file created you can modify it, it would look something like this:

```javascript
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('email').notNullable().unique();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
```

Then run the migrations with:

```bash
npm run migrate
```
