import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
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
import blockUserRoute from "./routes/frontend/block-user-route.js";
import unblockUserRoute from "./routes/frontend/unblock-user-route.js";
import getBlockListRoute from "./routes/frontend/get-block-list-route.js";
import getUserFriendListRoute from "./routes/tournament/get-user-friend-list-route.js";
////////////////////////////////////////////////////DOCKER CONTAINER start
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

////////////////////////////////////////////////////DOCKER CONTAINER end

// Register plugins:
fastify.register(fastifyMultipart);
fastify.register(fastifyWebsocket);

// Register routes:
fastify.register(newUserRoute, { prefix: config.apiPrefix });
fastify.register(userExistsRoute, { prefix: config.apiPrefix });
fastify.register(avatarRoute, { prefix: config.apiPrefix });
fastify.register(displayNameRoute, { prefix: config.apiPrefix });
fastify.register(websocketRoute, { prefix: config.apiPrefix });
fastify.register(userLogoutRoute, { prefix: config.apiPrefix });
fastify.register(getFriendsRoute, { prefix: config.apiPrefix });
fastify.register(getMatchHistoryRoute, { prefix: config.apiPrefix });
fastify.register(inviteFriendRoute, { prefix: config.apiPrefix });
fastify.register(respondFriendRoute, { prefix: config.apiPrefix });
fastify.register(inviteGameRoute, { prefix: config.apiPrefix });
fastify.register(profileRoute, { prefix: config.apiPrefix });
fastify.register(inviteTournamentRoute, { prefix: config.apiPrefix });
fastify.register(removeFriendRoute, { prefix: config.apiPrefix });
fastify.register(blockUserRoute, { prefix: config.apiPrefix });
fastify.register(unblockUserRoute, { prefix: config.apiPrefix });
fastify.register(getBlockListRoute, { prefix: config.apiPrefix });
fastify.register(getUserRoute, { prefix: config.apiPrefix });
fastify.register(getUserFriendListRoute, { prefix: config.apiPrefix });

const tablesToCheck = ["block_list", "friend_list", "match_history", "users"];

const startServer = async () => {
  try {
    // Ensure all required tables exist before starting the server.
    await checkAndCreateTables(tablesToCheck);

    // Start the Fastify server.
    fastify.get("/", (request, reply) => {
			return { message: "Fastify server of user-management service running" };
		});

    fastify.listen({ port: PORT, host: '0.0.0.0' }, (error, address) => {
			if (error) {
				console.error(error);
				process.exit(1);
			}
			console.log(`Server listening at ${address}`);
			console.log(`Server listening at ${config.apiPrefix}`);
		});
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
