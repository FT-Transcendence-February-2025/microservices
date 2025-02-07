import Fastify from 'fastify';
import createAccountRoute from './routes/create_account.js';

const fastify = Fastify({
  logger: true
});

fastify.route(createAccountRoute);

fastify.get('/', (request, reply) => {
  return { message: 'Fastify server running'};
});

try {
  await fastify.listen({ port: 3000 });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
