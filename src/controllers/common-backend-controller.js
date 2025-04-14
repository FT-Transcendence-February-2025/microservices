import db from "../services/database-service.js";
import frontendController from "./frontend-controller.js";

const commonBackendController = {
	getUser: async (request, reply) => {
		const { userId } = request.params;

		const user = await db.getUser(userId);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		const connection = frontendController.activeConnections.get(userId);
		const online = connection ? true : false;

		return reply.status(200).send({ 
			success: "Found user profile",
			displayName: user.display_name,
			avatarPath: user.avatar_path,
			wins: user.wins,
			loses: user.loses,
			online
		});
	}
};

export default commonBackendController;