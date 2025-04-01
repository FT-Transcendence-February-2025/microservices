import db from "../services/database-service.js";

const matchmakingController = {
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

	updateMatchHistory: async (request, reply) => {
		const { userId, opponentId, userScore, opponentScore, matchDate } = request.body;

		const addResult = await db.addMatch(userId, opponentId, userScore, opponentScore, matchDate);
		if (addResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Match history updated" });
	}
};

export default matchmakingController;