import db from "./database-service.js";
import authenticationService from "./authentication-service.js";

const websocketService = {
	notifyVerifyEmail: async (userId, connection) => {
		if (!await authenticationService.getUserEmailVerified(userId)) {
			try {
				connection.send(JSON.stringify({ type: "notification_verify_email" }));
			} catch (error) {
				console.error(`Error in function frontendController in function connection.send: `, error,
					`. Skipping this notification...`);
			}
		}
	},
	notifyFriendRequests: async (userId, connection) => {
		const pendingFriendRequests = await db.getPendingInvitations(userId);
		for (let i = 0; i < pendingFriendRequests.length; i++) {
			const invitingUser = await db.getUser(pendingFriendRequests[i].inviting_id);
			if (!invitingUser || invitingUser.error) {
				console.error(`Error in function websocketService.notifyFriendRequests. Table 'friend_list' has entry id =
					${pendingFriendRequests[i].id}, but invitingId from this entry was not found in users table. Skipping this
					notification...`);
				continue;
			}
			try {
				connection.send(JSON.stringify({ 
					type: "notification_friend_request",
					invitingUser: {
						id: invitingUser.id,
						displayName: invitingUser.display_name
					}
				}));
			} catch (error) {
				console.error(`Error in function websocketService.notifyFriendRequests: `, error, `. Skipping this 
					notification...`);
			}
		}
	}
};

export default websocketService;