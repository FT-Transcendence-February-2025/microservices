import passwordChangeService from "../services/password-change-service.js";

const passwordChangeController = async (request,reply) => {
	const { currentPassword, newPassword } = request.body;
	const passwordChangeResult = await passwordChangeService(request.user.id, currentPassword, newPassword);
	if (passwordChangeResult.error) {
		console.error(passwordChangeResult.error);
		return reply.status(passwordChangeResult.status).send({ error: passwordChangeResult.error });
	}
	return reply.send({ success: passwordChangeResult.message });
};

export default passwordChangeController;