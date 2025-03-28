import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";
import fastifyWebsocket from "@fastify/websocket";
import newUserRoute from "./routes/authentication/new-user-route.js";
import userExistsRoute from "./routes/authentication/user-exists-route.js";
import avatarViewRoute from "./routes/frontend/avatar-view-route.js";
import avatarChangeRoute from "./routes/frontend/avatar-change-route.js";
import displayNameRoute from "./routes/frontend/display-name-route.js";
import getUserRoute from "./routes/matchmaking/get-user-route.js";
import websocketRoute from "./routes/frontend/websocket-route.js";
////////////////////////////////////////////////////DOCKER CONTAINER start
// import fs from "fs";

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
	// logger: true
});

////////////////////////////////////////////////////DOCKER CONTAINER end

// Register plugins:
fastify.register(fastifyMultipart);
fastify.register(fastifyWebsocket);

// // Register routes:
// fastify.register(newUserRoute, { prefix: "/api" });
// fastify.register(userExistsRoute, { prefix: "/api" });
// fastify.register(avatarViewRoute, { prefix: "/api" });
// fastify.register(avatarChangeRoute, { prefix: "/api" });
// fastify.register(displayNameRoute, { prefix: "/api" });
// fastify.register(matchmakingRoute, { prefix: "/api" });
// Register routes:
fastify.register(newUserRoute);
fastify.register(userExistsRoute);
fastify.register(avatarViewRoute);
fastify.register(avatarChangeRoute);
fastify.register(displayNameRoute);
fastify.register(getUserRoute);
fastify.register(websocketRoute);

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
