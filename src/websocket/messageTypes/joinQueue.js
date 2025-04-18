import db from '../../db/connection.js'
import { matchmakingQueue, playerTournamentStatus, playerQueueStatus } from '../handlers/messageHandler.js'

function addPlayerToQueue (data, connection, displayName, tournament = false) {
  if (matchmakingQueue.find((player) => player.id === connection.userId)) {
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'You are already in the queue addPlayerToQueue function'
      }))
    return false
  }

  // This can open you up to spoofing
  // connection.userId = data.userId
  // connection.displayName = displayName

  const playerEntry = {
    id: connection.userId,
    socket: connection.socket,
    displayName,
    joinedAt: new Date()
  }

  if (tournament) {
    playerEntry.tournamentId = data.tournamentId
    playerEntry.tournament = true
    playerEntry.round = data.round
    playerTournamentStatus.set(connection.userId, { tournamentId: data.tournamentId, tournament: true, round: data.round })
  }

  // Store player in both the global status map and the matchmaking queue
  playerQueueStatus.set(connection.userId, playerEntry)
  matchmakingQueue.push(playerEntry)
  return true
}

export function onlineJoinQueue (data, connection) {
  try {
    const userId = connection.userId
    const displayName = connection.displayName

    const requestData = { ...data, userId }
    if (addPlayerToQueue(requestData, connection, displayName)) {
      connection.socket.send(JSON.stringify({
        type: 'joinQueue',
        message: 'Successfully joined matchmaking queue',
        displayName
      }))
    }
    // Insert match creation logic for online match
    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift()
      const player2 = matchmakingQueue.shift()

      try {
        const roomCode = `MATCH_${Date.now()}`
        const stmt = db.prepare(`
            INSERT INTO matchmaking (player1_id, player2_id, match_status, room_code, created_at)
            VALUES (?, ?, ?, ?, datetime('now','localtime'))
            `)
        const result = stmt.run(player1.id, player2.id, 'pending', roomCode)
        const matchId = result.lastInsertRowid;
        [player1, player2].forEach((player) => {
          const opponent = player === player1 ? player2 : player1
          player.socket.send(
            JSON.stringify({
              type: 'matchCreated',
              matchId,
              opponentId: opponent.id,
              oppDisplayName: opponent.displayName,
              roomCode
            })
          )
        })
      } catch (error) {
        console.error('Error creating match:', error)
        matchmakingQueue.unshift(player2)
        matchmakingQueue.unshift(player1);
        [player1, player2].forEach((player) => {
          player.socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Failed to create match'
            })
          )
        })
      }
    }
  } catch (error) {
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'Failed to join queue'
      })
    )
  }
}

export function tournamentJoinQueue (data, connection) {
  if (!data.round) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'Missing round value for tournament'
    }))
    return
  }

  const userId = connection.userId
  const displayName = connection.displayName

  const requestData = { ...data, userId }

  if (addPlayerToQueue(requestData, connection, displayName, true)) {
    connection.socket.send(
      JSON.stringify({
        type: 'tournamentQueueJoined',
        message: 'Successfully joined match tournament queue',
        displayName,
        round: data.round
      }))
  }

  if (matchmakingQueue.length >= 2) {
    const player1 = matchmakingQueue.shift()
    const player2 = matchmakingQueue.shift()

    // console.log('Player1 details:', player1)
    // console.log('Player2 details:', player2)

    const tournamentMatchRecord = db.prepare(`
        SELECT * FROM tournament_matches
        WHERE tournament_id = ? AND round = ?
          AND (
            (player1_id = ? AND player2_id = ?)
            OR (player1_id = ? AND player2_id = ?)
          )
          AND match_status = 'pending'
        `).get(data.tournamentId, data.round, player1.id, player2.id, player2.id, player1.id)

    if (!tournamentMatchRecord) {
      playerQueueStatus.delete(player1.id)
      playerQueueStatus.delete(player2.id)
      playerTournamentStatus.delete(player1.id)
      playerTournamentStatus.delete(player2.id);

      [player1, player2].forEach(player => {
        player.socket.send(JSON.stringify({
          type: 'error',
          message: 'Tournament registration mismatch occurred. Please rejoin the queue.'
        }))
      })
      return
    }

    try {
      const roomCode = `MATCH_${Date.now()}`
      const stmt = db.prepare(`
            UPDATE tournament_matches
            SET match_status = ?, room_code = ?
            WHERE tournament_id = ? AND round = ?
            AND (
            (player1_id = ? AND player2_id = ?)
            OR (player1_id = ? AND player2_id = ?)
            )
            AND match_status = 'pending'
          `)
      const updateResult = stmt.run('pending', roomCode, data.tournamentId, data.round,
        player1.id, player2.id, player2.id, player1.id)
      if (!updateResult.changes) {
        matchmakingQueue.unshift(player2)
        matchmakingQueue.unshift(player1);
        [player1, player2].forEach(player => {
          player.socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Tournament match not found for these players'
            })
          )
        })
        return
      }

      const tournamentMatch = db.prepare(`
            SELECT * FROM tournament_matches
            WHERE tournament_id = ? AND round = ? AND room_code = ?
            AND match_status = 'pending'
          `).get(data.tournamentId, data.round, roomCode);

      [player1, player2].forEach((player) => {
        const opponent = player === player1 ? player2 : player1
        player.socket.send(
          JSON.stringify({
            type: 'tournamentMatchCreated',
            matchId: tournamentMatch.id,
            round: data.round,
            opponentId: opponent.id,
            opponentDisplayName: opponent.displayName,
            roomCode
          })
        )
      })
    } catch (error) {
      console.error('Error creating tournament match:', error)
      matchmakingQueue.unshift(player2)
      matchmakingQueue.unshift(player1);
      [player1, player2].forEach((player) => {
        player.socket.send(
          JSON.stringify({
            type: 'error',
            message: 'Failed to create tournament match'
          })
        )
      })
    }
  }
}
