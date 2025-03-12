import db from '../../db/connection.js'

const AUTH_SERVICE_URL = 'http://authentication:3000'

// Queue to store waiting players
const matchmakingQueue = []

const messageHandler = async (message, connection) => {
  // Converts the message from a string to a JavaScript object.
  const data = JSON.parse(message.toString())

  switch (data.type) {
  case 'joinQueue':
    try {
      // Verify user exists
      const response = await fetch(
        `${AUTH_SERVICE_URL}/api/users/${data.userId}`
      )
      const user = await response.json()
      if (!user || !response.ok) {
        connection.socket.send(
          JSON.stringify({
            type: 'error',
            message: 'User not found'
          })
        )
        return
      }

      // Add player to queue if not already in it
      if (!matchmakingQueue.find((player) => player.id === data.userId)) {
        matchmakingQueue.push({
          id: data.userId,
          socket: connection.socket,
          joinedAt: new Date()
        })

        // Send queueJoined message
        connection.socket.send(
          JSON.stringify({
            type: 'queueJoined',
            message: 'Successfully joined matchmaking queue'
          })
        )

        // Check if we can make a match
        if (matchmakingQueue.length >= 2) {
          // Match first 2 players in queue
          const player1 = matchmakingQueue.shift() // shift() removes and returns the first two players from the queue
          const player2 = matchmakingQueue.shift()

          try {
            const roomCode = `MATCH_${Date.now()}`
            // Create match record
            const stmt = db.prepare(`
              INSERT INTO matchmaking (player1_id, player2_id, match_status, room_code, created_at) 
              VALUES (?, ?, ?, ?, datetime('now'))
            `)
            const result = stmt.run(player1.id, player2.id, 'pending', roomCode)
            const matchId = result.lastInsertRowid;
            [player1, player2].forEach((player) => {
              player.socket.send(
                JSON.stringify({
                  type: 'matchCreated',
                  matchId,
                  opponentId: player === player1 ? player2.id : player1.id,
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

  case 'leaveQueue':
    try {
      // Find player's ID
      const playerIndex = matchmakingQueue.findIndex(
        (player) => player.id === data.userId
      )
      if (playerIndex !== -1) {
        // Remove player from Queue
        matchmakingQueue.splice(playerIndex, 1)

        // Send notification to player
        connection.socket.send(
          JSON.stringify({
            type: 'queueUpdate',
            message: 'You have left the queue.'
          })
        )
      } else {
        connection.socket.send(
          JSON.stringify({
            type: 'error',
            message: 'You are not in the queue'
          })
        )
      }
    } catch (error) {
      connection.socket.send(
        JSON.stringify({
          type: 'error',
          message: 'Failed to leave the queue'
        })
      )
    }
    break
  case 'matchAccept':
    try {
      console.log('Received matchAccept:', {
        userId: data.userId,
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

      // Check if match wasn't cancelled while processing
      const matchStatus = db.prepare(`
        SELECT match_status FROM matchmaking WHERE id = ?
      `).get(match.id)

      if (matchStatus.match_status !== 'pending') {
        connection.socket.send(
          JSON.stringify({
            type: 'error',
            message: 'Match is no longer available'
          })
        )
        return
      }

      const opponentId =
          match.player1_id === data.userId
            ? match.player2_id
            : match.player1_id

      // Store the acceptance in memory
      if (!match.acceptedPlayers) {
        console.log('Initializing acceptedPlayers set')
        match.acceptedPlayers = new Set()
      }
      match.acceptedPlayers.add(data.userId)
      console.log(
        'Current acceptedPlayers:',
        Array.from(match.acceptedPlayers)
      )

      // Check if both players have accepted
      if (
        match.acceptedPlayers.has(match.player1_id) &&
          match.acceptedPlayers.has(match.player2_id)
      ) {
        console.log('Both players accepted, starting match')
        db.prepare(`
        UPDATE matchmaking 
        SET match_status = ?, started_at = datetime('now') 
        WHERE id = ?
      `).run('active', match.id);

        // Notify both players
        [match.player1_id, match.player2_id].forEach((playerId) => {
          const player = matchmakingQueue.find((p) => p.id === playerId)
          if (player) {
            player.socket.send(
              JSON.stringify({
                type: 'matchStarted',
                message: 'Match has started!',
                matchId: match.id,
                opponentId
              })
            )
          }
        })

        console.log(
          `Match ${match.id} started between ${match.player1_id} and ${match.player2_id}`
        )
      } else {
        const opponent = matchmakingQueue.find((p) => p.id === opponentId)
        if (opponent) {
          opponent.socket.send(
            JSON.stringify({
              type: 'matchPending',
              message:
                  'Your opponent has accepted the match. Waiting for you to accept.'
            })
          )
        }
      }
    } catch (error) {
      connection.socket.send(
        JSON.stringify({
          type: 'error',
          message: 'Failed to accept match'
        })
      )
      console.error('Error handling matchAccept:', error)
    }
    break

  case 'matchDecline':
    try {
      const match = db.prepare(`
        SELECT * FROM matchmaking 
        WHERE match_status = ? 
        AND id = ?
        AND (player1_id = ? OR player2_id = ?)
      `).get('pending', data.matchId, data.userId, data.userId)

      if (!match) {
        connection.socket.send(
          JSON.stringify({
            type: 'error',
            message: 'Match not found or no longer available'
          })
        )
        return
      }

      db.prepare(`
        UPDATE matchmaking 
        SET match_status = ?, ended_at = datetime('now')
        WHERE id = ?
      `).run('cancelled', match.id)

      const opponentId = match.player1_id === data.userId
        ? match.player2_id
        : match.player1_id

      const opponent = matchmakingQueue.find(p => p.id === opponentId)

      if (opponent) {
        opponent.socket.send(
          JSON.stringify({
            type: 'matchCancelled',
            message: 'Your opponent declined the match'
          })
        )
      }

      // Notify the declining player
      connection.socket.send(
        JSON.stringify({
          type: 'matchCancelled',
          message: 'You declined the match'
        })
      )
    } catch (error) {
      connection.socket.send(
        JSON.stringify({
          type: 'error',
          message: 'Failed to decline match'
        })
      )
      console.error('Error handling matchDecline: ', error)
    }
    break
  default:
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'Unknown message type received'
      })
    )
    console.error(`Received unknown message type: ${data.type}`)
    break
  }
}

const closeHandler = async (connection) => {
  try {
    console.log('Client disconnect')
    let player

    // Find player in queue
    const playerIndex = matchmakingQueue.findIndex(
      (player) => player.socket === connection.socket
    )

    // Remove from queue if found
    if (playerIndex !== -1) {
      player = matchmakingQueue[playerIndex]
      console.log(`Removing player ${player.id} from queue`)
      matchmakingQueue.splice(playerIndex, 1)
    }

    // Check if player is in active match
    if (player) {
      const match = db.prepare(`
        SELECT * FROM matchmaking 
        WHERE match_status = ?
        AND (player1_id = ? OR player2_id = ?)
      `).get('pending', player.id, player.id)

      if (match) {
        console.log(`Match ${match.id} cancelled because player ${player.id} disconnected.`)
      }

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
  } catch (error) {
    console.error('WebSocket error: ', error)
  }
}

const errorHandler = async (error) => {
  console.error('WebSocket error:', error)
}

const connectionHandler = (connection, _req) => {
  connection.socket = connection

  // Websocket event listeners
  connection.socket.on('message', (message) =>
    messageHandler(message, connection)
  )
  connection.socket.on('error', errorHandler)
  connection.socket.on('close', () => closeHandler(connection))
}

export { connectionHandler }
