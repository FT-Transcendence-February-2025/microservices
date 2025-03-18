import emailService from "../services/email-service.js";

const emailController = async (request, reply) => {
	const { email } = request.body;
	const changeResult = await emailService.changeEmail(request.user.id, email);
	if (changeResult.error) {
		return reply.status(changeResult.status).send({ error: changeResult.error });
	}

	return reply.send({ success: changeResult.success });
};

export default emailController;