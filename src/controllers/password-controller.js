import passwordService from "../services/password-service.js";

const passwordController = {
	changePassword: async (request, reply) => {
		const { currentPassword, newPassword } = request.body;
		const passwordChangeResult = await passwordService.changePassword(request.user.id, currentPassword, newPassword);
		if (passwordChangeResult.error) {
			return reply.status(passwordChangeResult.status).send({ error: passwordChangeResult.error });
		}
		return reply.send({ success: passwordChangeResult.message });
	}
};

export default passwordController;