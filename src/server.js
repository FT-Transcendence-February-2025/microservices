import Fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
import dotenv from 'dotenv';
import { createAccountRoute } from './routes/registration-route.js';
import { createAuthenticationRoute } from './routes/authentication-route.js';
import { createChangePasswordRoute } from './routes/password-change-route.js';
import { verifyToken } from './middleware/token-authenticator.js';

dotenv.config();

const fastify = Fastify({
//  logger: true
});

fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12
});

fastify.addHook('preHandler', async (request, reply) => {
	if (request.raw.url !== '/' && request.raw.url !== '/login' && request.raw.url !== '/create-account') {
		await verifyToken(request, reply);
	}
});

fastify.route(createAccountRoute);
fastify.route(createAuthenticationRoute);
fastify.route(createChangePasswordRoute);

fastify.get('/', (request, reply) => {
  return { message: 'Fastify server of authentication-service running' };
});

try {
  await fastify.listen({ port: 3001 });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}

export { fastify };