import avatarService from "../services/avatar-service.js";
import db from "../services/database-service.js";
import displayNameService from "../services/display-name-service.js";

const frontendController = {
	activeConnections: new Map(),
	websocketConnections: (connection, request) => {
		const userId = request.user.id;
		if (!userId) {
			connection.socket.close(4001, "Unauthorized: Missing userId");
			return;
		}

		activeConnections.set(userId, connection);
		console.log(`User ${userId} connected`);

		connection.socket.on("close", () => {
			activeConnections.delete(userId);
			console.log(`User ${userId} disconnected`);
		});

		connection.socket.on("error", (error) => {
			console.error(`WebSocket error for user ${userId}:`, error);
		});
	},
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

		return reply.send({ success: "Successfully responded to the request" });
	}
};

export default frontendController;