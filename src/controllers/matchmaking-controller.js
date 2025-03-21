import db from "../services/database-service.js";

const matchmakingController = {
	getDisplayName: async (request, reply) => {
		const { userId } = request.body;

		const user = await db.getUser(userId);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}
			if (user.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}

		return reply.send({ success: "Found display name", displayName: user.display_name });
	}
};

export default matchmakingController;