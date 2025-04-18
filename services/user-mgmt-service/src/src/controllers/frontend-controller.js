import avatarService from "../services/avatar-service.js";
import db from "../services/database-service.js";
import displayNameService from "../services/display-name-service.js";
import jwt from "jsonwebtoken";
import websocketService from "../services/websocket-service.js";

const frontendController = {
	activeConnections: new Map(),
	websocketConnections: async (connection, request) => {
    try {
			let isVerified = false;
			const timeout = setTimeout(() => {
				if (!isVerified) {
					connection.close(4001, "Token not received or invalid");
				}
			}, 5000);

			let payload;
			connection.on("message", (data) => {
				try {
					const message = JSON.parse(data);
					if (message.type === "authenticate" && message.token) {
						payload = jwt.verify(message.token, process.env.SECRET_KEY);

						isVerified = true;
						clearTimeout(timeout);

						frontendController.activeConnections.set(payload.userId, connection);
						console.log(`User ${payload.userId} connected`);

						(async () => {
							await websocketService.notifyFriendRequests(payload.userId, connection);
							await websocketService.notifyVerifyEmail(payload.userId, connection);
						})();
					}
				} catch (error) {
					console.error("Error in function frontendController.websocketConnections:", error);
					connection.close(4002, "Invalid token or message format");
				}
			});

			connection.on("close", () => {
					frontendController.activeConnections.delete(payload.userId);
					console.log(`User ${payload.userId} disconnected`);
			});

			connection.on("error", (error) => {
					console.error(`WebSocket error for user ${payload.userId}:`, error);
			});
    } catch (error) {
        console.error("Error in websocketConnections:", error);
        connection.close(1011, "Internal Server Error");
    }
	},
	getUserProfile: async (request, reply) => {
		let { userId } = request.params;
		let ownProfile = false;
		if (!userId) {
			ownProfile = true;
			userId = request.user.id;
		}

		const requestedUser = await db.getUser(userId);
		if (!requestedUser) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (requestedUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		if (!ownProfile) {
			const friends = await db.areFriends(request.user.id, requestedUser.id);
			if (!friends) {
				return reply.status(403).send({ error: "Requesting user is not a friend of the requested user" })
			}
		}

		const connection = frontendController.activeConnections.get(requestedUser.id);
		const online = connection ? true : false;

		const matchHistory = await db.getUserMatchHistory(requestedUser.display_name);
		if (matchHistory.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ 
			success: "Found user profile",
			displayName: requestedUser.display_name,
			avatarPath: requestedUser.avatar_path,
			wins: requestedUser.wins,
			loses: requestedUser.loses,
			online,
			matchHistory
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
		const { invitedDisplayName } = request.body;

		const invitingUser = await db.getUser(request.user.id);
		if (!invitingUser) {
			return reply.status(404).send({ error: "Inviting user not found" });
		}
		if (invitingUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const invitedUser = await db.getUser(invitedDisplayName);
		if (!invitedUser) {
			return reply.status(404).send({ error: "Invited user not found" });
		}
		if (invitedUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (invitingUser.id === invitedUser.id) {
			return reply.status(400).send({ error: "Users cannot invite themselves to friends" });
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
		const { displayNameToRemove } = request.body;

		const userToRemove = await db.getUser(displayNameToRemove);
		if (!userToRemove) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (userToRemove.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const friends = await db.getFriendBoundAccepted(request.user.id, userToRemove.id);
		if (!friends) {
			return reply.status(400).send({ error: "Users are not friends already" });
		}

		const deleteResult = await db.deleteFriendBound(request.user.id, userToRemove.id);
		if (deleteResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: `User ${userToRemove.display_name} removed from friends` });
	},
	respondFriend: async (request, reply) => {
		const { invitingDisplayName, accepted } = request.body;

		const invitingUser = await db.getUser(invitingDisplayName);
		if (!invitingUser) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (invitingUser.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const friends = await db.getFriendBoundAccepted(invitingUser.id, request.user.id);
		if (friends) {
			if (friends.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "User already accepted the invitation" });
		}
		
		if (accepted) {
			const updateResult = await db.updateFriendBoundStatus(invitingUser.id, request.user.id, "accepted");
			if (updateResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		} else {
			const deleteResult = await db.deleteFriendBound(invitingUser.id, request.user.id);
			if (deleteResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		}

		return reply.status(200).send({ success: "Successfully responded to the request" });
	},
	getFriends: async (request, reply) => {
		const friends = await db.getFriends(request.user.id);
		if (friends && friends.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Returning users found (can be empty)", friends });
	},
	getBlockList: async (request, reply) => {
		const blockedList = await db.getBlockedUsers(request.user.id);
		if (blockedList && blockedList.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Returning list of blocked users (can be empty)", blockedList });
	},
	blockUser: async (request, reply) => {
		const { displayNameToBlock } = request.body;

		const userToBlock = await db.getUser(displayNameToBlock);
		if (!userToBlock) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (userToBlock.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const isBlocked = await db.isOnBlockList(request.user.id, userToBlock.id);
		if (isBlocked) {
			if (isBlocked.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			return reply.status(400).send({ error: "User is already on the block list" });
		}

		const friendsOrInvited = await db.getFriendBoundAny(request.user.id, userToBlock.id);
		if (friendsOrInvited) {
			if (friendsOrInvited.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			await db.deleteFriendBound(request.user.id, userToBlock.id);
		}

		const blockResult = await db.addToBlockList(request.user.id, userToBlock.id);
		if (blockResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "User has been blocked" });
	},
	unblockUser: async (request, reply) => {
		const { displayNameToUnblock } = request.body;

		const userToUnblock = await db.getUser(displayNameToUnblock);
		if (!userToUnblock) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (userToUnblock.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const isBlocked = await db.isOnBlockList(request.user.id, userToUnblock.id);
		if (!isBlocked) {
			return reply.status(400).send({ error: "User is not on the block list" });
		}
		if (isBlocked.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const unblockResult = await db.deleteFromBlockList(request.user.id, userToUnblock.id);
		if (unblockResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: `User ${userToUnblock.displayName} has been unblocked` });
	}
};

export default frontendController;