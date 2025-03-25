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
		const { userId, oponnentId, userScore, opponentScore, matchDate } = request.body;
		const userDisplayName = await db.getUser(userId);
		if (!userDisplayName) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (userDisplayName.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		const oponnentDisplayName = await db.getUser(oponnentId);
		if (!oponnentDisplayName) {
			return reply.status(404).send({ error: "Oponnent not found" });
		}
		if (oponnentDisplayName.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const addResult = await db.addMatch(userDisplayName, oponnentDisplayName, userScore, opponentScore, matchDate);
		if (addResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Match history updated" });
	}
};

export default matchmakingController;