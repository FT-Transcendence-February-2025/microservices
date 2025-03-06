import db from './database.js'

export const tournamentService = {
  // Player registration
  registerPlayer (tournamentId, playerId) {
    try {
      // User exists?
      const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(playerId)
      console.log(`USER: ${JSON.stringify(userExists)}`)
      if (!userExists) {
        return {
          success: false,
          error: 'User not found',
          message: `Cannot register player ID ${playerId}`
        }
      }

      // TODO: check if tournament exists
      const tournamentExists = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
      if (!tournamentExists) {
        return {
          success: false,
          error: 'Tournament not found',
          message: `Cannot register for tournament ID ${tournamentId}: tournament does not exists`
        }
      }

      // Insert player into tournament
      try {
        db.prepare(
          'INSERT INTO players (player_id, tournament_id) VALUES (?, ?)'
        ).run(playerId, tournamentId)

        return {
          success: true,
          message: `Player ${playerId} successfully registered for tournament ${tournamentId}`
        }
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          return {
            success: false,
            error: 'Already registered',
            message: `Player ${playerId} is already registered for tournament ${tournamentId}`
          }
        }
        throw error
      }
    } catch (error) {
      return {
        success: false,
        error: 'Database error',
        message: error.message
      }
    }
  },

  unregisterPlayer (tournamentId, playerId) {
    const result = db.prepare(
      'DELETE FROM players WHERE tournament_id = ? AND player_id = ?'
    ).run(tournamentId, playerId)

    return result.changes > 0
  }
}
