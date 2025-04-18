import db from '../../db/connection.js'
import { activeConnections } from '../utils/verifyToken.js'
import { playerTournamentStatus, playerQueueStatus, matchAcceptances } from '../handlers/messageHandler.js'

export async function matchCancelled (data, _connection) {
  if (data.tournamentId) {
    const tournamentMatch = db.prepare(`
      SELECT * FROM tournament_matches
      WHERE id = ? AND match_status = 'pending'
    `).get(data.matchId)
    if (tournamentMatch) {
      db.prepare(`
        UPDATE tournament_matches
        SET match_status = 'cancelled', ended_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(data.matchId);
      [tournamentMatch.player1_id, tournamentMatch.player2_id].forEach((playerId) => {
        const conn = activeConnections.get(playerId)
        if (conn && conn.socket.readyState === 1) {
          conn.socket.send(JSON.stringify({
            type: 'matchCancelled',
            message: 'Your tournament match has been cancelled.'
          }))
        }
      })
      if (matchAcceptances[tournamentMatch.id]) {
        delete matchAcceptances[tournamentMatch.id]
      }

      playerQueueStatus.delete(tournamentMatch.player1_id)
      playerQueueStatus.delete(tournamentMatch.player2_id)

      playerTournamentStatus.delete(tournamentMatch.player1_id)
      playerTournamentStatus.delete(tournamentMatch.player2_id)
    }
  } else {
    const match = db.prepare(`
      SELECT * FROM matchmaking
      WHERE id = ? AND match_status = 'pending'
    `).get(data.matchId)
    if (match) {
      db.prepare(`
        UPDATE matchmaking
        SET match_status = 'cancelled', ended_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(data.matchId);
      [match.player1_id, match.player2_id].forEach((playerId) => {
        const conn = activeConnections.get(playerId)
        if (conn && conn.socket.readyState === 1) {
          conn.socket.send(JSON.stringify({
            type: 'matchCancelled',
            message: 'Your match has been cancelled.'
          }))
        }
      })
      if (matchAcceptances[match.id]) {
        delete matchAcceptances[match.id]
      }

      playerQueueStatus.delete(match.player1_id)
      playerQueueStatus.delete(match.player2_id)
    }
  }
}
