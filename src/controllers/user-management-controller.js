import db from "../services/database-service.js";

const userManagementController = {
	getUserEmailVerified: async (request, reply) => {
		const { userId } = request.body;

		const user = await db.getUserById(userId);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ verified: user.email_verified });
	}
};

export default userManagementController;