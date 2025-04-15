import frontendController from "./frontend-controller.js";
import db from "../services/database-service.js";

const tournamentController = {
	sendTournamentInvitations: async (request, reply) => {
		const { tournamentId, tournamentName, invitingUserId, ids } = request.body;
		for (let i = 0; i < ids.length; i++) {
			const isInvitingUserBlocked = await db.isOnBlockList(ids[i], invitingUserId);
			if (isInvitingUserBlocked) {
				if (isInvitingUserBlocked.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				continue;
			}
			const isInvitedUserBlocked = await db.isOnBlockList(invitingUserId, ids[i]);
			if (isInvitedUserBlocked) {
				if (isInvitedUserBlocked.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				continue;
			}
			
			const connection = frontendController.activeConnections.get(ids[i]);
			if (connection) {
				try {
					connection.send(JSON.stringify({ 
						type: "notification_tournament_invite",
						tournament: {
							id: tournamentId,
							name: tournamentName
						}
					}));
				} catch (error) {
					console.error(`Error in function tournamentController in function connection.send: `, error, `. Skipping this 
						notification...`);
				}
			}
		}
		return reply.status(200).send({ success: "Sent tournament invitations to online users" });
	},
	getUserFriendList: async (request, reply) => {
		const { userId } = request.params;
		
		const friends = await db.getFriends(userId);
		if (friends && friends.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Returning users found (can be empty)", friends }); 
	}
};

export default tournamentController;