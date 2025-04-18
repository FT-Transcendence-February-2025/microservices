import { closeHandler } from './closeHandler.js'
import { messageHandler } from './messageHandler.js'

const connectionHandler = (connection, _request) => {
  connection.socket = connection

  // Websocket event listeners
  connection.socket.on('message', (message) => messageHandler(message, connection))
  connection.socket.on('error', errorHandler)
  connection.socket.on('close', () => closeHandler(connection))
}

const errorHandler = async (error) => {
  console.error('WebSocket error:', error)
}

export { connectionHandler }
