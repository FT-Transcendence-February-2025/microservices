import db from "../services/database-service.js";
import passwordService from "../services/password-service.js";

const passwordController = {
	changePassword: async (request, reply) => {
		const { verificationCode, newPassword } = request.body;

		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		
		const emailCode = await db.getAuthCode(user.id, verificationCode, "password_change");
		if (emailCode.error) {
			return reply.status(emailCode.status).send({ error: emailCode.error });
		}

		const passwordChangeResult = await passwordService.changePassword(user, newPassword);
		if (passwordChangeResult.error) {
			return reply.status(passwordChangeResult.status).send({ error: passwordChangeResult.error });
		}

		await db.deleteAuthCode(emailCode.id);

		return reply.send({ success: passwordChangeResult.message });
	}
};

export default passwordController;