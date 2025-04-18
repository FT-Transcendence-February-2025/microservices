import jwt from 'jsonwebtoken'
import 'dotenv/config'

const secretKey = process.env.SECRET_KEY
export const activeConnections = new Map() // connected web sockets

export function verifyToken (data, connection) {
  try {
    const verifiedUser = jwt.verify(data.token, secretKey)
    // console.log('Decoded token:', verifiedUser)
    connection.userId = verifiedUser.userId
    connection.displayName = verifiedUser.displayName || verifiedUser.display_name
    activeConnections.set(connection.userId, connection)
    console.log('Token verified. User attached: ', connection.userId)
    return true
  } catch (error) {
    console.error('Token verification failed:', error)
    connection.socket.close(1008, 'Invalid token')
    return false
  }
}
