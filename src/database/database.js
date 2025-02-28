import knex from 'knex';
import path from 'path';

const database = knex({
  client: 'sqlite3',
  connection: {
		// TODO: change this hardcoded path - use 'url' package
    filename: path.resolve('/home/sfrankie/ft_transcendence/authentication/src/database/database.sqlite')
  },
  useNullAsDefault: true
});

export default database;
