import authenticationService from "../services/authentication-service.js";
import cryptoService from "../services/crypto-service.js";
import notifyService from "../services/notify-service.js";
import db from "../services/database-service.js";
import dotenv from "dotenv";

dotenv.config();

const authenticationController = {
	login: async (request, reply) => {
		const { email, password } = request.body;

		const verifyResult = await authenticationService.verifyCredentials(email, password);
		if (verifyResult.error) {
			return reply.status(verifyResult.status).send({ error: verifyResult.error });
		}

		const twoFactorInfo = await db.getTwoFactorInfo(verifyResult.userId);
		if (!twoFactorInfo || twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		let response;
		switch (twoFactorInfo.mode) {
			case "phone": {
				const phoneNumber = cryptoService.decrypt(twoFactorInfo.phone_number, twoFactorInfo.initialization_vector, 
					twoFactorInfo.auth_tag);
				if (phoneNumber.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				const sendResult = await notifyService.sendSms(verifyResult.userId, phoneNumber.decrypted);
				if (sendResult.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				response = {
					success: "Additional authentication required",
					route: "/login/sms",
				};
				break;
			}
			case "email":
				response = {
					success: "Additional authentication required",
					route: "/login/email",
				};
				break;
			case "app":
				response = {
					success: "Additional authentication required",
					route: "/login/app",
				};
				break;
			case "off": {
				const tokenInfo = await authenticationService.makeTokens(verifyResult.userId, request.headers["user-agent"]);
				if (tokenInfo.error) {
					return reply.status(tokenInfo.status).send({ error: tokenInfo.error });
				}
				response = {
					success: "You have successfully logged in",
					token: tokenInfo.accessToken
				};
				try {
					reply.setCookie("refreshToken", tokenInfo.refreshToken, tokenInfo.cookieOptions);
				} catch (error) {
					console.error(error);
					return reply.status(500).send({ error: error });
				}
				break;
			}
			default:
				return reply.status(500).send({ error: "Internal Server Error" });
		}

		reply.status(200).send(response);
	},
	loginSms: async (request, reply) => {
		const { verificationCode } = request.body;

		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const authCode = await db.getAuthCode(user.id, verificationCode, "sms");
		if (authCode.error) {
			return reply.status(authCode.status).send({ error: authCode.error });
		}

		const tokenInfo = await authenticationService.makeTokens(user.id, request.headers["user-agent"]);
		if (tokenInfo.error) {
			return reply.status(tokenInfo.status).send({ error: tokenInfo.error });
		}
		try {
			reply.setCookie("refreshToken", tokenInfo.refreshToken, tokenInfo.cookieOptions);
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: error });
		}

		await db.deleteAuthCode(authCode.id);
	},
	updatePhoneNumber: async (request, reply) => {
		const { phoneNumber } = request.body;
		
		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (!user.email_verified) {
			return reply.status(400).send({ error: "Email needs to be verified first" });
		}

		const encrypted = cryptoService.encrypt(phoneNumber);
		if (encrypted.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const updateResult = await db.updatePhoneNumber(request.user.id, encrypted.encrypted, encrypted.initializationVector, 
			encrypted.authTag);
		if (updateResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Phone number has been added" });
	},
	changeTwoFactorAuthMode: async (request, reply) => {
		const { mode } = request.body;

		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (!user.email_verified) {
			return reply.status(400).send({ error: "Email needs to be verified first" });
		}

		const twoFactorInfo = await db.getTwoFactorInfo(user.id);
		if (!twoFactorInfo) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		if (mode === twoFactorInfo.mode) {
			return reply.status(400).send({ error: "This mode is already set" });
		}

		if (mode === "phone" 
			&& (!twoFactorInfo.phone_number || !twoFactorInfo.initialization_vector || !twoFactorInfo.auth_tag)) {
			return reply.status(400).send({ error: "User has to add phone number first" });
		}

		const updateResult = await db.updateMode(request.user.id, mode);
		if (updateResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Two factor authentication mode has been changed" });
	}
};

export default authenticationController;