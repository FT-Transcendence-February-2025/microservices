import frontendController from "../controllers/frontend-controller.js";
import database from "../database/database.js"

const db = {
	// Users table:
	addUser: async (id, displayName, avatarPath, wins, loses) => {
		try {
			await database("users").insert({ id, display_name: displayName, avatar_path: avatarPath, wins, loses });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.addUser: ", error);
			return { error };
		}
	},
	getUser: async (identifier) => {
    try {
      let query = database("users");

      if (typeof identifier === "number") {
          query = query.where({ id: identifier });
      } else {
          query = query.where({ display_name: identifier });
      }

      return await query.first();
    } catch (error) {
      console.error("Error in function db.getUser: ", error);
      return { error };
    }
	},
	updateDisplayName: async (id, newDisplayName) => {
		try {
			await database("users")
				.where({ id })
				.update({ display_name: newDisplayName });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateDisplayName: ", error);
			return { error };
		}
	},
	updateAvatarPath: async (id, avatarPath) => {
		try {
			await database("users")
				.where({ id })
				.update({ avatar_path: avatarPath })
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateAvatarPath: ", error);
			return { error };
		}
	},
	// Match history table:
	addMatch: async (userDisplayName, opponentDisplayName, userScore, opponentScore, matchDate) => {
		try {
			await database("match_history").insert({
				user_display_name: userDisplayName, 
				opponent_display_name: opponentDisplayName,
				user_score: userScore,
				opponent_score: opponentScore,
				match_date: matchDate 
			});
			return { success: true };
		} catch (error) {
			console.error("Error in function db.addMatch: ", error);
			return { error };
		}
	},
	getUserMatchHistory: async (userId) => {
		try {
			return await database("match_history").where({ user_id: userId });
		} catch (error) {
			console.error("Error in function db.getUserMatchHistory: ", error);
			return { error };
		}
	},
	// Friend list table:
	addFriendBound: async (invitingId, invitedId, status) => {
		try {
			await database("friend_list").insert({
				inviting_id: invitingId, 
				invited_id: invitedId,
				status
		});
			return { success: true };
		} catch (error) {
			console.error("Error in function db.addFriendBound: ", error);
			return { error };
		}
	},
	getFriendBoundAny: async (id1, id2) => {
		try {
			return await database("friend_list")
				.where((QueryBuilder) => {
					QueryBuilder.where({ inviting_id: id1, invited_id: id2 })
						.orWhere({ inviting_id: id2, invited_id: id1 });
				})
				.first();
		} catch (error) {
			console.error("Error in function db.getFriendBoundAccepted: ", error);
			return { error };
		}
	},
	getFriendBoundAccepted: async (id1, id2) => {
		try {
			return await database("friend_list")
				.where((QueryBuilder) => {
					QueryBuilder.where({ inviting_id: id1, invited_id: id2 })
						.orWhere({ inviting_id: id2, invited_id: id1 });
				})
				.andWhere({ status: "accepted" })
				.first();
		} catch (error) {
			console.error("Error in function db.getFriendBoundAccepted: ", error);
			return { error };
		}
	},
	getFriendBoundInvSpecific: async (invitingId, invitedId) => {
		try {
			return await database("friend_list")
				.where({ inviting_id: invitingId, invited_id: invitedId })
				.first();
		} catch (error) {
			console.error("Error in function db.getFriendBoundInvSpecific: ", error);
			return { error };
		}
	},
	updateFriendBoundStatus: async (invitingId, invitedId, status) => {
		try {
			await database("friend_list")
				.where((QueryBuilder) => {
					QueryBuilder.where({ inviting_id: invitingId, invited_id: invitedId })
						.orWhere({ inviting_id: invitedId, invited_id: invitingId });
				})
				.update({ status })
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateFriendBoundStatus: ", error);
			return { error };
		}
	},
	deleteFriendBound: async (id1, id2) => {
		try {
			await database("friend_list").
				where((QueryBuilder) => {
					QueryBuilder.where({ inviting_id: id1, invited_id: id2 })
						.orWhere({ inviting_id: id2, invited_id: id1 });
				}).del();
			return { success: true };
		} catch (error) {
			console.error("Error in function db.deleteFriendBound: ", error);
			return { error };
		}
	},
	getPendingInvitations: async (invitedId) => {
		try {
			return await database("friend_list")
				.where({ invited_id: invitedId, status: "pending" });
		} catch (error) {
			console.error("Error in function db.getPendingInvitations: ", error);
			return { error };
		}
	},
	areFriends: async (user1, user2) => {
    try {
			const friendEntry = await database("friend_list")
				.where((QueryBuilder) => {
					QueryBuilder
						.where({ inviting_id: user1, invited_id: user2 })
						.orWhere({ inviting_id: user2, invited_id: user1 });
				})
				.andWhere({ status: "accepted" })
				.first();

			return !!friendEntry;
    } catch (error) {
			console.error("Error in function db.areFriends: ", error);
			return { error };
    }
	},
	getFriends: async (userId) => {
    try {
			const friendList = await database("friend_list")
				.where((qb) => {
					qb.where({ inviting_id: userId, status: "accepted" })
						.orWhere({ invited_id: userId, status: "accepted" });
				});

			const friendIds = friendList.map((entry) =>
				entry.inviting_id === userId ? entry.invited_id : entry.inviting_id
			);

			const friends = await database("users").whereIn("id", friendIds);

			const sanitizedFriends = friends.map((friend) => {
				const connection = frontendController.activeConnections.get(friend.id);
				const online = connection ? true : false;
		
				return {
						id: friend.id,
						displayName: friend.display_name,
						avatarPath: friend.avatar_path,
						wins: friend.wins,
						loses: friend.loses,
						online
				};
			});

			return sanitizedFriends;
    } catch (error) {
			console.error("Error in function db.getFriends: ", error);
			return { error };
    }
	},
	// Block list table:
	getBlockedUsers: async (blockingId) => {
    try {
			const blockList = await database("block_list")
				.where({ blocking_id: blockingId })
				.select("blocked_id");

			const blockedIds = blockList.map((entry) => entry.blocked_id);
			if (blockedIds.length === 0) {
				return [];
			}

			const users = await database("users").whereIn("id", blockedIds);

			const blockedUsers = users.map((user) => ({
				id: user.id,
				displayName: user.display_name,
				avatarPath: user.avatar_path,
			}));

			return blockedUsers;
    } catch (error) {
			console.error("Error in function db.getBlockedUsers: ", error);
			return { error };
    }
	},
	isOnBlockList: async (blockingId, blockedId) => {
  	try {
			const blockEntry = await database("block_list")
				.where({ blocking_id: blockingId, blocked_id: blockedId })
				.first();

			return !!blockEntry;
    } catch (error) {
			console.error("Error in function db.isOnBlockList: ", error);
			return { error };
    }
	},
	addToBlockList: async (blockingId, blockedId) => {
		try {
			await database("block_list").insert({ blocking_id: blockingId, blocked_id: blockedId });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.addToBlockList: ", error);
			return { error };
		}
	},
	deleteFromBlockList: async (blockingId, blockedId) => {
		try {
			await database("block_list")
				.where({ blocking_id: blockingId, blocked_id: blockedId })
				.del();
			return { success: true };
		} catch (error) {
			console.error("Error in function db.deleteFromBlockList: ", error);
			return { error };
		}
	}
};

export default db;