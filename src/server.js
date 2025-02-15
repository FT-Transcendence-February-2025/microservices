import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { db } from './db/connection.js';
import { userRoutes } from './routes/users.js';

const PORT = 3000;

const fastify = Fastify({
  logger: true,
});

// Register WebSocket
await fastify.register(fastifyWebsocket);

// Test get route to send reply message
fastify.get('/', (request, reply) => {
  reply.send({
    message: 'Hello Fastify. Server is running!',
  });
});

// Example of using knex in a route
fastify.get('/db-test', async (request, reply) => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    reply.send({
      message: 'Database connection successful!',
    });
  } catch (error) {
    reply.send({
      error: 'Database conenction failed!',
    });
  }
});

// Routes
fastify.register(userRoutes);

// Server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Matchmaking service listening at port: ${PORT} `);
    console.log();
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
