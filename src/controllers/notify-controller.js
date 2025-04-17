import db from "../services/database-service.js";
import notifyService from "../services/notify-service.js";

const notifyController = {
	sendCode: async (request, reply) => {
		const { email, action } = request.body;
		const user = await db.getUserByEmail(email);
		if (!user) {
			return reply.status(404).send({ error: "Provided email is not valid" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (!user.email_verified) {
			return reply.status(400).send({ error: "Please verify your email before changing the password" });
		}

		const sendResult = await notifyService.sendEmail({
			settings: {
				emailType: "code",
				codeType: action
			},
			receiver: email
		});
		if (sendResult.error) {
			return reply.status(sendResult.status).send({ error: sendResult.error });
		}

		return reply.status(200).send({ success: "Verification code has been sent" });
	},
	sendConfirmationLink: async (request, reply) => {
		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const sendResult = await notifyService.sendEmail({
			settings: {
				emailType: "link",
				userId: user.id
			},
			receiver: user.email
		});
		if (sendResult.error) {
			return reply.status(sendResult.status).send({ error:sendResult.error });
		}

		return reply.status(200).send({ success: "Confirmation link sent" });
	}
};

export default notifyController;