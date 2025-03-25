import db from '../db/connection.js'

async function updateUserStats (stats) {
  const endpoint = 'http://localhost:3002/updateStats'
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats)
    })
    return await response.json()
  } catch (error) {
    console.error('Error updating user statistics:', error)
    return { error: 'Statistics update failed' }
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
        SELECT player1_id, player2_id, created_at, started_at, ended_at
        FROM matchmaking
        WHERE id = ?
      `).get(matchId)
      const loserId = match.player1_id === winnerId ? match.player2_id : match.player1_id

      const winnerStats = {
        userId: winnerId,
        won: true,
        opponentId: loserId,
        score: { win: player1Score > player2Score ? player1Score : player2Score },
        matchDate: match.ended_at,
        matchId
      }

      const loserStats = {
        userId: loserId,
        won: false,
        opponentId: winnerId,
        score: { loss: player1Score < player2Score ? player1Score : player2Score },
        matchDate: match.ended_at,
        matchId
      }
      const winUpdate = await updateUserStats(winnerStats)
      const lossUpdate = await updateUserStats(loserStats)

      return reply.code(200).send({
        success: true,
        message: 'Match result and user statistics updated successfully',
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
