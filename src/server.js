//server.js
import Fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import { default as fastifyMailer } from 'fastify-mailer';

import registrationRoute from './routes/frontend/registration-route.js';
import loginRoute from './routes/frontend/authentication-route.js';
import emailRoute from './routes/frontend/email-route.js';
import passwordRoute from './routes/frontend/password-route.js';
import refreshTokenRoute from './routes/frontend/refresh-token-route.js';
import logoutRoute from './routes/frontend/logout-route.js';
import verifyEmailRoute from './routes/frontend/verify-email-route.js';
import dataChangeRequestRoute from './routes/frontend/data-change-request-route.js';
import confirmationLinkRequestRoute from './routes/frontend/confirmation-link-request-route.js';
import getUserEmailVerifiedRoute from './routes/user-management/get-user-email-verified.js';

import checkAndCreateTables from './database/migrations/create-tables.js';
import cron from 'node-cron';
import db from './services/database-service.js';
// Importing configurations
import config from './config/config.js';
import { metricsRoute, addMetricsHook } from './config/metrics.js';
import { addLoggingHooks } from './config/logging.js';

const PORT = 3001
// Create your Fastify instance with the logger configuration from config.
const fastify = Fastify({
  logger: config.logger,
});


// Add the logging hooks
addLoggingHooks(fastify);
// Add the metrics hook to track all requests
addMetricsHook(fastify);
// Expose the /metrics endpoint
metricsRoute(fastify);

// Register plugins
fastify.register(fastifyBcrypt, { saltWorkFactor: 12 });

fastify.register(fastifyCors, {
    origin: [
        `https://${process.env.DOMAIN}`,
        `http://auth.${process.env.DOMAIN}`,
		`http://${process.env.IP}:${PORT}`,
		config.endpoints.auth
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
});	

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: {},
});

fastify.register(fastifyMailer, {
  transport: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  },
});

// Register your routes using a centralized prefix from the config.
fastify.register(registrationRoute, { prefix: config.apiPrefix });
fastify.register(loginRoute, { prefix: config.apiPrefix });
fastify.register(emailRoute, { prefix: config.apiPrefix });
fastify.register(passwordRoute, { prefix: config.apiPrefix });
fastify.register(refreshTokenRoute, { prefix: config.apiPrefix });
fastify.register(logoutRoute, { prefix: config.apiPrefix });
fastify.register(verifyEmailRoute, { prefix: config.apiPrefix });
fastify.register(dataChangeRequestRoute, { prefix: config.apiPrefix });
fastify.register(confirmationLinkRequestRoute, { prefix: config.apiPrefix });
fastify.register(getUserEmailVerifiedRoute, { prefix: config.apiPrefix });

// Table check and scheduled cleanup
const tablesToCheck = ['devices', 'email_codes', 'users'];

const startServer = async () => {
  try {
    await checkAndCreateTables(tablesToCheck);

    // Schedule regular cleanup every 12 hours.
    cron.schedule('0 */12 * * *', async () => {
      await db.deleteExpiredTokens();
      await db.deleteExpiredEmailCodes();
    });

    // Initial cleanup.
    await db.deleteExpiredTokens();
    await db.deleteExpiredEmailCodes();

    // A simple health endpoint.
    fastify.get('/', (request, reply) => {
      return { message: 'Fastify server of authentication-service running' };
    });

    // Start the server.
    fastify.listen({ port: PORT, host: '0.0.0.0' }, (error, address) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
	  console.log(`Server listening at ${process.env.IP}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export default fastify;
