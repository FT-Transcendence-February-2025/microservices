import verifyEmailService from "../services/verify-email-service.js";

const verifyEmailController = async (request, reply) => {
	const { token } = request.params;
	const updateStatus = await verifyEmailService.setUserAsVerified(token);
	if (updateStatus.error) {
		return reply.status(updateStatus.status).send({ error: updateStatus.error });
	}

	return reply.status(200).send({ success: updateStatus.success });
};

export default verifyEmailController;