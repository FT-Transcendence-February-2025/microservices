import db from './database.js'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(path.dirname(db.name), '..')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {
    recursive: true
  })
}

export function initDatabase () {
  // Users table for testing
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
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
      registration_start_time INTEGER NOT NULL,
      registration_deadline INTEGER NOT NULL,
      winner_id TEXT,
      schedule TEXT,
      scores TEXT,
      player_ids TEXT,
      created_at INTEGER NOT NULL,
      started_at INTEGER,
      ended_at INTEGER
    )
    `).run()

  console.log('Database initialized successfully')
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
