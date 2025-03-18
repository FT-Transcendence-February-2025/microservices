import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";
import avatarUploadRoute from "./routes/avatar-upload-route.js";
import displayNameRoute from "./routes/display-name-route.js";
import newUserRoute from "./routes/new-user-route.js";
import matchmakingRoute from "./routes/matchmaking-route.js";

dotenv.config();

const fastify = Fastify({
//  logger: true
});

// Register plugins:
fastify.register(fastifyMultipart);

// Register routes:
fastify.route(avatarUploadRoute);
fastify.route(displayNameRoute);
fastify.route(newUserRoute);
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
