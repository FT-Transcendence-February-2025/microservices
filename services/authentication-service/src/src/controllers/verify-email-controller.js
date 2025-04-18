import notifyService from "../services/notify-service.js";
import db from "../services/database-service.js"

const verifyEmailController = async (request, reply) => {
	const { token } = request.params;

	const verificationResult = notifyService.verifyConfirmationToken(token, "link");
	if (verificationResult.error) {
		return reply.status(401).send({ error: verificationResult.error });
	}

	const updateResult = await db.updateEmailVerified(verificationResult.userId, true);
	if (updateResult.error) {
		return reply.status(500).send({ error: "Internal Server Error" });
	}

	return reply.status(200).send({ success: "Email successfully verified" });
};

export default verifyEmailController;