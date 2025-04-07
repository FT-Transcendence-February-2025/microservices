import db from '../db/connection.js'

async function updateUserStats (stats) {
  const endpoint = 'http://localhost:3002/update-match-history'
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

export const tournamentMatchesController = {
  async postTournamentMatch (request, reply) {
    const { tournamentId, schedule } = request.body
    if (!tournamentId || !schedule) {
      return reply.code(400).send({
        success: false,
        message: 'Missing required parameters'
      })
    }

    try {
      const insertStmt = db.prepare(`
          INSERT INTO tournament_matches (tournament_id, round, player1_id, player2_id, created_at, room_code)
          VALUES (?, ?, ?, ?, datetime('now', 'localtime'), NULL)
        `)

      const insertMany = db.transaction((schedule) => {
        for (let roundIndex = 0; roundIndex < schedule.length; roundIndex++) {
          const roundMatches = schedule[roundIndex]
          const round = roundIndex + 1
          for (const match of roundMatches) {
            const [player1Id, player2Id] = match
            insertStmt.run(tournamentId, round, player1Id, player2Id)
          }
        }
      })

      insertMany(schedule)

      return reply.code(200).send({
        success: true,
        message: 'Tournament matches saved successfully'
      })
    } catch (error) {
      console.error('Error saving tournament matches:', error)
      return reply.code(500).send({
        success: false, message: 'Error saving tournament matches'
      })
    }
  },

  async tournamentMatchResults (request, reply) {
    try {
      const { matchId, tournamentId, player1Score, player2Score, winnerId } = request.body

      if (!matchId || !tournamentId || player1Score === undefined || player2Score === undefined || !winnerId) {
        return reply.code(400).send({
          success: false,
          message: 'Missing required parameters in tournamentMAtchResults'
        })
      }

      const stmt = db.prepare(`
        UPDATE tournament_matches
        SET match_status = 'completed',
          ended_at = datetime('now','localtime'),
          player1_score = ?,
          player2_score = ?,
          winner_id = ?
        WHERE id = ?
        `)
      stmt.run(player1Score, player2Score, winnerId, matchId)

      const tournamentMatch = db.prepare(`
        SELECT player1_id, player2_id, created_at, started_at, ended_at
        FROM tournament_matches
        WHERE id = ?
      `).get(matchId)

      const loserId = tournamentMatch.player1_id === winnerId ? tournamentMatch.player2_id : tournamentMatch.player1_id

      let winnerScore, loserScore
      if (tournamentMatch.player1_id === winnerId) {
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
        tournamentMatchDate: tournamentMatch.ended_at
      }

      const loserStats = {
        userId: loserId,
        opponentId: winnerId,
        userScore: loserScore,
        opponentScore: winnerScore,
        tournamentMatchDate: tournamentMatch.ended_at
      }
      const winUpdate = await updateUserStats(winnerStats)
      const lossUpdate = await updateUserStats(loserStats)

      return reply.code(200).send({
        success: true,
        message: 'Tournament match results and user statistics updated successfully',
        winUpdate,
        lossUpdate
      })
    } catch (error) {
      console.error('Error saving tournament match results:', error)
      return reply.code(500).send({
        success: false,
        message: 'Failed to save tournament match results'
      })
    }
  }
}
