import db from "./database-service.js";

const emailService = {
	changeEmail: async (userId, newEmail) => {
		const user = await db.getUserById(userId);
		if (!user) {
			return { status: 404, error: "User not found" };
		}
		if (user.error) {
			return { status: 500, error: "Internal Server Error" };
		}
		if (user.email === newEmail) {
			return { status: 400, error: "New email must be different from the current email" };
		}

	}
};