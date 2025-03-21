import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";
import newUserRoute from "./routes/authentication/new-user-route.js";
import userExistsRoute from "./routes/authentication/user-exists-route.js";
import avatarRoute from "./routes/frontend/avatar-route.js";
import displayNameRoute from "./routes/frontend/display-name-route.js";
import matchmakingRoute from "./routes/matchmaking/matchmaking-route.js";

dotenv.config();

const fastify = Fastify({
//  logger: true
});

// Register plugins:
fastify.register(fastifyMultipart);

// Register routes:
fastify.route(newUserRoute);
fastify.route(userExistsRoute);
fastify.route(avatarRoute);
fastify.route(displayNameRoute);
fastify.route(matchmakingRoute);

// fastify.route(registrationRoute);

fastify.get("/", (request, reply) => {
	return { message: "Fastify server of user-management service running" };
});

fastify.listen({ port: 3002, host: '0.0.0.0' }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
