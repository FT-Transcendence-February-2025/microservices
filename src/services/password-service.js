import fastify from "../server.js";
import userDataValidator from "../validation/validator.js";
import db from "./database-service.js";

const passwordService = {
	changePassword: async (user, currentPassword, newPassword) => {
		const isCurrentPasswordValid = await fastify.bcrypt.compare(currentPassword, user.password);
		if (!isCurrentPasswordValid) {
			return { status: 400, error: "Current password invalid" };
		}

		const passwordValidationResult =
			await userDataValidator.password(newPassword, user.email, user.displayName, currentPassword);
		if (!passwordValidationResult.valid) {
			return { status: passwordValidationResult.status, error: passwordValidationResult.error };
		}

		const hashedNewPassword = await fastify.bcrypt.hash(newPassword);
		const updatePasswordResult = await db.updatePassword(user.id, hashedNewPassword);
		if (updatePasswordResult.error) {
			return { status: 500, error: "Internal Server Error" };
		}

		return { message: "Your password has been changed" };
	}
};

export default passwordService;