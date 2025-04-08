import Fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import checkAndCreateTables from "./database/migrations/create-tables.js";
import cron from "node-cron";
import db from "./services/database-service.js";
import registrationRoute from "./routes/frontend/registration-route.js";
import loginRoute from "./routes/frontend/authentication-route.js";
import passwordRoute from "./routes/frontend/password-route.js";
import refreshTokenRoute from "./routes/frontend/refresh-token-route.js";
import logoutRoute from "./routes/frontend/logout-route.js";
import emailRoute from "./routes/frontend/email-route.js";
import verifyEmailRoute from "./routes/frontend/verify-email-route.js";
import dataChangeRequestRoute from "./routes/frontend/data-change-request-route.js";
import confirmationLinkRequestRoute from "./routes/frontend/confirmation-link-request-route.js";
import getUserEmailVerifiedRoute from "./routes/user-management/get-user-email-verified.js";
const { default: fastifyMailer } = await import('fastify-mailer');
////////////////////////////////////////////////////DOCKER CONTAINER end
import fs from "fs";

// // Load environment variables
// if (fs.existsSync(process.env.ENV_FILE_PATH)) {
// //   dotenv.config({ paxth: process.env.ENV_FILE_PATH });
	dotenv.config();
// } else {
//   console.warn(`Environment file not found at ${process.env.ENV_FILE_PATH}`);
// }

// // Validate required environment variables
// const requiredVariables = [
//   "ENV_FILE_PATH",
//   "NODE_ENV",
//   "DOMAIN",
//   "COOKIE_SECRET",
// ];
// const missingVariables = requiredVariables.filter((key) => !process.env[key]);

// if (missingVariables.length > 0) {
//   console.error(
//     `Missing required environment variables: ${missingVariables.join(", ")}`
//   );
//   process.exit(1); // Exit the process with an error code
// }

const fastify = Fastify({
	// logger: {
	//   transport: {
	// 	target: 'pino-pretty', // Use pino-pretty for pretty printing.
	// 	options: {
	// 	  translateTime: 'SYS:standard', // Formats the timestamp into a human-readable date.
	// 	  colorize: true, // Colorize output in development.
	// 	}
	//   }
	// }
});

////////////////////////////////////////////////////DOCKER CONTAINER end

fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12
});

// TODO: modify this later (current settings are for testing local frontend).
// new update to work in docker compose
fastify.register(fastifyCors, {
    origin: [
        `https://${process.env.DOMAIN}`,
        `http://auth.${process.env.DOMAIN}`,
		`locahost`
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
});	


fastify.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {}
});

fastify.register(fastifyMailer, {
  transport: {
    host: "smtp.gmail.com",
	  port: 465,
	  secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  }
});

// fastify.register(registrationRoute, { prefix: "/api" });
// fastify.register(loginRoute, { prefix: "/api" });
// fastify.register(emailRoute, { prefix: "/api" });
// fastify.register(passwordRoute, { prefix: "/api" });
// fastify.register(refreshTokenRoute, { prefix: "/api" });
// fastify.register(logoutRoute, { prefix: "/api" });
// fastify.register(verifyEmailRoute, { prefix: "/api" });
// fastify.register(dataChangeRequestRoute, { prefix: "/api" });
// fastify.register(confirmationLinkRequestRoute, { prefix: "/api" });
// fastify.register(getUserEmailVerifiedRoute, { prefix: "/api" });
fastify.register(registrationRoute);
fastify.register(loginRoute);
fastify.register(emailRoute);
fastify.register(passwordRoute);
fastify.register(refreshTokenRoute);
fastify.register(logoutRoute);
fastify.register(verifyEmailRoute);
fastify.register(dataChangeRequestRoute);
fastify.register(confirmationLinkRequestRoute);
fastify.register(getUserEmailVerifiedRoute);

const tablesToCheck = ["devices", "users"];

const startServer = async () => {
  try {
    // Ensure all required tables exist before starting the server.
    await checkAndCreateTables(tablesToCheck);

    // Run scheduled refresh token check and delete expired tokens.
    cron.schedule("0 */12 * * *", async () => {
      await db.deleteExpiredTokens();
    	await db.deleteExpiredEmailCodes();
});

    // Perform an initial cleanup of expired tokens.
    await db.deleteExpiredTokens();
		await db.deleteExpiredEmailCodes();

    // Start the Fastify server.
    fastify.get("/", (request, reply) => {
      return { message: "Fastify server of authentication-service running" };
    });

    fastify.listen({ port: 3001, host: '0.0.0.0' }, (error, address) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

export default fastify;

// TODO: check and fix error codes.