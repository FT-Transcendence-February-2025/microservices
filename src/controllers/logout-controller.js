import logoutService from "../services/logout-service.js";

const logoutController = async (request, reply) => {
	const logoutResult = await logoutService(request.user.id);
	if (logoutResult.error) {
    return reply.status(logoutResult.status).send({ error: logoutResult.error });
	}
  reply.send({ success: "You have successfully logged out" });
};