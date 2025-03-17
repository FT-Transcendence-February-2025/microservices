import refreshTokenService from "../services/refresh-token-service.js";

const refreshTokenController = async (request, reply) => {
	const signedRefreshToken = request.cookies.refreshToken;
	if (!signedRefreshToken) {
		return reply.status(401).send({ error: "Unauthorized: No token provided" });
	}
	const { valid, value: refreshToken } = request.unsignCookie(signedRefreshToken);
	if (!valid) {
		return reply.status(401).send({ error: "Unauthorized: Invalid cookie signature" });
	}

	const refreshTokenResult = await refreshTokenService(refreshToken, request.headers["user-agent"]);
	if (refreshTokenResult.error) {
		return reply.status(refreshTokenResult.status).send({ error: refreshTokenResult.error });
	}

	return reply.send({ token: refreshTokenResult.token });
};

export default refreshTokenController;