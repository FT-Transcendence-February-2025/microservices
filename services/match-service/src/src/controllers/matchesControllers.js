import db from '../db/connection.js'
import config from '../config/config.js'

async function updateUserStats (stats) {
  const endpoint = `${config.endpoints.user}/update-match-history`
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

      let winnerScore, loserScore
      if (match.player1_id === winnerId) {
        winnerScore = player1Score
        loserScore = player2Score
      } else {
        winnerScore = player2Score
        loserScore = player1Score
      }

      const winnerStats = {
        userId: winnerId,
        opponentId: loserId,
        userScore: winnerScore,
        opponentScore: loserScore,
        matchDate: match.ended_at
      }

      const loserStats = {
        userId: loserId,
        opponentId: winnerId,
        userScore: loserScore,
        opponentScore: winnerScore,
        matchDate: match.ended_at
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
