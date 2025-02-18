import Fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
import dotenv from 'dotenv';
import { createAccountRoute } from './routes/registration-route.js';
import { createAuthenticationRoute } from './routes/authentication-route.js';

dotenv.config();

const fastify = Fastify({
//  logger: true
});

fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12
});

fastify.route(createAccountRoute);
fastify.route(createAuthenticationRoute);

fastify.get('/', (request, reply) => {
  return { message: 'Fastify server running' };
});

try {
  await fastify.listen({ port: 3000 });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}

export { fastify };