import { connectionHandler } from './handlers/connection.js'
import jwtTr from 'jwt-validator-tr'

export const websocketHandler = (fastify) => {
  fastify.get('/ws', {
    websocket: true,
    preHandler: async (request, reply) => {
      if (!request.headers.authorization && request.query.token) {
        request.headers.authorization = `Bearer ${request.query.token}`
      }
      await jwtTr.verifyAccessToken(request, reply)
    }
  }, connectionHandler)
}
