import database from "../database/database.js"

const db = {
	// Users table:
	addUser: async (id, displayName, avatarPath, wins, loses) => {
		try {
			await database("users").insert({ id, display_name: displayName, avatar_path: avatarPath, wins, loses });
			return { success: true };
		} catch (error) {
			console.error(error);
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
      console.error(error);
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
			console.error(error);
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
			console.error(error);
			return { error };
		}
	},
	// Match history table:
	addMatch: async (userId, opponentId, userScore, opponentScore, matchDate) => {
		try {
			await database("match_history").insert({
				user_id: userId, 
				opponent_id: opponentId,
				user_score: userScore,
				opponent_score: opponentScore,
				match_date: matchDate 
			});
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},
	// Friend list table:
	addFriendBound: async (user1Id, user2Id, status) => {
		try {
			await database("friend_list").insert({
				user1_id: user1Id, 
				user2_id: user2Id,
				status
			});
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},
	updateFriendBoundStatus: async (user1Id, user2Id, status) => {
		try {
			await database("friend_list")
				.where(() => {
					this.where({ user1_id: user1Id, user2_id: user2Id })
						.orWhere({ user1_id: user2Id, user2_id: user1Id });
				})
				.update({ status })
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},
	deleteFriendBound: async (user1Id, user2Id) => {
		try {
			await database("friend_list").
				where(() => {
					this.where({ user1_id: user1Id, user2_id: user2Id })
						.orWhere({ user1_id: user2Id, user2_id: user1Id });
				}).del();
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	}
};


export default db;