import Fastify from 'fastify';
import verifyToken from 'jwt-validator-tr';
import fastifyMultipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { avatarUploadRoute } from './routes/avatar-upload-route.js';

dotenv.config();

const fastify = Fastify({
//  logger: true
});

// Register plugins:
fastify.register(fastifyMultipart);

// Register routes:
fastify.route(avatarUploadRoute);

fastify.addHook('preHandler', async (request, reply) => {
	await verifyToken(request, reply);
});

// fastify.route(registrationRoute);

fastify.get('/', (request, reply) => {
	return { message: 'Fastify server of user-management service running' };
});

try {
	await fastify.listen({ port: 3002 });
} catch (error) {
	fastify.log.error(error);
	process.exit(1);
}
