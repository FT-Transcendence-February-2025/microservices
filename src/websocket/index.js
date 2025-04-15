import { connectionHandler } from './handlers/connection.js'

export const websocketHandler = (fastify) => {
  fastify.get('/ws', { websocket: true, schema: { hide: true } }, connectionHandler)
}
