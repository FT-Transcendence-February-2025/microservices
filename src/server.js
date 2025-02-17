import Fastify from 'fastify';
import createAccountRoute from './routes/create_account.js';
import fastifyBcrypt from "fastify-bcrypt";

const fastify = Fastify({
//  logger: true
});

fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12
});

fastify.route(createAccountRoute);

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