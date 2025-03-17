import jwt from "jsonwebtoken";
import db from "./database-service.js";
import * as crypto from "crypto";

const refreshTokenService = async (refreshToken, userAgent) => {
	try {
		const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);

		const deviceHash = crypto.createHash('sha256').update(userAgent).digest('hex');
		const device = await db.getDevice(deviceHash);
		if (device.error) {
			return { status: 500, error: "Internal Server Error" };
		}
		if (!device || device.token !== refreshToken) {
			return { status: 401, error: "Invalid refresh token" };
		}
    if (device.expires_at < Date.now() / 1000) {
      return { status: 401, error: "Refresh token expired" };
    }
		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.SECRET_KEY, { expiresIn: "15m" });

		return { token: accessToken };
	} catch (error) {
		console.error(error);
		return { status: 500, error: "Internal Server Error" };
	}
};

export default refreshTokenService;