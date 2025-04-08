import authenticationService from "../services/authentication-service.js";
import avatarService from "../services/avatar-service.js";
import db from "../services/database-service.js";
import displayNameService from "../services/display-name-service.js";

const frontendController = {
	activeConnections: new Map(),
	websocketConnections: async (connection, request) => {
		try {
			frontendController.activeConnections.set(request.user.id, connection);
			console.log(`User ${request.user.id} connected`);

			if (!await authenticationService.getUserEmailVerified(request.user.id)) {
				try {
					connection.send(JSON.stringify({ type: "notification_verify_email" }));
				} catch (error) {
					console.error(`Error in function frontendController in function connection.send: `, error, `. Skipping this 
						notification...`);
				}
			}


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
				frontendController.activeConnections.delete(request.user.id);
				console.log(`User ${request.user.id} disconnected`);
			});

			connection.on("error", (error) => {
				console.error(`WebSocket error for user ${request.user.id}:`, error);
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

		if (request.user.id === invitedId) {
			return reply.status(400).send({ error: "Users cannot invite themselves to friends" });
		}
		const invitingUser = await db.getUser(request.user.id);
		if (!invitingUser) {
			return reply.status(404).send({ error: "Inviting user not found" });
		}
		if (invitingUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const invitedUser = await db.getUser(invitedId);
		if (!invitedUser) {
			return reply.status(404).send({ error: "Invited user not found" });
		}
		if (invitedUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const isInvitingUserBlocked = await db.isOnBlockList(invitedUser.id, invitingUser.id);
		if (isInvitingUserBlocked) {
			if (isInvitingUserBlocked.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "You have been blocked by this user" });
		}
		const isInvitedUserBlocked = await db.isOnBlockList(invitingUser.id, invitedUser.id);
		if (isInvitedUserBlocked) {
			if (isInvitedUserBlocked.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "This user is on your block list" });
		}

		const existingBound = await db.getFriendBoundInvSpecific(invitingUser.id, invitedUser.id);
		if (existingBound) {
			if (existingBound.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(409).send({ error: "Friend request already sent" });
		}

		const result = await db.addFriendBound(invitingUser.id, invitedUser.id, "pending");
		if (result.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const connection = frontendController.activeConnections.get(invitedUser.id);	
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
	removeFriend: async (request, reply) => {
		const { idToRemove } = request.body;

		const friends = await db.getFriendBoundAccepted(request.user.id, idToRemove);
		if (!friends) {
			return reply.status(400).send({ error: "Users are not friends already" });
		}

		const deleteResult = await db.deleteFriendBound(request.user.id, idToRemove);
		if (deleteResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: `User id=${idToRemove} removed from friends` });
	},
	respondFriend: async (request, reply) => {
		const { invitingId, accepted } = request.body;

		const friends = await db.getFriendBoundAccepted(invitingId, request.user.id);
		if (friends) {
			if (friends.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "User already accepted the invitation" });
		}
		
		if (accepted) {
			const updateResult = await db.updateFriendBoundStatus(invitingId, request.user.id, "accepted");
			if (updateResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		} else {
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
	},
	blockUser: async (request, reply) => {
		const { idToBlock } = request.body;

		const isBlocked = await db.isOnBlockList(request.user.id, idToBlock);
		if (isBlocked) {
			if (isBlocked.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "User is already on the block list" });
		}

		const friendsOrInvited = await db.getFriendBoundAny(request.user.id, idToBlock);
		if (friendsOrInvited) {
			if (friendsOrInvited.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			await db.deleteFriendBound(request.user.id, idToBlock);
		}

		const blockResult = await db.addToBlockList(request.user.id, idToBlock);
		if (blockResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "User has been blocked" });
	},
	unblockUser: async (request, reply) => {
		const { idToUnblock } = request.body;

		const isBlocked = await db.isOnBlockList(request.user.id, idToUnblock);
		if (!isBlocked) {
			return reply.status(400).send({ error: "User is not on the block list" });
		}
		if (isBlocked.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const unblockResult = await db.deleteFromBlockList(request.user.id, idToUnblock);
		if (unblockResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "User has been unblocked" });
	}
};

export default frontendController;