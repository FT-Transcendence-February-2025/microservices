import newUserService from "../services/new-user-service.js";

const newUserController = async (request, reply) => {
	const { userId } = request.body;
	const newUserResult = newUserService.createUser(userId);
	if (newUserResult.error) {
		return reply.status(newUserResult.status).send({ error: newUserResult.error });
	}

	return reply.send({ success: newUserResult.success });
};

export default newUserController;