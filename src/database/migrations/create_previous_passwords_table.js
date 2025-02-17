import database from '../database.js'

const createPreviousPasswordsTable = async () => {
    try {
        await database.schema.createTable('previous-passwords', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('password_hash').notNullable();
            table.timestamp('created_at').defaultTo(database.fn.now());
        });
        console.log('Previous passwords table created');
    } catch (error) {
        console.error('Error creating previous passwords table:', error);
    } finally {
        await database.destroy();
    }
};

(async () => {
    await createPreviousPasswordsTable();
})();