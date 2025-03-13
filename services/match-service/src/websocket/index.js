import { connectionHandler } from './handlers/connection.js';

export const websocketHandler = (fastify) => {
  fastify.get('/ws', { websocket: true }, connectionHandler);
};
