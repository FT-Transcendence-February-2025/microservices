import avatarService from "../services/avatar-service.js";
import db from "../services/database-service.js";
import displayNameService from "../services/display-name-service.js";

const frontendController = {
	activeConnections: new Map(),
	websocketConnections: async (connection, request) => {
		try {
			frontendController.activeConnections.set(request.user.id, connection);
			console.log(`User ${request.user.id} connected`);

			// Fetch and send pending friend requests
			const pendingFriendRequests = await db.getPendingInvitations(request.user.id);
			for (let i = 0; i < pendingFriendRequests.length; i++) {
				const invitingUser = await db.getUser(pendingFriendRequests[i].inviting_id);
				if (!invitingUser || invitingUser.error) {
					console.error(`Error in function frontendController.websocketConnections. Table 'friend_list' has entry id =
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
					console.error(`Error in function frontendController in function connection.send: `, error, `. Skipping this 
						notification...`);
				}
			}

			connection.on("close", () => {
				frontendController.activeConnections.delete(userId);
				console.log(`User ${userId} disconnected`);
			});

			connection.on("error", (error) => {
				console.error(`WebSocket error for user ${userId}:`, error);
			});
		} catch (error) {
			console.error("Error in websocketConnections:", error);
			connection.close(1011, "Internal Server Error"); // 1011 = Server Error
		}
	},
	getUserProfile: async (request, reply) => {
		const { userId } = request.params;

		const requestedUser = await db.getUser(userId);
		if (!requestedUser) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (requestedUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const friends = await db.areFriends(request.user.id, requestedUser.id);
		if (!friends) {
			return reply.status(403).send({ error: "Requesting user is not a friend of the requested user" })
		}

		const connection = frontendController.activeConnections.get(requestedUser.id);
		const online = connection ? true : false; 

		return reply.status(200).send({ 
			success: "Found user profile",
			displayName: requestedUser.display_name,
			avatarPath: requestedUser.avatar_path,
			wins: requestedUser.wins,
			loses: requestedUser.loses,
			online
		});
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

		const invitingUser = await db.getUser(request.user.id);
		if (!invitingUser) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (invitingUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const existingBound = await db.getFriendBound(invitingUser.id, invitedId);
		if (existingBound) {
			if (existingBound.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(409).send({ error: "Friend request already sent" });
		}

		const result = await db.addFriendBound(invitingUser.id, invitedId, "pending");
		if (result.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const connection = frontendController.activeConnections.get(invitedId);	
		if (connection) {
			try {
				connection.send(JSON.stringify({ 
					type: "notification_friend_request",
					invitingUser: {
						id: invitingUser.id,
						displayName: invitingUser.display_name
					}
				}))
			} catch (error) {
				console.error("Error in function frontendController.inviteFriend in function connection.send: ", error);
			}
		}

		return reply.send({ success: "Invite request has been sent" });
	},
	respondFriend: async (request, reply) => {
		const { invitingId, accepted } = request.body;
		if (accepted) {
			const updateResult = await db.updateFriendBoundStatus(invitingId, request.user.id, "accepted");
			if (updateResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		} else {
			console.log("will delete request as its rejected");
			const deleteResult = await db.deleteFriendBound(invitingId, request.user.id);
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