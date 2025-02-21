import { authDb, matchmakingDb } from '../db/connection.js';

export const authDbRoute = (fastify) => {
  fastify.get('/test-auth-db', async (request, reply) => {
    try {
      const users = await authDb('users').select('*');
      reply.send({
        message: 'Successfully accessed authentication database',
        userCount: users.length,
        users,
      });
    } catch (error) {
      console.error('Database error:', error);
      reply.status(500).send({
        error: 'Failed to access authentication database',
        details: error.message,
      });
    }
  });
};

export const matchmakingDbRoute = (fastify) => {
  fastify.get('/test-matchmaking-db', async (request, reply) => {
    try {
      const matches = await matchmakingDb('matchmaking').select('*');
      reply.send({
        message: 'Successfully fetching matchmaking table information',
        matchCount: matches.length,
        matches,
      });
    } catch (error) {
      console.error('Database error:', error);
      reply.status(500).send({
        error: 'Failed to fetch matchmaking table information',
        details: error.message,
      });
    }
  });
};
