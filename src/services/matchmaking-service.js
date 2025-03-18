import db from "./database-service.js";

const matchmakingService = {
	getDisplayName: async (userId) => {
		const user = await db.getUser(userId);
		if (!user) {
			return { status: 404, error: "User not found" };
		}
		if (user.error) {
			return { status: 500, error: "Internal Server Error" };
		}

		return { displayName: user.display_name };
	}
};

export default matchmakingService;