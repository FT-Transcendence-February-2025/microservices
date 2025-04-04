import db from './connection.js'

export function initDatabase () {
  // Create matchmaking table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS matchmaking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER NOT NULL,
      match_status TEXT CHECK(match_status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
      winner_id INTEGER,
      player1_score INTEGER DEFAULT 0,
      player2_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      ended_at DATETIME,
      room_code TEXT UNIQUE
    )
  `).run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS tournament_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER NOT NULL,
      match_status TEXT CHECK(match_status IN('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
      winner_id INTEGER,
      player1_score INTEGER DEFAULT 0,
      player2_score INTEGER DEFAULT 0,
      created_at DATETIME,
      started_at DATETIME,
      ended_at DATETIME,
      room_code TEXT UNIQUE
    )
    `).run()
}
