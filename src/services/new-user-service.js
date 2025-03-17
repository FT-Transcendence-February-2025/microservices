import db from "./database-service.js";

const newUserService = {
	createUser: async (id) => {
		const addResult = await db.addUser(id, "user" + id, "default", 0, 0);
		if (addResult.error) {
			return { status: 500, error: addResult.error };
		}

		return { success: true };
	}
};

export default newUserService;