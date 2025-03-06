import db from './database.js'

export function initDatabase () {
  // Users table for testing
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
    `).run()

  // Players table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      tournament_id INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_id, tournament_id),
      FOREIGN KEY (player_id) REFERENCES users(id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    )
    `).run()

  // Tournament table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      current_round INTEGER DEFAULT 0,
      size INTEGER NOT NULL,
      registration_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      registration_deadline TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      winner_id TEXT,
      schedule TEXT,
      scores TEXT,
      player_ids TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      started_at TIMESTAMP DEFAULT NULL,
      ended_at TIMESTAMP DEFAULT NULL
    )
    `).run()
}

// Converts from JS objects/arrays to JSON strings
export function serializeTournament (tournament) {
  return {
    ...tournament,
    player_ids: JSON.stringify(tournament.player_ids || []),
    schedule: JSON.stringify(tournament.schedule || []),
    scores: JSON.stringify(tournament.scores || [])
  }
}

// Converts from JSON string to JS objects/arrays
export function deserializeTournament (dbTournament) {
  return {
    ...dbTournament,
    player_ids: JSON.parse(dbTournament.player_ids || []),
    schedule: JSON.parse(dbTournament.schedule || []),
    scores: JSON.parse(dbTournament.scores || [])
  }
}
