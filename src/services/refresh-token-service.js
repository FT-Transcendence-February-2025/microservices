import jwt from 'jsonwebtoken';

const refreshTokenService = async (request, reply) => {
	try {
		const signedRefreshToken = request.cookies.refreshToken;
		if (!signedRefreshToken) {
			return reply.status(401).send({error: 'Unauthorized: No token provided' });
		}

		const { valid, value: refreshToken } = request.unsignCookie(signedRefreshToken);
		if (!valid) {
			return reply.status(401).send({ error: 'Unauthorized: Invalid cookie signature' });
		}

		const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
		request.user = { id: decoded.userId };

		const shortToken = jwt.sign(
			{ userId: decoded.userId },
			process.env.SECRET_KEY,
			{ expiresIn: '15m' }
		);

		reply.send({ token: shortToken });
	} catch (error) {
		reply.status(500).send({ error: "Internal Server Error" });
	}
};

export default refreshTokenService;