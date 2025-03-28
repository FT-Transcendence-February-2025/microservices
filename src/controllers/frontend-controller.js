import avatarService from "../services/avatar-service.js";
import db from "../services/database-service.js";
import displayNameService from "../services/display-name-service.js";

const frontendController = {
	activeConnections: new Map(),
	websocketConnections: async (connection, request) => {
		const userId = request.user.id;
		if (!userId) {
			connection.socket.close(4001, "Unauthorized: Missing userId");
			return;
		}

		activeConnections.set(userId, connection);
		console.log(`User ${userId} connected`);

		const pendingFriendRequests = await db.findPendingInvitations(userId);
		for (i = 0; i < pendingFriendRequests.length; i++) {
			const invitingUser = await db.getUser(pendingFriendRequests[i].inviting_id);
			if (!invitingUser) {
				console.error(`Error in function websocketConnections. Table 'friend_list' has entry id = ${pendingFriendRequests[i].id}, but invitingId from this entry was not found in users table. Sending next notifications...`);
				continue;
			}
			if (invitingUser.error) {
				continue;
			}
			connection.socket.send(JSON.stringify({ 
				type: "notification_friend",
				message: `Friend request from ${invitingUser.disply_name}`
			}));
		}
		
		connection.socket.on("close", () => {
			activeConnections.delete(userId);
			console.log(`User ${userId} disconnected`);
		});

		connection.socket.on("error", (error) => {
			console.error(`WebSocket error for user ${userId}:`, error);
		});
	},
	// TODO: verify if its necessary, as getUser returns avatar path inside the object
	avatarView: async (request, reply) => {
		const user = await db.getUser(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Found avatar path", filePath: user.avatar_path });
	},
	avatarChange: async (request, reply) => {
		try {
			const file = await request.file();
			if (!file) {
				return reply.status(400).send({ error: "No file uploaded" });
			}
	
			const result = await avatarService.uploadAvatar(file, request.user.id);
			if (result.error) {
				return reply.status(400).send({ error: result.error });
			}
	
			return reply.status(200).send({ success: "Avatar uploaded successfully", filePath: result.filePath });
		} catch (error) {
			console.error("Avatar upload error:", error);
			return reply.status(500).send({ error: "Something went wrong" });
		}
	},
	displayName: async (request, reply) => {
		const { displayName } = request.body;
		const result = await displayNameService.changeDisplayName(request.user.id, displayName);
		if (result.error) {
			return reply.status(result.status).send({ error: result.error });
		}
	
		return reply.send({ success: result.success });
	},
	inviteFriend: async (request, reply) => {
		const { invitedId } = request.body;
		const result = await db.addFriendBound(request.user.id, invitedId, "pending");
		if (result.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const connection = activeConnections.get(invitedId);
		if (connection) {
				connection.socket.send(JSON.stringify({ type: "notification", message }));
		}

		return reply.send({ success: "Invite request has been sent" });
	},
	respondFriend: async (request, reply) => {
		const { invitingId, accepted } = request.body;
		if (accepted) {
			updateResult = await db.updateFriendBoundStatus("accepted");
			if (updateResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		} else {
			deleteResult = await db.deleteFriendBound(invitingId, request.user.id);
			if (deleteResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}	
		}

		return reply.status(200).send({ success: "Successfully responded to the request" });
	},
	getFriends: async (request, reply) => {
		const friends = await db.getFriends(request.user.id);
		if (friends.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Returning users found (can be empty)", friends });
	}
};

export default frontendController;