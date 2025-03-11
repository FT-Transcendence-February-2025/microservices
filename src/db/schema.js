import db from './database.js'

export function initTournament(){
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_by TEXT,
      current_round INTEGER DEFAULT 0,
      size INTEGER DEFAULT 0,
      registration_start_time INTEGER DEFAULT 0,
      registration_deadline INTEGER DEFAULT 0,
      winner_id TEXT,
      schedule TEXT,
      scores TEXT,
      player_ids TEXT,
      created_at INTEGER DEFAULT 0,
      started_at INTEGER DEFAULT 0,
      ended_at INTEGER DEFAULT 0
    )
    `).run()
}

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
