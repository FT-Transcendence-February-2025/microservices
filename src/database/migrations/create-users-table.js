import database from '../database.js'

const createUsersTable = async () => {
	try {
		await database.schema.createTable('users', (table) => {
			table.integer('id').primary();
			table.string('avatarPath').notNullable();
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