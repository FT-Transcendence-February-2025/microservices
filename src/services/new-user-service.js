import db from "./database-service.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_AVATAR_PATH = path.resolve(__dirname, "../uploads/avatars/avatar-default.png");

const newUserService = {
	createUser: async (id) => {
		const addResult = await db.addUser(id, "user" + id, DEFAULT_AVATAR_PATH, 0, 0);
		if (addResult.error) {
			return { status: 500, error: addResult.error };
		}

		return { success: true };
	}
};

export default newUserService;