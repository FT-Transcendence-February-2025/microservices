import authenticationService from "../services/authentication-service.js";
import cryptoService from "../services/crypto-service.js";
import notifyService from "../services/notify-service.js";

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
			case "sms":
				const phoneNumber = cryptoService.decrypt(twoFactorInfo.phone_number, twoFactorInfo.initialization_vector, 
					twoFactorInfo.auth_tag);
				if (phoneNumber.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				notifyService.sendSms(result.userId, twoFactorInfo)
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
	addPhoneNumber: async (request, reply) => {
		const { phoneNumber } = request.body;
		
		const encrypted = cryptoService.encrypt(phoneNumber);
		if (encrypted.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const addResult = await db.addPhoneNumber(encrypted.encrypted, encrypted.initializationVector, encrypted.authTag);
		if (addResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Phone number has been added" });
	},
	changeTwoFactorAuthMode: async (request, reply) => {
		const { mode } = request.body;

		const twoFactorInfo = await db.getTwoFactor(request.user.id);
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
			&& (!twoFactorInfo.phone_number || !twoFactorInfo.initialization_vector || !twoFactorInfo.authTag)) {
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