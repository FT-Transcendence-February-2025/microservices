import authenticationService from "../services/authentication-service.js";

const authenticationController = async (request, reply) => {
  const { email, password } = request.body;

  const result = await authenticationService(email, password, request.headers["user-agent"]);
  if (result.error) {
    return reply.status(result.status).send({ error: result.error });
  }

	try {
		reply.setCookie("refreshToken", result.refreshToken, result.cookieOptions);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: error });
	}
  reply.send({ success: "You have successfully logged in", token: result.accessToken });
};

export default authenticationController;