import Fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import cron from "node-cron";
import db from "./services/database-service.js";
import registrationRoute from "./routes/registration-route.js";
import loginRoute from "./routes/authentication-route.js";
import changePasswordRoute from "./routes/password-change-route.js";
import refreshTokenRoute from "./routes/refresh-token-route.js";
import logoutRoute from "./routes/logout-route.js";

// Load environment variables early
dotenv.config({ path: process.env.ENV_FILE_PATH });
// dotenv.config({ path: '/run/secrets/envsecret' });
// dotenv.config();
// Create Fastify instance with built-in logging enabled.
const fastify = Fastify({
  logger: true,
});

// Register bcrypt with a defined salt work factor for secure password operations.
fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12,
});

// Dynamic CORS configuration to support local development and production.
// Adjust allowedOrigins as needed. In production, requests come via HTTPS.
fastify.register(fastifyCors, {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl or Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      // In production, the domain should be defined as HTTPS.
      `https://${process.env.DOMAIN}`,
      // Local development origins.
    //   "http://127.0.0.1:8080",
    //   "http://localhost:3000",
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

// Ensure that a secret for cookie parsing has been defined.
if (!process.env.COOKIE_SECRET) {
  fastify.log.error("COOKIE_SECRET is not defined in environment variables.");
  process.exit(1);
}
fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: {},
});

// Register routes with an optional prefix for a clean API namespace; adjust as needed.
fastify.register(registrationRoute, { prefix: "/api" });
fastify.register(loginRoute, { prefix: "/api" });
fastify.register(changePasswordRoute, { prefix: "/api" });
fastify.register(refreshTokenRoute, { prefix: "/api" });
fastify.register(logoutRoute, { prefix: "/api" });

// Schedule a cron job to delete expired tokens every 12 hours.
cron.schedule("0 */12 * * *", async () => {
  try {
    await db.deleteExpiredTokens();
    fastify.log.info("Expired tokens deleted successfully (cron).");
  } catch (err) {
    fastify.log.error("Error deleting expired tokens in cron job:", err);
  }
});

// Optionally run token deletion immediately on startup.
(async () => {
	try {
	  await db.deleteExpiredTokens();
	  fastify.log.info("Initial expired tokens deletion completed.");
	} catch (err) {
	  fastify.log.error("Error during initial token deletion:", err);
	}
})();

fastify.listen({ port: 3001, host: '0.0.0.0' }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

export default fastify;

// TODO: check and fix error codes.
// TODO: refactor with controllers and services.