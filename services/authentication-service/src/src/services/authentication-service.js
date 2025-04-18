import fastify from "../server.js";
import jwt from "jsonwebtoken";
import db from "./database-service.js";
import * as crypto from "crypto";
import userManagementService from "./user-management-service.js";

const authenticationService = {
	verifyCredentials: async (email, password) => {
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
		
		return { userId: user.id };
	},
	giveUserAccess: async (userId, userAgent) => {
		try {
			const userProfile = await userManagementService.getUser(userId);
			if (userProfile.error) {
				return { status: 500, error: "Internal Server Error" };
			}
			const accessToken = authenticationService.createToken({ userId, displayName: userProfile.displayName }, "15m");
			if (accessToken.error) {
				return { status: accessToken.status, error: accessToken.error };
			}
	
			const refreshToken = authenticationService.createToken({ userId }, "7d");
			if (refreshToken.error) {
				return { status: refreshToken.status, error: refreshToken.error };
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
			const saveResult = await saveDevice(userAgent, expiresInSeconds, userId, refreshToken);
			if (saveResult.error) {
				return { status: saveResult.status, error: saveResult.error };
			}
	
			return { accessToken, refreshToken, cookieOptions };
		} catch (error) {
			console.error("Error in function authenticationService.giveUserAccess:", error);
			return { status: 500, error: "Internal Server Error" };
		}
	},
	createToken: (payload, expiresIn) => {
		try {
			const token = jwt.sign(
				payload,
				process.env.SECRET_KEY,
				{ expiresIn }
			);
	
			return token;
		} catch (error) {
			console.error("Error in function authenticationService.createToken:", error);
			return { status: 500, error: "Internal Server Error" };
		}
	}
};

const saveDevice = async (userAgent, expiresInSeconds, userId, refreshToken) => {
	try {
		const deviceHash = crypto.createHash('sha256').update(userAgent).digest('hex');
		const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
		const device = await db.getDevice(userId, deviceHash);
		if (device && device.error) {
			return { status: 500, error: "Internal Server Error" };
		}
		if (!device) {
			const addResult = await db.addDevice(userId, deviceHash, refreshToken, expiresAt);
			if (addResult.error) {
				return { status: 500, error: "Internal Server Error" };
			}
		} else {
			const updateResult = await db.updateToken(userId, deviceHash, refreshToken, expiresAt);
			if (updateResult.error) {
				return { status: 500, error: "Internal Server Error"};
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Error in function authenticationService.saveDevice:", error);
		return { status: 500, error: "Internal Server Error" };
	}
};

export default authenticationService;