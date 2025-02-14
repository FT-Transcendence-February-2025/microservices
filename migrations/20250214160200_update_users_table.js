
export function up(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('password').notNullable();
  });
}


export function down(knex) {
  return knex.schema.alterTable('users', (table) => {
	// Remove the column in case of rollback
	table.dropColumn('password');
  });
}
