import Fastify from 'fastify';
import { verifyToken } from './middleware/token-authenticator.js';
import fastifyMultipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { createAvatarUploadRoute } from './routes/avatar-upload-route.js';

dotenv.config();

const fastify = Fastify({
//  logger: true
});

// Register plugins:
fastify.register(fastifyMultipart);

// Register routes:
fastify.route(createAvatarUploadRoute);

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
