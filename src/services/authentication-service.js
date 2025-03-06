import fastify from "../server.js";
import jwt from "jsonwebtoken";
import db from "./database-service.js";

const authenticationService = async (email, password) => {
	const user = await db.getUserByEmail(email);
	if (user.error) {
    return { status: 500, error: "Internal Server Error" };
	}
  if (!user) {
    return { status: 404, error: "User not found" };
  }

  const isPasswordValid = await fastify.bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { status: 400, error: "Invalid password" };
  }

  try {
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    const expiresInSeconds = 7 * 24 * 60 * 60;
    const cookieOptions = {
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: "/",
      maxAge: expiresInSeconds
    };

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const deleteResult = await db.deleteRefreshToken(user.id);
    const createResult = await db.createRefreshToken(refreshToken, expiresAt, user.id);
		if (deleteResult.error || createResult.error) {
      return { status: 500, error: "Internal Server Error" };
		}
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    return { refreshToken, accessToken, cookieOptions };
  } catch (error) {
		console.error(error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export default authenticationService;