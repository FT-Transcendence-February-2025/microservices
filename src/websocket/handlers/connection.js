import { verifyUser } from '../../controllers/matchmakingControllers.js'
import db from '../../db/connection.js'
import fetch from 'node-fetch'

// Queue to store waiting players
const matchmakingQueue = [] // Stores players who are waiting
const activeConnections = [] // connected web sockets
const matchAcceptances = {} // object the tracks accepted match invitations
const playerTournamentStatus = new Map()
const playerQueueStatus = new Map()

async function startGameForMatch (match) {
  try {
    const response = await fetch('http://localhost:3003/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matchId: match.id,
        tournamentId: match.tournamentId,
        player1Id: match.player1_id,
        player2Id: match.player2_id,
        isLocal: false
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log(`Game created successfully for match ${match.id}`)
      return true
    } else {
      console.error(`Failed to create game for match ${match.id}: ${result.message}`)
      return false
    }
  } catch (error) {
    console.error(`Error creating game: ${error.message}`)
    return false
  }
}

function addPlayerToQueue (data, connection, displayName, tournament = false) {
  if (matchmakingQueue.find((player) => player.id === data.userId)) {
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'You are already in the queue addPlayerToQueue function'
      }))
    return false
  }

  connection.userId = data.userId
  connection.displayName = displayName

  const playerEntry = {
    id: data.userId,
    socket: connection.socket,
    displayName,
    joinedAt: new Date()
  }

  if (tournament) {
    playerEntry.tournamentId = data.tournamentId
    playerEntry.tournament = true
    playerEntry.round = data.round
    playerTournamentStatus.set(data.userId, { tournamentId: data.tournamentId, tournament: true, round: data.round })
  }

  // Store player in both the global status map and the matchmaking queue
  playerQueueStatus.set(data.userId, playerEntry)
  matchmakingQueue.push(playerEntry)
  return true
}

function getOpponentDetails (match, userId, activeConnections) {
  const opponentId = match.userId === match.player1_id ? match.player2_id : match.player1_id
  const opponentConnection = activeConnections.find(c => c.userId === opponentId)
  const opponentDisplayName = opponentConnection ? opponentConnection.displayName : null
  return { opponentId, opponentConnection, opponentDisplayName }
}

function leaveQueue (data, connection) {
  const player = playerQueueStatus.get(data.userId)
  if (!player) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'You are not in the queue'
    }))
    return
  }
  // Remove the player from the global status
  playerQueueStatus.delete(data.userId)
  // Remove their tournament status too
  playerTournamentStatus.delete(data.userId)

  // Remove the player from the matchmaking queue if present
  const index = matchmakingQueue.findIndex(p => p.id === data.userId)
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
    type: 'queueLeft',
    message: 'You have successfully left the queue.'
  }))
}

