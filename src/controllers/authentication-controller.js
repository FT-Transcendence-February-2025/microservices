import db from "../services/database-service.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_AVATAR_PATH = path.resolve(__dirname, "../uploads/avatars/avatar-default.png");

const authenticationController = {
	newUser: async (request, reply) => {
		const { userId, displayName } = request.body;
		const newUserResult = await db.addUser(userId, displayName, DEFAULT_AVATAR_PATH, 0, 0);
		if (newUserResult.error) {
			return reply.status(newUserResult.status).send({ error: "Internal Server Error" });
		}
	
		return reply.send({ success: "User created" });
	},
	userExists: async (request, reply) => {
		const { displayName } = request.body;
		const user = await db.getUser(displayName);
		if (!user) {
			return reply.status(200).send({ exists: false });
		}
		if (user.error) {
			console.error("Error while checking for display name existence: ", user.error);
			return reply.status(500).send({ error: "Internal Server Errror" });
		}
		return reply.status(200).send({ exists: true });
	}
};

export default authenticationController;