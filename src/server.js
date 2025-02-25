import Fastify from 'fastify';
import { verifyToken } from './middleware/token-authenticator.js';

const fastify = Fastify({
//  logger: true
});

fastify.addHook('preHandler', async (request, reply) => {
		await verifyToken(request, reply);
});

// fastify.route(createAccountRoute);

fastify.get('/', (request, reply) => {
	return { message: 'Fastify server running' };
});

try {
	await fastify.listen({ port: 3001 });
} catch (error) {
	fastify.log.error(error);
	process.exit(1);
}