// Tournament message handler
// Handles messages with tournamentId in it
const handleTournamentMessages = async (data, connection) => {
  switch (data.type) {
  case 'joinQueue': {
    if (!data.round) {
      connection.socket.send(JSON.stringify({
        type: 'error',
        message: 'Missing round value for tournament'
      }))
      return
    }

    if (addPlayerToQueue(data, connection, connection.displayName, true)) {
      connection.socket.send(
        JSON.stringify({
          type: 'tournamentQueueJoined',
          message: 'Successfully joined match tournament queue',
          displayName: connection.displayName,
          round: data.round
        }))
    }

    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift()
      const player2 = matchmakingQueue.shift()

      console.log('Player1 details:', player1)
      console.log('Player2 details:', player2)

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
    break
  }
  case 'matchAccept': {
    if (!playerTournamentStatus.has(data.userId)) {
      connection.socket.send(JSON.stringify({
        type: 'error',
        message: 'You are not registered in the tournament queue'
      }))
      return
    }

    const currentPlayer = activeConnections.find(conn => conn.userId === data.userId)
    const displayName = currentPlayer ? currentPlayer.displayName : null
    const round = data.round
    const tournamentMatch = db.prepare(`
      SELECT *, tournament_id AS tournamentId
      FROM tournament_matches
      WHERE tournament_id = ? AND match_status = ?
        AND (player1_id = ? OR player2_id = ?)
      `).get(data.tournamentId, 'pending', data.userId, data.userId)

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
    matchAcceptances[tournamentMatch.id].add(data.userId)
    console.log('Current accepted players for tournament match', tournamentMatch.id, ':',
      Array.from(matchAcceptances[tournamentMatch.id])
    )

    const { opponentDisplayName } = getOpponentDetails(tournamentMatch, data.userId, activeConnections)

    connection.socket.send(
      JSON.stringify({
        type: 'tournamentMatchAccepted',
        message: 'You have accepted the match',
        yourDisplayName: displayName,
        opponentName: opponentDisplayName,
        round
      })
    )
    if (matchAcceptances[tournamentMatch.id] && matchAcceptances[tournamentMatch.id].size >= 2) {
      console.log('Starting tournament match...')
      db.prepare(`
        UPDATE tournament_matches
        SET match_status = ?, started_at = datetime('now', 'localtime')
        WHERE id = ?
        `).run('in_progress', tournamentMatch.id)
      console.log('Tournament match retrieved:', tournamentMatch)
      const gameStarted = await startGameForMatch(tournamentMatch)

      if (!gameStarted) {
        console.error(`Game creation failed for tournament match ${tournamentMatch.id}. Notifying players...`)
        activeConnections.forEach(conn => {
          conn.socket.send(
            JSON.stringify({
              type: 'error',
              message: `Failed to create game for tournament match ${tournamentMatch.id}`
            })
          )
        })
        return
      }

      const gameUrl = `http://localhost:3003/?matchId=${tournamentMatch.id}`

      activeConnections.forEach(conn => {
        if (conn.userId === tournamentMatch.player1_id || conn.userId === tournamentMatch.player2_id) {
          const { specificOpponentId, specificOpponentDisplayName } = getOpponentDetails(tournamentMatch, data.userId, activeConnections)
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
    console.log(`Tournament match ${tournamentMatch.id} started between ${tournamentMatch.player2_id}:${displayName} and ${tournamentMatch.player1_id}:${opponentDisplayName}`)
    break
  }
  case 'leaveQueue': {
    leaveQueue(data, connection)
    break
  }
  default:
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'Unknown message type received'
      })
    )
    console.error(`Received unknown message type ${data.type}`)
    break
  }
}

// Local game message handler
// Handles messages like joinQueue and matchAccept without tournamentId
const handleLocalGameMessages = async (data, connection) => {
  switch (data.type) {
  case 'joinQueue': {
    try {
      const result = await verifyUser(data.userId)
      if (result.error || !result.success) {
        connection.socket.send(
          JSON.stringify({
            type: 'error',
            message: result.error || 'User not found'
          })
        )
        return
      }
      if (addPlayerToQueue(data, connection, result.displayName)) {
        connection.socket.send(JSON.stringify({
          type: 'queueJoined',
          message: 'Successfully joined matchmaking queue',
          displayName: result.displayName
        }))
      }
      // Insert match creation logic for local match
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
            const opponent = player === player1 ? player2.id : player1.id
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
    break
  }
  case 'matchAccept': {
    if (!playerQueueStatus.has(data.userId)) {
      connection.socket.send(JSON.stringify({
        type: 'error',
        message: 'You are not registered in the match queue'
      }))
      return
    }

    const currentPlayer = activeConnections.find(conn => conn.userId === data.userId)
    const displayName = currentPlayer ? currentPlayer.displayName : null

    console.log('Received matchAccept:', {
      userId: data.userId,
      displayName,
      matchId: data.matchId
    })
    const match = db.prepare(`
        SELECT * FROM matchmaking 
        WHERE match_status = ? AND id = ? 
        AND (player1_id = ? OR player2_id = ?)
      `).get('pending', data.matchId, data.userId, data.userId)

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
    matchAcceptances[match.id].add(data.userId)
    console.log(
      'Current accepted Players for match', match.id, ':',
      Array.from(matchAcceptances[match.id])
    )

    const { opponentDisplayName } = getOpponentDetails(match, data.userId, activeConnections)

    connection.socket.send(
      JSON.stringify({
        type: 'matchAccepted',
        message: 'You have accepted the match',
        yourName: displayName,
        opponentName: opponentDisplayName
      })
    )
    if (matchAcceptances[match.id] && matchAcceptances[match.id].size >= 2) {
      console.log('Starting match...')
      db.prepare(`
        UPDATE matchmaking 
        SET match_status = ?, started_at = datetime('now') 
        WHERE id = ?
      `).run('in_progress', match.id)

      const gameStarted = await startGameForMatch(match)
      if (!gameStarted) {
        console.error(`Game creation failed for match ${match.id}. Notifying players...`)
        activeConnections.forEach(conn => {
          conn.socket.send(
            JSON.stringify({
              type: 'error',
              message: `Failed to create game for match ${match.id}`
            })
          )
        })
        return
      }

      const gameUrl = `http://localhost:3003/?matchId=${match.id}`

      // Notify both players
      activeConnections.forEach(conn => {
        if (conn.userId === match.player1_id || conn.userId === match.player2_id) {
          const { specificOpponentId, specificOpponentDisplayName } = getOpponentDetails(match, data.userId, activeConnections)
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
      console.log(`Match ${match.id} started between ${match.player1_id}:${displayName} and ${match.player2_id}:${opponentDisplayName}`)
    }
    break
  }
  case 'leaveQueue': {
    leaveQueue(data, connection)
    break
  }
  default:
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'Unsupported local match message type'
    }))
    // break
  }
}

const dispatchMessage = async (data, connection) => {
  if (data.tournamentId) {
    await handleTournamentMessages(data, connection)
  } else {
    await handleLocalGameMessages(data, connection)
  }
}

const messageHandler = async (message, connection) => {
  const data = JSON.parse(message.toString())
  await dispatchMessage(data, connection)
}

const closeHandler = async (connection) => {
  try {
    console.log('Client disconnect')

    // Remove connection from activeConnections
    const connectionIndex = activeConnections.findIndex(conn => conn === connection)
    if (connectionIndex !== -1) {
      activeConnections.splice(connectionIndex, 1)
      console.log(`Removed connection from activeConnections. Active connections: ${activeConnections.length}`)
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
        const opponent = activeConnections.find(p => p.userId === opponentId)
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

const errorHandler = async (error) => {
  console.error('WebSocket error:', error)
}

const connectionHandler = (connection, _req) => {
  connection.socket = connection
  activeConnections.push(connection)

  // Websocket event listeners
  connection.socket.on('message', (message) =>
    messageHandler(message, connection)
  )
  connection.socket.on('error', errorHandler)
  connection.socket.on('close', () => closeHandler(connection))
}

export { connectionHandler }

// const messageHandler = async (message, connection) => {
//   // Converts the message from a string to a JavaScript object.
//   const data = JSON.parse(message.toString())

//   switch (data.type) {
//   case 'joinQueue':
//     try {
//       // Verify user exists
//       const result = await verifyUser(data.userId)
//       if (result.error || !result.success) {
//         connection.socket.send(
//           JSON.stringify({
//             type: 'error',
//             message: result.error || 'User not found'
//           })
//         )
//         return
//       }

//       // tournament joinQueue branch
//       if (data.tournamentId) {
//         if (!data.round) {
//           connection.socket.send(
//             JSON.stringify({
//               type: 'error',
//               message: 'Missing round value for tournament'
//             })
//           )
//           return
//         }
//         const round = data.round

//         if (addPlayerToQueue(data, connection, result.displayName, true)) {
//           connection.socket.send(
//             JSON.stringify({
//               type: 'tournamentQueueJoined',
//               message: 'Successfully joined tournament queue',
//               displayName: result.displayName,
//               round
//             })
//           )
//         }

//         if (matchmakingQueue.length >= 2) {
//           const player1 = matchmakingQueue.shift()
//           const player2 = matchmakingQueue.shift()

//           try {
//             const roomCode = `MATCH_${Date.now()}`
//             const stmt = db.prepare(`
//               UPDATE tournament_matches
//               SET match_status = ?, room_code = ?
//               WHERE tournament_id = ? AND round = ?
//               AND (
//                 (player1_id = ? AND player2_id = ?)
//                 OR (player1_id = ? AND player2_id = ?)
//               )
//               AND match_status = 'pending'
//             `)
//             const updateResult = stmt.run('pending', roomCode, data.tournamentId, round,
//               player1.id, player2.id, player2.id, player1.id)
//             if (!updateResult.changes) {
//               matchmakingQueue.unshift(player2)
//               matchmakingQueue.unshift(player1);
//               [player1, player2].forEach(player => {
//                 player.socket.send(
//                   JSON.stringify({
//                     type: 'error',
//                     message: 'Tournament match not found for these players'
//                   })
//                 )
//               })
//               return
//             }

//             const tournamentMatch = db.prepare(`
//               SELECT * FROM tournament_matches
//               WHERE tournament_id = ? AND round = ? AND room_code = ?
//               AND match_status = 'pending'
//             `).get(data.tournamentId, round, roomCode);

//             [player1, player2].forEach((player) => {
//               const opponent = player === player1 ? player2 : player1
//               player.socket.send(
//                 JSON.stringify({
//                   type: 'tournamentMatchCreated',
//                   matchId: tournamentMatch.id,
//                   round,
//                   opponentId: opponent.id,
//                   opponentDisplayName: opponent.displayName,
//                   roomCode
//                 })
//               )
//             })
//           } catch (error) {
//             console.error('Error creating tournament match:', error)
//             matchmakingQueue.unshift(player2)
//             matchmakingQueue.unshift(player1);

//             [player1, player2].forEach((player) => {
//               player.socket.send(
//                 JSON.stringify({
//                   type: 'error',
//                   message: 'Failed to create tournament match'
//                 })
//               )
//             })
//           }
//         }

//         return
//       }

//       // Normal joinQueue branch
//       if (addPlayerToQueue(data, connection, result.displayName)) {
//         // Send queueJoined message
//         connection.socket.send(
//           JSON.stringify({
//             type: 'queueJoined',
//             message: 'Successfully joined matchmaking queue',
//             displayName: result.displayName
//           })
//         )
//       }

//       // Check if we can make a match
//       if (matchmakingQueue.length >= 2) {
//         // Match first 2 players in queue
//         const player1 = matchmakingQueue.shift() // shift() removes and returns the first two players from the queue
//         const player2 = matchmakingQueue.shift()

//         try {
//           const roomCode = `MATCH_${Date.now()}`
//           // Create match record
//           const stmt = db.prepare(`
//             INSERT INTO matchmaking (player1_id, player2_id, match_status, room_code, created_at)
//             VALUES (?, ?, ?, ?, datetime('now'))
//           `)
//           const result = stmt.run(player1.id, player2.id, 'pending', roomCode)
//           const matchId = result.lastInsertRowid;
//           [player1, player2].forEach((player) => {
//             const opponent = player === player1 ? player2.id : player1.id
//             player.socket.send(
//               JSON.stringify({
//                 type: 'matchCreated',
//                 matchId,
//                 opponentId: opponent.id,
//                 opponentDisplayName: opponent.displayName,
//                 roomCode
//               })
//             )
//           })
//         } catch (error) {
//           console.error('Error creating match:', error)
//           matchmakingQueue.unshift(player2)
//           matchmakingQueue.unshift(player1);

//           [player1, player2].forEach((player) => {
//             player.socket.send(
//               JSON.stringify({
//                 type: 'error',
//                 message: 'Failed to create match'
//               })
//             )
//           })
//         }
//       }
//     } catch (error) {
//       connection.socket.send(
//         JSON.stringify({
//           type: 'error',
//           message: 'Failed to join queue'
//         })
//       )
//     }
//     break

//   case 'leaveQueue':
//     try {
//       // Find player's ID
//       const playerIndex = matchmakingQueue.findIndex(
//         (player) => player.id === data.userId
//       )
//       if (playerIndex !== -1) {
//         // Remove player from Queue
//         matchmakingQueue.splice(playerIndex, 1)

//         // Send notification to player
//         connection.socket.send(
//           JSON.stringify({
//             type: 'queueUpdate',
//             message: 'You have left the queue.'
//           })
//         )
//       } else {
//         connection.socket.send(
//           JSON.stringify({
//             type: 'error',
//             message: 'You are not in the queue'
//           })
//         )
//       }
//     } catch (error) {
//       connection.socket.send(
//         JSON.stringify({
//           type: 'error',
//           message: 'Failed to leave the queue'
//         })
//       )
//     }
//     break
//   case 'matchAccept':
//     try {
//       // Tournament Match Acceptance
//       const currentPlayer = activeConnections.find(conn => conn.userId === data.userId)
//       const displayName = currentPlayer ? currentPlayer.displayName : null
//       if (data.tournamentId) {
//         const round = data.round
//         const tournamentMatch = db.prepare(`
//           SELECT *, tournament_id AS tournamentId
//           FROM tournament_matches
//           WHERE tournament_id = ? AND match_status = ?
//             AND (player1_id = ? OR player2_id = ?)
//           `).get(data.tournamentId, 'pending', data.userId, data.userId)

//         if (!tournamentMatch) {
//           connection.socket.send(
//             JSON.stringify({
//               type: 'error',
//               message: 'Tournament match not found or no longer available'
//             })
//           )
//           return
//         }

//         if (!matchAcceptances[tournamentMatch.id]) {
//           console.log('Creating acceptance traker for tournament match:', tournamentMatch.id)
//           matchAcceptances[tournamentMatch.id] = new Set()
//         }
//         matchAcceptances[tournamentMatch.id].add(data.userId)
//         console.log('Current accepted players for tournament match', tournamentMatch.id, ':',
//           Array.from(matchAcceptances[tournamentMatch.id])
//         )

//         const opponentId = tournamentMatch.player1_id === data.userId ? tournamentMatch.player2_id : tournamentMatch.player1_id
//         const opponentConnection = activeConnections.find(conn => conn.userId === opponentId)
//         const opponentDisplayName = opponentConnection ? opponentConnection.displayName : null

//         connection.socket.send(
//           JSON.stringify({
//             type: 'tournamentMatchAccepted',
//             message: 'You have accepted the match',
//             yourDisplayName: displayName,
//             opponentName: opponentDisplayName,
//             round
//           })
//         )

//         if (matchAcceptances[tournamentMatch.id] && matchAcceptances[tournamentMatch.id].size >= 2) {
//           console.log('Starting tournament match...')
//           db.prepare(`
//             UPDATE tournament_matches
//             SET match_status = ?, started_at = datetime('now', 'localtime')
//             WHERE id = ?
//             `).run('in_progress', tournamentMatch.id)

//           console.log('Tournament match retrieved:', tournamentMatch)
//           const gameStarted = await startGameForMatch(tournamentMatch)

//           if (!gameStarted) {
//             console.error(`Game creation failed for tournament match ${tournamentMatch.id}. Notifying players...`)
//             activeConnections.forEach(conn => {
//               conn.socket.send(
//                 JSON.stringify({
//                   type: 'error',
//                   message: `Failed to create game for tournament match ${tournamentMatch.id}`
//                 })
//               )
//             })
//             return
//           }

//           const gameUrl = `http://localhost:3003/?matchId=${tournamentMatch.id}`

//           activeConnections.forEach(conn => {
//             if (conn.userId === tournamentMatch.player1_id || conn.userId === tournamentMatch.player2_id) {
//               const specificOpponentId = conn.userId === tournamentMatch.player1_id ? tournamentMatch.player2_id : tournamentMatch.player1_id
//               const specificOpponentConnection = activeConnections.find(c => c.userId === specificOpponentId)
//               const specificOpponentDisplayName = specificOpponentConnection ? specificOpponentConnection.displayName : null
//               conn.socket.send(
//                 JSON.stringify({
//                   type: 'matchStarted',
//                   matchId: tournamentMatch.id,
//                   oppId: specificOpponentId,
//                   oppDisplayName: specificOpponentDisplayName,
//                   gameUrl: `${gameUrl}&playerId=${conn.userId}`
//                 })
//               )
//             }
//           })
//           delete matchAcceptances[tournamentMatch.id]
//           console.log(`Tournament match ${tournamentMatch.id} started between ${tournamentMatch.player2_id}:${displayName} and ${tournamentMatch.player1_id}:${opponentDisplayName}`)
//         }
//       } else {
//         // Normal Match Acceptance
//         const currentPlayer = activeConnections.find(conn => conn.userId === data.userId)
//         const displayName = currentPlayer ? currentPlayer.displayName : null

//         console.log('Received matchAccept:', {
//           userId: data.userId,
//           displayName,
//           matchId: data.matchId
//         })

//         const match = db.prepare(`
//           SELECT * FROM matchmaking
//           WHERE match_status = ? AND id = ?
//           AND (player1_id = ? OR player2_id = ?)
//         `).get('pending', data.matchId, data.userId, data.userId)

//         console.log('Found match:', match)

//         if (!match) {
//           connection.socket.send(
//             JSON.stringify({
//               type: 'error',
//               message: 'Match not found or no longer available'
//             })
//           )
//           return
//         }

//         if (!matchAcceptances[match.id]) {
//           console.log('Creating acceptance tracker for match', match.id)
//           matchAcceptances[match.id] = new Set()
//         }
//         matchAcceptances[match.id].add(data.userId)
//         console.log(
//           'Current accepted Players for match', match.id, ':',
//           Array.from(matchAcceptances[match.id])
//         )

//         const opponentId = match.player1_id === data.userId ? match.player2_id : match.player1_id
//         const opponentConnection = activeConnections.find(conn => conn.userId === opponentId)
//         const opponentDisplayName = opponentConnection ? opponentConnection.displayName : null

//         connection.socket.send(
//           JSON.stringify({
//             type: 'matchAccepted',
//             message: 'You have accepted the match',
//             yourName: displayName,
//             opponentName: opponentDisplayName
//           })
//         )

//         if (matchAcceptances[match.id] && matchAcceptances[match.id].size >= 2) {
//           console.log('Starting match...')
//           db.prepare(`
//           UPDATE matchmaking
//           SET match_status = ?, started_at = datetime('now')
//           WHERE id = ?
//         `).run('in_progress', match.id)

//           const gameStarted = await startGameForMatch(match)

//           if (!gameStarted) {
//             console.error(`Game creation failed for match ${match.id}. Notifying players...`)
//             activeConnections.forEach(conn => {
//               conn.socket.send(
//                 JSON.stringify({
//                   type: 'error',
//                   message: `Failed to create game for match ${match.id}`
//                 })
//               )
//             })
//             return
//           }

//           const gameUrl = `http://localhost:3003/?matchId=${match.id}`

//           // Notify both players
//           activeConnections.forEach(conn => {
//             if (conn.userId === match.player1_id || conn.userId === match.player2_id) {
//               const specificOpponentId = conn.userId === match.player1_id ? match.player2_id : match.player1_id
//               const specificOpponentConnection = activeConnections.find(c => c.userId === specificOpponentId)
//               const specificOpponentDisplayName = specificOpponentConnection ? specificOpponentConnection.displayName : null
//               conn.socket.send(
//                 JSON.stringify({
//                   type: 'matchStarted',
//                   matchId: match.id,
//                   oppId: specificOpponentId,
//                   oppDisplayName: specificOpponentDisplayName,
//                   gameUrl: `${gameUrl}&playerId=${conn.userId}`
//                 })
//               )
//             }
//           })
//           delete matchAcceptances[match.id]
//           console.log(`Match ${match.id} started between ${match.player1_id}:${displayName} and ${match.player2_id}:${opponentDisplayName}`)
//         }
//       }
//     } catch (error) {
//       connection.socket.send(
//         JSON.stringify({
//           type: 'error',
//           message: 'Failed to accept match'
//         })
//       )
//       console.error('Error handling matchAccept:', error)
//     }
//     break

//   case 'matchDecline':
//     try {
//       const match = db.prepare(`
//         SELECT * FROM matchmaking
//         WHERE match_status = ?
//         AND id = ?
//         AND (player1_id = ? OR player2_id = ?)
//       `).get('pending', data.matchId, data.userId, data.userId)

//       if (!match) {
//         connection.socket.send(
//           JSON.stringify({
//             type: 'error',
//             message: 'Match not found or no longer available'
//           })
//         )
//         return
//       }

//       db.prepare(`
//         UPDATE matchmaking
//         SET match_status = ?, ended_at = datetime('now')
//         WHERE id = ?
//       `).run('cancelled', match.id)

//       const opponentId = match.player1_id === data.userId
//         ? match.player2_id
//         : match.player1_id

//       const opponent = matchmakingQueue.find(p => p.id === opponentId)

//       if (opponent) {
//         opponent.socket.send(
//           JSON.stringify({
//             type: 'matchCancelled',
//             message: 'Your opponent declined the match'
//           })
//         )
//       }

//       // Notify the declining player
//       connection.socket.send(
//         JSON.stringify({
//           type: 'matchCancelled',
//           message: 'You declined the match'
//         })
//       )
//     } catch (error) {
//       connection.socket.send(
//         JSON.stringify({
//           type: 'error',
//           message: 'Failed to decline match'
//         })
//       )
//       console.error('Error handling matchDecline: ', error)
//     }
//     break
//   default:
//     connection.socket.send(
//       JSON.stringify({
//         type: 'error',
//         message: 'Unknown message type received'
//       })
//     )
//     console.error(`Received unknown message type: ${data.type}`)
//     break
//   }
// }
