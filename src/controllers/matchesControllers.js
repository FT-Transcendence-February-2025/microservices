import db from '../db/connection.js'

export const matchesController = {
  async postMatchResults (request, reply) {
    try {
      const { matchId, player1Score, player2Score, winnerId } = request.body

      if (!matchId || player1Score === undefined || player2Score === undefined || !winnerId) {
        return reply.code(400).send({
          success: false,
          message: 'Missing required parameters'
        })
      }

      const stmt = db.prepare(`
        UPDATE matchmaking
        SET match_status = 'completed',
          ended_at = datetime('now'),
          player1_score = ?,
          player2_score = ?,
          winner_id = ?
        WHERE id = ?
        `)

      stmt.run(player1Score, player2Score, winnerId, matchId)

      return {
        success: true,
        message: 'Match result saved successfully'
      }
    } catch (error) {
      console.error('Error saving match results:', error)
      return reply.code(500).send({
        success: false,
        message: 'Failed to save match results'
      })
    }
  }
}
