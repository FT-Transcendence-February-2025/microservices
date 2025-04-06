import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";
import fastifyWebsocket from "@fastify/websocket";
import checkAndCreateTables from "./database/migrations/create-tables.js";
import newUserRoute from "./routes/authentication/new-user-route.js";
import userExistsRoute from "./routes/authentication/user-exists-route.js";
import avatarRoute from "./routes/frontend/avatar-route.js";
import displayNameRoute from "./routes/frontend/display-name-route.js";
import getUserRoute from "./routes/matchmaking/get-user-route.js";
import websocketRoute from "./routes/frontend/websocket-route.js";
import userLogoutRoute from "./routes/authentication/user-logout-route.js";
import getFriendsRoute from "./routes/frontend/get-friends-route.js";
import getMatchHistoryRoute from "./routes/matchmaking/get-match-history-route.js";
import inviteFriendRoute from "./routes/frontend/invite-friend-route.js";
import respondFriendRoute from "./routes/frontend/respond-friend-route.js";
import inviteGameRoute from "./routes/matchmaking/invite-game-route.js";
import profileRoute from "./routes/frontend/profile-route.js";
import inviteTournamentRoute from "./routes/tournament/invite-tournament-route.js";
import removeFriendRoute from "./routes/frontend/remove-friend.js";
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
// fastify.register(avatarRoute, { prefix: "/api" });
// fastify.register(displayNameRoute, { prefix: "/api" });
// fastify.register(matchmakingRoute, { prefix: "/api" });
// fastify.register(websocketRoute, { prefix: "/api" });
// fastify.register(userLogoutRoute, { prefix: "/api" });
// fastify.register(getFriendsRoute, { prefix: "/api" });
// fastify.register(getMatchHistoryRoute, { prefix: "/api" });
// fastify.register(inviteFriendRoute, { prefix: "/api" });
// fastify.register(respondFriendRoute, { prefix: "/api" });
// fastify.register(inviteGameRoute, { prefix: "/api" });
// fastify.register(profileRoute, { prefix: "/api" });
// fastify.register(inviteTournamentRoute, { prefix: "/api" });
// fastify.register(removeFriendRoute, { prefix: "/api" });
// Register routes:
fastify.register(newUserRoute);
fastify.register(userExistsRoute);
fastify.register(avatarRoute);
fastify.register(displayNameRoute);
fastify.register(getUserRoute);
fastify.register(websocketRoute);
fastify.register(userLogoutRoute);
fastify.register(getFriendsRoute);
fastify.register(getMatchHistoryRoute);
fastify.register(inviteFriendRoute);
fastify.register(respondFriendRoute);
fastify.register(inviteGameRoute);
fastify.register(profileRoute);
fastify.register(inviteTournamentRoute);
fastify.register(removeFriendRoute);

const tablesToCheck = ["friend_list", "match_history", "users"];

const startServer = async () => {
  try {
    // Ensure all required tables exist before starting the server.
    await checkAndCreateTables(tablesToCheck);

    // Start the Fastify server.
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
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
