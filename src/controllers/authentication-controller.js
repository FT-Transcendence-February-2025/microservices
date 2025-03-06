import authenticationService from "../services/authentication-service.js";

const authenticationController = async (request, reply) => {
  const { email, password } = request.body;
  const result = await authenticationService.authenticateUser(email, password);

  if (result.error) {
    console.error(result.error);
    return reply.status(result.status).send({ error: result.error });
  }

  reply.setCookie("refreshToken", result.refreshToken, result.cookieOptions);
  reply.send({ success: "You have successfully logged in", token: result.accessToken });
};

export default authenticationController;