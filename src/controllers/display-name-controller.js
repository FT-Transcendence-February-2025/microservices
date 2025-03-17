import displayNameService from "../services/display-name-service.js";

const displayNameController = async (request, reply) => {
	const { newDisplayName } = request.body;
	const result = await displayNameService.changeDisplayName(request.user.id, newDisplayName);
	if (result.error) {
		return reply.status(result.status).send({ error: result.error });
	}

	return reply.send({ success: result.success });
};

export default displayNameController;