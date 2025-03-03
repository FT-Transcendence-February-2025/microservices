import Fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
import dotenv from 'dotenv';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import cron from 'node-cron';
import createAccountRoute from './routes/registration-route.js';
import createLoginRoute from './routes/authentication-route.js';
import createChangePasswordRoute from './routes/password-change-route.js';
import createRefreshTokenRoute from './routes/refresh-token-route.js';

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12
});

// TODO: modify this later (current settings are for testing local frontend).
fastify.register(fastifyCors, {
	origin: ['http://127.0.0.1:8080'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
});

fastify.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {}
})

fastify.route(createAccountRoute);
fastify.route(createLoginRoute);
fastify.route(createChangePasswordRoute);
fastify.route(createRefreshTokenRoute);

cron.schedule('* */12 * * *', () => {

});

fastify.get('/', (request, reply) => {
  return { message: 'Fastify server of authentication-service running' };
});

try {
  await fastify.listen({ port: 3001 });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}

export default fastify;

// TODO: check and fix error codes.