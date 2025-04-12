import fastify from "../server.js";
import jwt from "jsonwebtoken";
import db from "./database-service.js";
import * as crypto from "crypto";

const authenticationService = async (email, password, userAgent) => {
	const user = await db.getUserByEmail(email);
	if (!user) {
    return { status: 404, error: "User not found" };
  }
	if (user.error) {
    return { status: 500, error: "Internal Server Error" };
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

		const deviceHash = crypto.createHash('sha256').update(userAgent).digest('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
		const device = await db.getDevice(user.id, deviceHash);
		if (device && device.error) {
      return { status: 500, error: "Internal Server Error" };
		}
		if (!device) {
			const addResult = await db.addDevice(user.id, deviceHash, refreshToken, expiresAt);
			if (addResult.error) {
        return { status: 500, error: "Internal Server Error" };
			}
		} else {
			const updateResult = await db.updateToken(user.id, deviceHash, refreshToken, expiresAt);
			if (updateResult.error) {
				return { status: 500, error: "Internal Server Error"};
			}
		}
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "10h" }
    );

    return { userId: user.id, refreshToken, accessToken, cookieOptions };
  } catch (error) {
		console.error("Error in token creation, in function authenticationService: ", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export default authenticationService;