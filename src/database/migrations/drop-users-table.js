import database from '../database.js';

const dropUsersTable = async () => {
  try {
    const exists = await database.schema.hasTable('users');
    if (exists) {
      await database.schema.dropTable('users');
      console.log('Users table dropped');
    } else {
      console.log('Users table does not exist');
    }
  } catch (err) {
    console.error('Error dropping users table:', err);
  } finally {
    await database.destroy(); // Close the database connection
  }
};

dropUsersTable();
