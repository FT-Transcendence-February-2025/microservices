import db from '../db/connection.js'

async function updateUserStats (userId, won) {
  const endpoint = 'http://localhost:3002/updateStats'
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, won })
    })
    return await response.json()
  } catch (error) {
    console.error('Error updating user stats:', error)
    return { error: 'Update failed' }
  }
}

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

      const match = db.prepare(`
        SELECT player1_id, player2_id
        FROM matchmaking
        WHERE id = ?
      `).get(matchId)
      const loserId = match.player1_id === winnerId ? match.player2_id : match.player1_id

      const winUpdate = await updateUserStats(winnerId, true)
      const lossUpdate = await updateUserStats(loserId, false)

      return reply.code(200).send({
        success: true,
        message: 'Match result saved successfully',
        winUpdate,
        lossUpdate
      })
    } catch (error) {
      console.error('Error saving match results:', error)
      return reply.code(500).send({
        success: false,
        message: 'Failed to save match results'
      })
    }
  }
}
