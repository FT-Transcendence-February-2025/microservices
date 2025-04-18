import db from '../../db/connection.js'
import { matchmakingQueue, playerTournamentStatus, playerQueueStatus } from '../handlers/messageHandler.js'

export function leaveQueue (data, connection) {
  const player = playerQueueStatus.get(connection.userId)
  if (!player) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'You are not in the queue'
    }))
    return
  }
  playerQueueStatus.delete(connection.userId)
  playerTournamentStatus.delete(connection.userId)

  // Remove the player from the matchmaking queue if present
  const index = matchmakingQueue.findIndex(p => p.id === connection.userId)
  if (index !== -1) {
    matchmakingQueue.splice(index, 1)
  }

  // If the player in pending match, cancel the match accordingly
  if (player.tournament) {
    const tournamentMatch = db.prepare(`
      SELECT * FROM tournament_matches
      WHERE match_status = ? AND (player1_id = ? OR player2_id = ?)
    `).get('pending', player.id, player.id)
    if (tournamentMatch) {
      db.prepare(`
        UPDATE tournament_matches
        SET match_status = ?, ended_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run('cancelled', tournamentMatch.id)
    }
  } else {
    const match = db.prepare(`
      SELECT * FROM matchmaking
      WHERE match_status = ? AND (player1_id = ? OR player2_id = ?)
    `).get('pending', player.id, player.id)
    if (match) {
      db.prepare(`
        UPDATE matchmaking
        SET match_status = ?, ended_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run('cancelled', match.id)
    }
  }
  connection.socket.send(JSON.stringify({
    type: 'leaveQueue',
    message: 'You have successfully left the queue.'
  }))
}
