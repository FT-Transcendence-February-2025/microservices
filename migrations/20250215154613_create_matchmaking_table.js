export function up(knex) {
  return knex.schema.createTable('matchmaking', (table) => {
    // Primary key
    table.increments('id').primary();
    // Player Reference columns
    table.integer('player1_id').notNullable();
    table.integer('player2_id').notNullable();
    // Status and timestamps columns
    table
      .enu('match_status', ['pending', 'in_progress', 'completed', 'cancelled'])
      .defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('started_at');
    table.timestamp('ended_at');
    // Winner and scores
    table.integer('winner_id');
    table.integer('player1_score').defaultTo(0);
    table.integer('player2_score').defaultTo(0);
    // Room code
    table.string('room_code').unique();
    // Foreing key contraints
    table.foreign('player1_id').references('id').inTable('users');
    table.foreign('player2_id').references('id').inTable('users');
    table.foreign('winner_id').references('id').inTable('users');
  });
}

export function down(knex) {
  return knex.schema.dropTable('matchmaking');
}
