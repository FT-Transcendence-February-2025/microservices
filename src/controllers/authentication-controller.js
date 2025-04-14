import authenticationService from "../services/authentication-service.js";
import cryptoService from "../services/crypto-service.js";
import notifyService from "../services/notify-service.js";
import db from "../services/database-service.js";
import dotenv from "dotenv";

dotenv.config();

const authenticationController = {
	login: async (request, reply) => {
		const { email, password } = request.body;

		const result = await authenticationService(email, password, request.headers["user-agent"]);
		if (result.error) {
			return reply.status(result.status).send({ error: result.error });
		}
	
		try {
			reply.setCookie("refreshToken", result.refreshToken, result.cookieOptions);
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: error });
		}

		const twoFactorInfo = await db.getTwoFactorInfo(result.userId);
		if (!twoFactorInfo || twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		let response;
		switch (twoFactorInfo.mode) {
			case "phone":
				const phoneNumber = cryptoService.decrypt(twoFactorInfo.phone_number, twoFactorInfo.initialization_vector, 
					twoFactorInfo.auth_tag);
				if (phoneNumber.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				const sendResult = await notifyService.sendSms(result.userId, phoneNumber.decrypted);
				if (sendResult.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				response = {
					success: "Additional authentication required",
					route: "/login/two-factor-auth/sms",
					token: result.accessToken
				};
				break;
			case "email":
				response = {
					success: "Additional authentication required",
					route: "/login/two-factor-auth/email",
					token: result.accessToken
				};
				break;
			case "app":
				response = {
					success: "Additional authentication required",
					route: "/login/two-factor-auth/app",
					token: result.accessToken
				};
				break;
			case "off":
				response = {
					success: "You have successfully logged in",
					token: result.accessToken
				};
				break;
			default:
				return reply.status(500).send({ error: "Internal Server Error" });
		}

		reply.status(200).send(response);
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
	},
	sms: async (request, reply) => {
		const { verificationCode } = request.body;


	}
};

export default authenticationController;