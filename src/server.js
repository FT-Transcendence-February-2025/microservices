import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";
import fastifyWebsocket from "@fastify/websocket";
import newUserRoute from "./routes/authentication/new-user-route.js";
import userExistsRoute from "./routes/authentication/user-exists-route.js";
import avatarViewRoute from "./routes/frontend/avatar-view-route.js";
import avatarChangeRoute from "./routes/frontend/avatar-change-route.js";
import displayNameRoute from "./routes/frontend/display-name-route.js";
import getUserRoute from "./routes/get-user-route.js";
import websocketRoute from "./routes/frontend/websocket-route.js";
import userLogoutRoute from "./routes/authentication/user-logout-route.js";
import getFriendsRoute from "./routes/frontend/get-friends-route.js";
import getMatchHistoryRoute from "./routes/matchmaking/get-match-history-route.js";
import inviteFriendRoute from "./routes/frontend/invite-friend-route.js";
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
// fastify.register(websocketRoute, { prefix: "/api" });
// fastify.register(userLogoutRoute, { prefix: "/api" });
// fastify.register(getFriendsRoute, { prefix: "/api" });
// fastify.register(getMatchHistoryRoute, { prefix: "/api" });
// fastify.register(inviteFriendRoute, { prefix: "/api" });
// Register routes:
fastify.register(newUserRoute);
fastify.register(userExistsRoute);
fastify.register(avatarViewRoute);
fastify.register(avatarChangeRoute);
fastify.register(displayNameRoute);
fastify.register(getUserRoute);
fastify.register(websocketRoute);
fastify.register(userLogoutRoute);
fastify.register(getFriendsRoute);
fastify.register(getMatchHistoryRoute);
fastify.register(inviteFriendRoute);

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
