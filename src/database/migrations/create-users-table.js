import database from '../database.js'

const createUsersTable = async () => {
  try {
    await database.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('displayName').notNullable().unique();
      table.string('password').notNullable();
    });
    console.log('Users table created');
  } catch (error) {
    console.error('Error creating users table:', error);
  } finally {
    await database.destroy();
  }
};

(async () => {
  await createUsersTable();
})();