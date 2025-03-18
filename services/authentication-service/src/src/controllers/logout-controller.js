import logoutService from "../services/logout-service.js";

const logoutController = async (request, reply) => {

	const logoutResult = await logoutService(request.user.id, request.headers["user-agent"]);
	if (logoutResult.error) {
    return reply.status(logoutResult.status).send({ error: logoutResult.error });
	}
	try {
		reply.setCookie("refreshToken", "", logoutResult.cookieOptions);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: error });
	}
  reply.send({ success: "You have successfully logged out" });
};

export default logoutController;