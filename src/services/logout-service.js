import db from "./database-service.js";
import * as crypto from "crypto";

const logoutService = async (userId, userAgent) => {
	const deviceHash = crypto.createHash('sha256').update(userAgent).digest('hex');
	const deleteResult = await db.deleteDevice(userId, deviceHash);
	if (deleteResult.error) {
    return { status: 500, error: "Internal Server Error" };
	}
	const cookieOptions = {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    path: "/",
    maxAge: 0,
  };
	return { cookieOptions };
};

export default logoutService;