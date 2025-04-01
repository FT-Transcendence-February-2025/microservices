import db from "../services/database-service.js";

const matchmakingController = {
	// TODO: need to move this function somwhere else, it also servers different services, not only matchmaking service.
	getUser: async (request, reply) => {
		const { userId } = request.params;

		const user = await db.getUser(userId);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ 
			success: "Found display name",
			displayName: user.display_name,
			avatarPath: user.avatar_path,
			wins: user.wins,
			loses: user.loses
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
	}
};

export default matchmakingController;