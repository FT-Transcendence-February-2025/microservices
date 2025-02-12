import knex from 'knex';
import path from 'path';

const database = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve('/home/sfrankie/user_management/src/database/database.sqlite')
  },
  useNullAsDefault: true
});

export default database;
