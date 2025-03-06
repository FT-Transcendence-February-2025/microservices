import db from "./database-service.js";

const logoutService = async (userId) => {
	const deleteResult = await db.deleteRefreshToken(userId);
	if (deleteResult.error) {
    return { status: 500, error: "Internal Server Error" };
	}
  const expiresInSeconds = 7 * 24 * 60 * 60;
	const cookieOptions = {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    path: "/",
    maxAge: expiresInSeconds
  };
	return { cookieOptions };
};

export default logoutService;