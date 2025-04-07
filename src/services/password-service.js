import fastify from "../server.js";
import userDataValidator from "../validation/validator.js";
import db from "./database-service.js";

const passwordService = {
	changePassword: async (userId, currentPassword, newPassword) => {
		const user = await db.getUserById(userId);
		if (!user) {
			return { status: 404, error: "User not found" };
		}
		if (user.error) {
			return { status: 500, error: "Internal Server Error" };
		}

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
		const updatePasswordResult = await db.updatePassword(userId, hashedNewPassword);
		if (updatePasswordResult.error) {
			return { status: 500, error: "Internal Server Error" };
		}

		return { message: "Your password has been changed" };
	}
};

export default passwordService.changePassword;