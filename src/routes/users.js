import { db } from '../db/connection.js';
import { User } from '../models/User.js';

export const userRoutes = async (fastify) => {
  // GET endpoint to retrieve all users
  fastify.get('/users', async (request, reply) => {
    try {
      const users = await db('users').select('*');
      reply.send(users);
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to fetch users',
      });
    }
  });

  // POST endpoint
  fastify.post('/users', async (request, reply) => {
    // Query
    const { username, email, password } = request.body;
    const user = await User.create({ username, email, password });
    reply.code(201).send(user);
  });

  // GET endpoint
  fastify.get('/users/:id', async (request, reply) => {
    const user = await User.findById(request.params.id);
    if (!user) {
      reply.code(404).send({
        error: 'User not found',
      });
    }
    reply.send(user);
  });
};
