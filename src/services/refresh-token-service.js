import jwt from "jsonwebtoken";

const refreshTokenService = (refreshToken) => {
	try {
		const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);

		const accessToken = jwt.sign(
			{ userId: decoded.userId },
			process.env.SECRET_KEY,
			{ expiresIn: "15m" }
		);

		return { token: accessToken };
	} catch (error) {
		return { status: 500, error: "Internal Server Error" };
	}
};

export default refreshTokenService;