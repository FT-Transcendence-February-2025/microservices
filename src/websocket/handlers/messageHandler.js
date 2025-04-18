import { verifyToken } from '../utils/verifyToken.js'
import { onlineJoinQueue, tournamentJoinQueue } from '../messageTypes/joinQueue.js'
import { tournamentMatchAccept, onlineMatchAccept } from '../messageTypes/matchAccept.js'
import { leaveQueue } from '../messageTypes/leaveQueue.js'
import { matchCancelled } from '../messageTypes/matchCancelled.js'

export const matchmakingQueue = [] // Stores players who are waiting
export const matchAcceptances = {} // object the tracks accepted match invitations
export const playerTournamentStatus = new Map()
export const playerQueueStatus = new Map()

export const messageHandler = async (message, connection) => {
  const data = JSON.parse(message.toString())

  if (data.type === 'joinQueue') {
    if (!verifyToken(data, connection)) return
  }
  await dispatchMessage(data, connection)
}

export const dispatchMessage = async (data, connection) => {
  if (data.tournamentId) {
    await handleTournamentMessages(data, connection)
  } else {
    await handleOnlineGameMessages(data, connection)
  }
}

// Tournament message handler
// Handles messages with tournamentId in it
const handleTournamentMessages = async (data, connection) => {
  switch (data.type) {
  case 'joinQueue': {
    tournamentJoinQueue(data, connection)
    break
  }
  case 'matchAccept': {
    await tournamentMatchAccept(data, connection, matchAcceptances)
    break
  }
  case 'leaveQueue': {
    leaveQueue(data, connection)
    break
  }
  case 'matchCancelled': {
    await matchCancelled(data, connection)
    break
  }
  default:
    connection.socket.send(
      JSON.stringify({
        type: 'error',
        message: 'Unsupported tournament match message type'
      })
    )
    console.error(`Received unknown message type ${data.type}`)
    break
  }
}

// Online game message handler
const handleOnlineGameMessages = async (data, connection) => {
  switch (data.type) {
  case 'joinQueue': {
    onlineJoinQueue(data, connection)
    break
  }
  case 'matchAccept': {
    await onlineMatchAccept(data, connection, matchAcceptances)
    break
  }
  case 'leaveQueue': {
    leaveQueue(data, connection)
    break
  }
  case 'matchCancelled': {
    await matchCancelled(data, connection)
    break
  }
  default:
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'Unsupported local match message type'
    }))
    console.error(`Received unknown message type ${data.type}`)
    break
  }
}
