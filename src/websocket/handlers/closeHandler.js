import db from '../../db/connection.js'
import { activeConnections } from '../utils/verifyToken.js'
import { matchmakingQueue, playerTournamentStatus, playerQueueStatus } from '../handlers/messageHandler.js'

export const closeHandler = async (connection) => {
  try {
    console.log('Client disconnect')

    // Remove connection from activeConnections
    if (activeConnections.delete(connection.userId)) {
      console.log(`Removed connection from activeConnections. Active connections: ${activeConnections.size}`)
    }

    let player = playerQueueStatus.get(connection.userId)

    if (!player && connection.userId) {
      const tournamentStatus = playerTournamentStatus.get(connection.userId)
      if (tournamentStatus) {
        player = { id: connection.userId, socket: connection.socket, ...tournamentStatus }
      }
    }

    if (!player) {
      console.log(`Player ${connection.userId} not  found in queue; no further cancellation needed.`)
      return
    }

    // Find player in queue
    const playerIndex = matchmakingQueue.findIndex((player) => player.socket === connection.socket)
    if (playerIndex !== -1) {
      player = matchmakingQueue[playerIndex]
      console.log(`Removing player ${player.id} from queue`)
      matchmakingQueue.splice(playerIndex, 1)
    }

    // Check if player is in active match
    // console.log('Disconnected player details: ', player)
    if (player.tournament) {
      const tournamentMatch = db.prepare(`
        SELECT * FROM tournament_matches
        WHERE match_status = ?
          AND tournament_id = ?
          AND round = ?
          AND (player1_id = ? OR player2_id = ?)
        `).get('pending', player.tournamentId, player.round, player.id, player.id)

      if (tournamentMatch) {
        console.log(`Tournament match ${tournamentMatch.id} cancelled because player ${player.id} disconnected`)
        db.prepare(`
          UPDATE tournament_matches
          SET match_status = ?, ended_at = datetime('now', 'localtime')
          WHERE id = ?
        `).run('cancelled', tournamentMatch.id)
        const opponentId = tournamentMatch.player1_id === player.id ? tournamentMatch.player2_id : tournamentMatch.player1_id
        const opponent = activeConnections.get(opponentId)
        if (opponent) {
          opponent.socket.send(JSON.stringify({
            type: 'tournamentMatchCancelled',
            message: 'Your opponent has disconnected. Tournament match cancelled.'
          }))
        }
      }
    } else {
      const match = db.prepare(`
        SELECT * FROM matchmaking 
        WHERE match_status = ?
        AND (player1_id = ? OR player2_id = ?)
      `).get('pending', player.id, player.id)

      if (match) {
        console.log(`Match ${match.id} cancelled because player ${player.id} disconnected.`)
        // Update match status to cancelled
        db.prepare(`
          UPDATE matchmaking 
          SET match_status = ?, ended_at = datetime('now')
          WHERE id = ?
        `).run('cancelled', match.id)

        // Determine opponent ID
        const opponentId = match.player1_id === player.id
          ? match.player2_id
          : match.player1_id

        const opponent = matchmakingQueue.find((player) => player.id === opponentId)
        // const opponent = activeConnections.get(opponentId)

        if (opponent) {
          opponent.socket.send(
            JSON.stringify({
              type: 'matchCancelled',
              message: 'Your opponent has disconnected. Match cancelled. '
            })
          )
        }
        console.log(`Notified player ${opponentId} about match cancellation.`)
      }
    }
  } catch (error) {
    console.error('WebSocket error: ', error)
  }
}
