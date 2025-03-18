import Fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import cron from "node-cron";
import db from "./services/database-service.js";
import registrationRoute from "./routes/registration-route.js";
import loginRoute from "./routes/authentication-route.js";
import passwordRoute from "./routes/password-route.js";
import refreshTokenRoute from "./routes/refresh-token-route.js";
import logoutRoute from "./routes/logout-route.js";
import emailRoute from "./routes/email-route.js";

dotenv.config();

const fastify = Fastify();

fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12
});

// TODO: modify this later (current settings are for testing local frontend).
fastify.register(fastifyCors, {
	origin: ["http://127.0.0.1:8080"],
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true
});

fastify.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {}
})

fastify.route(registrationRoute);
fastify.route(loginRoute);
fastify.route(emailRoute);
fastify.route(passwordRoute);
fastify.route(refreshTokenRoute);
fastify.route(logoutRoute);

cron.schedule("0 */12 * * *", async () => {
	await db.deleteExpiredTokens();
});
await db.deleteExpiredTokens();

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

export default fastify;

// TODO: check and fix error codes.