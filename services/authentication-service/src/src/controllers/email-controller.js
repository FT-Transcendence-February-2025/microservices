import db from "../services/database-service.js";
import emailService from "../services/email-service.js";

const emailController = async (request, reply) => {
	const { email, verificationCode } = request.body;

	const user = await db.getUserById(request.user.id);
	if (!user) {
		return reply.status(404).send({ error: "User not found" });
	}
	if (user.error) {
		return reply.status(500).send({ error: "Internal Server Error" });
	}
	
	const emailCode = await db.getAuthCode(user.id, verificationCode, "email_change");
	if (emailCode.error) {
		return reply.status(emailCode.status).send({ error: emailCode.error });
	}

	const changeResult = await emailService.changeEmail(user, email);
	if (changeResult.error) {
		return reply.status(changeResult.status).send({ error: changeResult.error });
	}

	await db.deleteAuthCode(emailCode.id);

	return reply.send({ success: changeResult.success });
};

export default emailController;