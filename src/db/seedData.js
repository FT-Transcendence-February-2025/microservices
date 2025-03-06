import db from './database.js'
import { serializeTournament } from './schema.js'

function seedDatabase () {
  console.log('Seeding database... THIS IS A TEST')

  try {
    // Users test
    const userInsert = db.prepare('INSERT INTO users (name) VALUES (?)')
    const user1Id = userInsert.run('Player One').lastInsertRowid
    const user2Id = userInsert.run('Player Two').lastInsertRowid
    const user3Id = userInsert.run('Player Three').lastInsertRowid
    const user4Id = userInsert.run('Player Four').lastInsertRowid

    console.log(`Added users with IDs: ${user1Id}, ${user2Id}, ${user3Id}, ${user4Id}`)

    // Create test tournament
    const tournamentData = {
      name: 'Test Tournament 1',
      created_by: 'Admin',
      size: 8,
      registration_start_time: new Date().toISOString(),
      registration_deadline: new Date(Date.now() + 86400000).toISOString(),
      player_ids: [],
      schedule: [
        // { round: 1, matches: [{ player1: user1Id, player2: user2Id }] }
        {}
      ],
      scores: [],
      started_at: null,
      endend_at: null
    }

    const serializedTournament = serializeTournament(tournamentData)
    const tournamentInsert = db.prepare(`
        INSERT INTO tournaments
        (name, created_by, size, registration_start_time, registration_deadline, schedule, scores)
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `)
    const tournamentId = tournamentInsert.run(
      serializedTournament.name,
      serializedTournament.created_by,
      serializedTournament.size,
      serializedTournament.registration_start_time,
      serializedTournament.registration_deadline,
      serializedTournament.schedule,
      serializedTournament.scores
    ).lastInsertRowid

    console.log(`Added tournament with ID: ${tournamentId}`)

    // // Add players to tournament
    // const playerInsert = db.prepare('INSERT INTO players (player_id, tournament_id) VALUES(?, ?)')
    // playerInsert.run(user1Id, tournamentId)
    // playerInsert.run(user2Id, tournamentId)

    // console.log(`Added players ${user1Id} and ${user2Id} to tournament ${tournamentId}`)

    // console.log('\nVerifying inserted data:')

    // const users = db.prepare('SELECT * from users').all()
    // console.log('Users:', users)

    // const players = db.prepare('SELECT * FROM players').all()
    // console.log('Players:', players)

    // const tournamentPlayers = db.prepare(`
    //   SELECT u.id, u.name, p.tournament_id, p.joined_at
    //   FROM players p
    //   JOIN users u ON p.player_id = u.id
    //   WHERE p.tournament_id = ?
    // `).all(tournamentId)

    // console.log('\nTournament Players:', tournamentPlayers)
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}

export { seedDatabase }
