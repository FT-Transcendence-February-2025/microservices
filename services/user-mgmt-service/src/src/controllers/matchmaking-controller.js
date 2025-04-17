import db from "../services/database-service.js";
import frontendController from "./frontend-controller.js";

const matchmakingController = {
	getUser: async (request, reply) => {
		const { userId } = request.params;

		const user = await db.getUser(userId);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const connection = frontendController.activeConnections.get(userId);
		const online = connection ? true : false; 

		return reply.status(200).send({ 
			success: "Found user profile",
			displayName: user.display_name,
			avatarPath: user.avatar_path,
			wins: user.wins,
			loses: user.loses,
			online
		});
	},
	getMatchHistory: async (request, reply) => {
		const { userId } = request.params;

		const matchHistory = db.getUserMatchHistory(userId);
		if (!matchHistory) {
			return reply.status(200).send({ success: "Match history for this user is empty" });
		}
		if (matchHistory.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Sending user's match history", matches: matchHistory })
	},
	updateMatchHistory: async (request, reply) => {
		const { userId, opponentId, userScore, opponentScore, matchDate } = request.body;

		const user = await db.getUser(userId);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
		}

		const opponent = await db.getUser(opponentId);
		if (!opponent) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (opponent.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const addResult = await db.addMatch(user.display_name, opponent.display_name, userScore, opponentScore, matchDate);
		if (addResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Match history updated" });
	},
	inviteUserToGame: async (request, reply) => {
		const { invitingId, invitedId } = request.body;

		const invitingUser = await db.getUser(invitingId);
		if (!invitingId) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (invitingUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const isInvitingUserBlocked = await db.isOnBlockList(invitedId, invitingUser.id);
		if (isInvitingUserBlocked) {
			if (isInvitingUserBlocked.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "You have been blocked by this user" });
		}
		const isInvitedUserBlocked = await db.isOnBlockList(invitingUser.id, invitedId);
		if (isInvitedUserBlocked) {
			if (isInvitedUserBlocked.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "This user is on your block list" });
		}

		const connection = frontendController.activeConnections.get(invitedId);
		if (!connection) {
			return reply.status(200).send({ success: "User is offline", invitationSent: false });
		}
		try {
			connection.send(JSON.stringify({ 
				type: "notification_game_invite",
				invitingUser: {
					id: invitingUser.id,
					displayName: invitingUser.display_name
				}
			}));

			return reply.status(200).send({ success: "User is online", invitationSent: true });
		} catch (error) {
			console.error("Error in function matchmakingController.inviteUserToGame in function connection.send: ", error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	}
};

export default matchmakingController;