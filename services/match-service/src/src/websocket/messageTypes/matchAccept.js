import db from '../../db/connection.js'
import { startGameForMatch } from '../utils/startGame.js'
import { getOpponentDetails } from '../utils/getOpponentDetails.js'
import { activeConnections } from '../utils/verifyToken.js'
import { playerTournamentStatus, playerQueueStatus } from '../handlers/messageHandler.js'

export async function tournamentMatchAccept (data, connection, matchAcceptances) {
  if (!playerTournamentStatus.has(connection.userId)) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'You are not registered in the tournament queue'
    }))
    return
  }

  const currentPlayer = activeConnections.get(connection.userId)
  const displayName = currentPlayer ? currentPlayer.displayName : null
  const round = data.round
  const tournamentMatch = db.prepare(`
      SELECT *, tournament_id AS tournamentId
      FROM tournament_matches
      WHERE tournament_id = ? AND match_status = ?
        AND (player1_id = ? OR player2_id = ?)
      `).get(data.tournamentId, 'pending', connection.userId, connection.userId)

  if (!tournamentMatch) {
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'Tournament match not found or no longer available'
      })
    )
    return
  }
  if (!matchAcceptances[tournamentMatch.id]) {
    console.log('Creating acceptance tracker for tournament match:', tournamentMatch.id)
    matchAcceptances[tournamentMatch.id] = new Set()
  }
  matchAcceptances[tournamentMatch.id].add(connection.userId)
  console.log('Current accepted players for tournament match', tournamentMatch.id, ':',
    Array.from(matchAcceptances[tournamentMatch.id])
  )

  const { opponentDisplayName } = getOpponentDetails(tournamentMatch, connection.userId, activeConnections)

  connection.socket.send(
    JSON.stringify({
      type: 'tournamentMatchAccepted',
      message: 'You have accepted the match',
      yourDisplayName: displayName,
      opponentName: opponentDisplayName,
      round
    })
  )
  if (matchAcceptances[tournamentMatch.id].size >= 1) {
    console.log('Starting tournament match...')
    db.prepare(`
        UPDATE tournament_matches
        SET match_status = ?, started_at = datetime('now', 'localtime')
        WHERE id = ?
        `).run('in_progress', tournamentMatch.id)
    // console.log('Tournament match retrieved:', tournamentMatch)
    const gameStarted = await startGameForMatch(tournamentMatch)

    if (!gameStarted) {
      console.error(`Game creation failed for tournament match ${tournamentMatch.id}. Notifying players...`)
      activeConnections.forEach((conn, _userId) => {
        conn.socket.send(
          JSON.stringify({
            type: 'error',
            message: `Failed to create game for tournament match ${tournamentMatch.id}`
          })
        )
      })
      return
    }

    const gameUrl = `http://localhost:3000/game?matchId=${tournamentMatch.id}`

    activeConnections.forEach((conn, _userId) => {
      if (conn.userId === tournamentMatch.player1_id || conn.userId === tournamentMatch.player2_id) {
        const { specificOpponentId, specificOpponentDisplayName } = getOpponentDetails(tournamentMatch, conn.userId, activeConnections)
        conn.socket.send(
          JSON.stringify({
            type: 'matchStarted',
            matchId: tournamentMatch.id,
            oppId: specificOpponentId,
            oppDisplayName: specificOpponentDisplayName,
            gameUrl: `${gameUrl}&playerId=${conn.userId}`
          }))
      }
    })
    delete matchAcceptances[tournamentMatch.id]
  }
  console.log(`Tournament match ${tournamentMatch.id} started between ${tournamentMatch.player2_id} and ${tournamentMatch.player1_id}`)
}

// Online Match Acceptance
export async function onlineMatchAccept (data, connection, matchAcceptances) {
  if (!playerQueueStatus.has(connection.userId)) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'You are not registered in the match queue'
    }))
    return
  }

  const currentPlayer = activeConnections.get(connection.userId)
  const displayName = currentPlayer ? currentPlayer.displayName : null

  console.log('Received matchAccept:', {
    userId: connection.userId,
    displayName,
    matchId: data.matchId
  })
  const match = db.prepare(`
        SELECT * FROM matchmaking 
        WHERE match_status = ? AND id = ? 
        AND (player1_id = ? OR player2_id = ?)
      `).get('pending', data.matchId, connection.userId, connection.userId)

  console.log('Found match:', match)

  if (!match) {
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'Match not found or no longer available'
      })
    )
    return
  }
  if (!matchAcceptances[match.id]) {
    console.log('Creating acceptance tracker for match', match.id)
    matchAcceptances[match.id] = new Set()
  }
  matchAcceptances[match.id].add(connection.userId)
  console.log(
    'Current accepted Players for match', match.id, ':',
    Array.from(matchAcceptances[match.id])
  )

  const { opponentDisplayName } = getOpponentDetails(match, connection.userId, activeConnections)

  connection.socket.send(
    JSON.stringify({
      type: 'matchAccepted',
      message: 'You have accepted the match',
      yourName: displayName,
      opponentName: opponentDisplayName
    })
  )
  if (matchAcceptances[match.id].size >= 1) {
    console.log('Starting match...')
    db.prepare(`
        UPDATE matchmaking 
        SET match_status = ?, started_at = datetime('now') 
        WHERE id = ?
      `).run('in_progress', match.id)

    const gameStarted = await startGameForMatch(match)
    if (!gameStarted) {
      console.error(`Game creation failed for match ${match.id}. Notifying players...`)
      activeConnections.forEach((conn, _userId) => {
        conn.socket.send(
          JSON.stringify({
            type: 'error',
            message: `Failed to create game for match ${match.id}`
          })
        )
      })
      return
    }

    const gameUrl = `http://localhost:3000/game?matchId=${match.id}`

    // Notify both players
    activeConnections.forEach((conn, _userId) => {
      if (conn.userId === match.player1_id || conn.userId === match.player2_id) {
        const { specificOpponentId, specificOpponentDisplayName } = getOpponentDetails(match, connection.userId, activeConnections)
        conn.socket.send(JSON.stringify({
          type: 'matchStarted',
          matchId: match.id,
          oppId: specificOpponentId,
          oppDisplayName: specificOpponentDisplayName,
          gameUrl: `${gameUrl}&playerId=${conn.userId}`
        }))
      }
    })
    delete matchAcceptances[match.id]
    console.log(`Match ${match.id} started between ${match.player1_id} and ${match.player2_id}`)
  }
}
