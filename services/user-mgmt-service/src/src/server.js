import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors"; 	
import newUserRoute from "./routes/authentication/new-user-route.js";
import userExistsRoute from "./routes/authentication/user-exists-route.js";
import avatarViewRoute from "./routes/frontend/avatar-view-route.js";
import avatarChangeRoute from "./routes/frontend/avatar-change-route.js";
import displayNameRoute from "./routes/frontend/display-name-route.js";
import matchmakingRoute from "./routes/matchmaking/matchmaking-route.js";
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
	logger: true
});

////////////////////////////////////////////////////DOCKER CONTAINER end
fastify.register(fastifyCors, {
	origin: [
		`https://${process.env.DOMAIN}`,
		`https://user.${process.env.DOMAIN}`
	],
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true
});

// Register plugins:
fastify.register(fastifyMultipart);

// // Register routes:
fastify.register(newUserRoute, { prefix: "/api" });
fastify.register(userExistsRoute, { prefix: "/api" });
fastify.register(avatarViewRoute, { prefix: "/api" });
fastify.register(avatarChangeRoute, { prefix: "/api" });
fastify.register(displayNameRoute, { prefix: "/api" });
fastify.register(matchmakingRoute, { prefix: "/api" });
// Register routes:
// fastify.register(newUserRoute);
// fastify.register(userExistsRoute);
// fastify.register(avatarViewRoute);
// fastify.register(avatarChangeRoute);
// fastify.register(displayNameRoute);
// fastify.register(matchmakingRoute);

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

export default fastify;
