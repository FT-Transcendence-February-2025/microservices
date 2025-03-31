/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed (knex) {
  // Deletes ALL existing entries
  await knex('matchmaking').del()

  await knex('matchmaking').insert([
    {
      player1_id: 1,
      player2_id: 2,
      match_status: 'completed',
      started_at: knex.fn.now(),
      ended_at: knex.fn.now(),
      winner_id: 1,
      player1_score: 5,
      player2_score: 3,
      room_code: 'MATCH001'
    },
    {
      player1_id: 1,
      player2_id: 2,
      match_status: 'in_progress',
      started_at: knex.fn.now(),
      room_code: 'MATCH002'
    }
  ])
}
