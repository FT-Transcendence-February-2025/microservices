import Fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
import dotenv from 'dotenv';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import cron from 'node-cron';
import db from './services/database-service.js';
import registrationRoute from './routes/registration-route.js';
import loginRoute from './routes/authentication-route.js';
import changePasswordRoute from './routes/password-change-route.js';
import refreshTokenRoute from './routes/refresh-token-route.js';
import logoutRoute from './routes/logout-route.js';

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

fastify.route(registrationRoute);
fastify.route(loginRoute);
fastify.route(changePasswordRoute);
fastify.route(refreshTokenRoute);
fastify.route(logoutRoute);

cron.schedule('* * * * *', async () => {
	await db.deleteExpiredTokens();
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