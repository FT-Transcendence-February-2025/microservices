/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed (knex) {
  // Deletes ALL existing entries
  await knex('users').del()

  await knex('users').insert([
    {
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123'
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      password: 'password123'
    },
    {
      username: 'user3',
      email: 'user3@example.com',
      password: 'password123'
    },
    {
      username: 'user4',
      email: 'user4@example.com',
      password: 'password123'
    }
  ])
}
