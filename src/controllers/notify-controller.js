import db from "../services/database-service.js";
import notifyService from "../services/notify-service.js";

const notifyController = {
	sendCode: async (request, reply) => {
		const { email, dataToChange } = request.body;
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
				type: "code",
				dataToChange
			},
			receiver: email
		});
		if (sendResult.error) {
			return reply.status(sendResult.status).send({ error: sendResult.error });
		}

		return reply.status(200).send({ success: "Verification code has been sent" });
	}
};

export default notifyController;