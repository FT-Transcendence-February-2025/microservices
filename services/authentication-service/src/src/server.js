import Fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import checkAndCreateTables from "./database/migrations/create-tables.js";
import cron from "node-cron";
import db from "./services/database-service.js";
import registrationRoute from "./routes/frontend/registration-route.js";
import loginRoute from "./routes/frontend/login-route.js";
import loginSmsRoute from "./routes/frontend/login-sms-route.js";
import loginAppRoute from "./routes/frontend/login-app-route.js";
import loginEmailRoute from "./routes/frontend/login-email-route.js";
import passwordRoute from "./routes/frontend/password-route.js";
import refreshTokenRoute from "./routes/frontend/refresh-token-route.js";
import logoutRoute from "./routes/frontend/logout-route.js";
import emailRoute from "./routes/frontend/email-route.js";
import verifyEmailRoute from "./routes/frontend/verify-email-route.js";
import dataChangeRequestRoute from "./routes/frontend/data-change-request-route.js";
import confirmationLinkRequestRoute from "./routes/frontend/confirmation-link-request-route.js";
import getUserEmailVerifiedRoute from "./routes/user-management/get-user-email-verified.js";
import updatePhoneNumberRoute from "./routes/frontend/update-phone-number-route.js";
import changeTwoFactorAuthModeRoute from "./routes/frontend/change-two-factor-auth-mode-route.js";
import deletePhoneNumberRoute from "./routes/frontend/delete-phone-number-route.js";
import addAuthenticatorAppRoute from "./routes/frontend/add-authenticator-app-route.js";
import confirmAuthenticatorAppRoute from "./routes/frontend/confirm-authenticator-app-route.js";
import deleteAuthenticatorAppRoute from "./routes/frontend/delete-authenticator-app-route.js";
import resendTwoFactorVerificationCodeRoute from "./routes/frontend/resend-two-factor-verification-code-route.js";
const { default: fastifyMailer } = await import('fastify-mailer');
////////////////////////////////////////////////////DOCKER CONTAINER end
import config from "./config/config.js";
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

fastify.register(registrationRoute, { prefix: config.apiPrefix });
fastify.register(loginRoute, { prefix: config.apiPrefix });
fastify.register(loginSmsRoute, { prefix: config.apiPrefix });
fastify.register(loginAppRoute, { prefix: config.apiPrefix });
fastify.register(loginEmailRoute, { prefix: config.apiPrefix });
fastify.register(emailRoute, { prefix: config.apiPrefix });
fastify.register(passwordRoute, { prefix: config.apiPrefix });
fastify.register(refreshTokenRoute, { prefix: config.apiPrefix });
fastify.register(logoutRoute, { prefix: config.apiPrefix });
fastify.register(verifyEmailRoute, { prefix: config.apiPrefix });
fastify.register(dataChangeRequestRoute, { prefix: config.apiPrefix });
fastify.register(confirmationLinkRequestRoute, { prefix: config.apiPrefix });
fastify.register(getUserEmailVerifiedRoute, { prefix: config.apiPrefix });
fastify.register(updatePhoneNumberRoute, { prefix: config.apiPrefix });
fastify.register(changeTwoFactorAuthModeRoute, { prefix: config.apiPrefix });
fastify.register(deletePhoneNumberRoute, { prefix: config.apiPrefix });
fastify.register(addAuthenticatorAppRoute, { prefix: config.apiPrefix });
fastify.register(confirmAuthenticatorAppRoute, { prefix: config.apiPrefix });
fastify.register(deleteAuthenticatorAppRoute, { prefix: config.apiPrefix });
fastify.register(resendTwoFactorVerificationCodeRoute, { prefix: config.apiPrefix });

const tablesToCheck = ["auth_codes", "devices", "two_factor_auth", "users"];

const startServer = async () => {
  try {
    await checkAndCreateTables(tablesToCheck);

    // Schedule regular cleanup every 12 hours.
    cron.schedule('0 */12 * * *', async () => {
      await db.deleteExpiredTokens();
    	await db.deleteExpiredAuthCodes();
		});

    // Initial cleanup.
    await db.deleteExpiredTokens();
		await db.deleteExpiredAuthCodes();

    // A simple health endpoint.
    fastify.get('/', (request, reply) => {
      return { message: 'Fastify server of authentication-service running' };
    });

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
