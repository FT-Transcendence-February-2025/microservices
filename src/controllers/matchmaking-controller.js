import matchmakingService from "../services/matchmaking-service.js";

const matchmakingController = async (request, reply) => {
	const { userId } = request.body;

	const displayName = await matchmakingService.getDisplayName(userId);
	if (displayName.error) {
		return reply.status(displayName.status).send({ error: displayName.error });
	}

	return reply.send({ success: "Found display name", displayName });
};

export default matchmakingController;