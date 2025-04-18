import db from './database.js'

export function initDatabase () {
  // Users table for testing
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER NOT NULL PRIMARY KEY,
      display_name TEXT,
      avatar TEXT
    )
    `).run()
    
    // Players table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS players (
      player_id INTEGER NOT NULL,
      tournament_id TEXT NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_id, tournament_id),
      FOREIGN KEY (player_id) REFERENCES users(user_id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    )
    `).run()
  
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      current_round INTEGER DEFAULT 0,
      size INTEGER,
      registration_start_time TIMESTAMP,
      registration_deadline TIMESTAMP,
      winner_id TEXT,
      schedule TEXT,
      created_at TIMESTAMP,
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      active INTEGER,
      open INTEGER
    )
    `).run()
  
    
  // Scores table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS scores (
      tournament_id TEXT NOT NULL,
      round_number INTEGER,
      match_index INTEGER,
      winner_id TEXT,
      score TEXT,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP,
      UNIQUE(tournament_id, round_number, match_index),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    )
    `).run()
}

// Converts from JS objects/arrays to JSON strings
// export function serializeTournament (tournament) {
//   return {
//     ...tournament,
//     player_ids: JSON.stringify(tournament.player_ids || []),
//     schedule: JSON.stringify(tournament.schedule || [])
//   }
// }

// // Converts from JSON string to JS objects/arrays
// export function deserializeTournament (dbTournament) {
//   return {
//     ...dbTournament,
//     player_ids: JSON.parse(dbTournament.player_ids || []),
//     schedule: JSON.parse(dbTournament.schedule || [])
//   }
// }

// export function migrateScoresToNewTable () {
//   const tournaments = db.prepare('SELECT id, scores FROM tournaments WHERE scores IS NOT NULL').all()

//   const insertScore = db.prepare(`
//     INSERT INTO scores (tournament_id, round_number, match_index, winner_id, score, completed_at)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `)

//   db.transaction(() => {
//     for (const tournament of tournaments) {
//       const scores = JSON.parse(tournament.scores || '[]')

//       for (let round = 0; round < scores.length; round++) {
//         const roundMatches = scores[round] || []

//         for (let matchIndex = 0; matchIndex < roundMatches.length; matchIndex++) {
//           const match = roundMatches[matchIndex]
//           if (match && match.winner) {
//             insertScore.run(
//               tournament.id,
//               round + 1,
//               matchIndex,
//               match.winner,
//               match.score,
//               match.completedAt
//             )
//           }
//         }
//       }
//     }
//   })()
// }
