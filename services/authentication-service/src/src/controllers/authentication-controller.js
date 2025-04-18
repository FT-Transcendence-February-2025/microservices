import authenticationService from "../services/authentication-service.js";
import cryptoService from "../services/crypto-service.js";
import notifyService from "../services/notify-service.js";
import db from "../services/database-service.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
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
			case "sms": {
				const smsInfo = cryptoService.decrypt(
					twoFactorInfo.sms_phone_number,
					twoFactorInfo.sms_initialization_vector, 
					twoFactorInfo.sms_auth_tag
				);
				if (smsInfo.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				const sendResult = await notifyService.sendSms(verifyResult.userId, smsInfo.decrypted);
				if (sendResult.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				const sessionToken = authenticationService.createToken({ userId: verifyResult.userId }, "5m");
				if (sessionToken.error) {
					return reply.status(sessionToken.status).send({ error: sessionToken.error });
				}
				response = {
					success: "Additional authentication required",
					route: "/login/sms",
					token: sessionToken
				};
				break;
			}
			case "email": {
				const sendResult = await notifyService.sendEmail({
					settings: {
						emailType: "code",
						userId: verifyResult.userId,
						codeType: "email_auth"
					},
					receiver: email
				});
				if (sendResult.error) {
					return reply.status(500).send({ error: "Internal Server Error" });
				}
				const sessionToken = authenticationService.createToken({ userId: verifyResult.userId }, "5m");
				if (sessionToken.error) {
					return reply.status(sessionToken.status).send({ error: sessionToken.error });
				}
				response = {
					success: "Additional authentication required",
					route: "/login/email",
					token: sessionToken
				};
				break;
			}
			case "app": {
				const sessionToken = authenticationService.createToken({ userId: verifyResult.userId }, "5m");
				if (sessionToken.error) {
					return reply.status(sessionToken.status).send({ error: sessionToken.error });
				}
				response = {
					success: "Additional authentication required",
					route: "/login/app",
					token: sessionToken
				};
				break;
			}
			case "off": {
				const access = await authenticationService.giveUserAccess(verifyResult.userId, request.headers["user-agent"]);
				if (access.error) {
					return reply.status(access.status).send({ error: access.error });
				}
				response = {
					success: "You have successfully logged in",
					token: access.accessToken
				};
				try {
					reply.setCookie("refreshToken", access.refreshToken, access.cookieOptions);
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

		const twoFactorInfo = await db.getTwoFactorInfo(request.user.id);
		if (!twoFactorInfo) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (
			!twoFactorInfo.mode !== "sms" ||
			!twoFactorInfo.sms_phone_number ||
			!twoFactorInfo.sms_initialization_vector ||
			!twoFactorInfo.sms_auth_tag
		) {
			return reply.status(400).send({ error: "SMS 2fa not set up" });
		}

		const authCode = await db.getAuthCode(request.user.id, verificationCode, "sms_auth");
		if (authCode.error) {
			return reply.status(authCode.status).send({ error: authCode.error });
		}

		const access = await authenticationService.giveUserAccess(request.user.id, request.headers["user-agent"]);
		if (access.error) {
			return reply.status(access.status).send({ error: access.error });
		}
		try {
			reply.setCookie("refreshToken", access.refreshToken, access.cookieOptions);
		} catch (error) {
			console.error("Error in function authenticationController.loginSms:", error);
			return reply.status(500).send({ error: error });
		}

		await db.deleteAuthCode(authCode.id);

		return reply.status(200).send({
			success: "You have successfully logged in",
			token: access.accessToken
		});
	},
	loginApp: async (request, reply) => {
		const twoFactorInfo = await db.getTwoFactorInfo(request.user.id);
		if (!twoFactorInfo) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (
			!twoFactorInfo.mode !== "app" ||
			!twoFactorInfo.app_secret ||
			!twoFactorInfo.app_initialization_vector ||
			!twoFactorInfo.app_auth_tag ||
			!twoFactorInfo.app_enabled
		) {
			return reply.status(400).send({ error: "Authenticator 2fa not set up" });
		}

		const secret = cryptoService.decrypt(
			twoFactorInfo.app_secret,
			twoFactorInfo.app_initialization_vector,
			twoFactorInfo.app_auth_tag
		);
		if (secret.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const { verificationCode } = request.body;

		const verified = speakeasy.totp.verify({
			secret: secret.decrypted,
			encoding: "base32",
			token: verificationCode
		});
		if (!verified) {
			return reply.status(400).send({ error: "Invalid token" });
		}

		const access = await authenticationService.giveUserAccess(request.user.id, request.headers["user-agent"]);
		if (access.error) {
			return reply.status(access.status).send({ error: access.error });
		}
		try {
			reply.setCookie("refreshToken", access.refreshToken, access.cookieOptions);
		} catch (error) {
			console.error("Error in function authenticationController.loginSms:", error);
			return reply.status(500).send({ error: error });
		}

		return reply.status(200).send({
			success: "You have successfully logged in",
			token: access.accessToken
		});
	},
	loginEmail: async (request, reply) => {
		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const twoFactorInfo = await db.getTwoFactorInfo(request.user.id);
		if (!twoFactorInfo) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (twoFactorInfo.mode !== "email") {
			return reply.status(400).send({ error: "Email 2fa not set up" });
		}

		const { verificationCode } = request.body;

		const authCode = await db.getAuthCode(request.user.id, verificationCode, "email_auth");
		if (authCode.error) {
			return reply.status(authCode.status).send({ error: authCode.error });
		}

		const access = await authenticationService.giveUserAccess(request.user.id, request.headers["user-agent"]);
		if (access.error) {
			return reply.status(access.status).send({ error: access.error });
		}
		try {
			reply.setCookie("refreshToken", access.refreshToken, access.cookieOptions);
		} catch (error) {
			console.error("Error in function authenticationController.loginSms:", error);
			return reply.status(500).send({ error: error });
		}

		await db.deleteAuthCode(authCode.id);

		return reply.status(200).send({
			success: "You have successfully logged in",
			token: access.accessToken
		});
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

		const updateResult = await db.updatePhoneNumber(
			request.user.id,
			encrypted.encrypted,
			encrypted.initializationVector, 
			encrypted.authTag
		);
		if (updateResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Phone number has been added" });
	},
	deletePhoneNumber: async (request, reply) => {
		const deleteResult = await db.deletePhoneNumber(request.user.id);
		if (deleteResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const updateModeResult = await db.updateMode(request.user.id, "email");
		if (updateModeResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Phone number has been removed" });
	},
	addAuthenticatorApp: async (request, reply) => {
		try {
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
		
			const secret = speakeasy.generateSecret({
				name: `Pong (${user.email})`,
				issuer: "Pong"
			});
		
			const encrypted = cryptoService.encrypt(secret.base32);
			if (encrypted.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		
			const updateResult = await db.updateApp(
				request.user.id,
				encrypted.encrypted,
				encrypted.initializationVector,
				encrypted.authTag,
				false
			);
			if (updateResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		
			const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
			if (qrCodeDataURL.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		
			return reply.status(200).send({
				success: "Sending QR code. Send code from the application on the next route",
				qrCode: qrCodeDataURL,
				route: "/confirm-authenticator-app"
			});
		} catch (error) {
			console.error("Error in authenticationController.addAuthenticatorApp:", error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	},
	confirmAuthenticatorApp: async (request, reply) => {
		const twoFactorInfo = await db.getTwoFactorInfo(request.user.id);
		if (!twoFactorInfo) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (
			!twoFactorInfo.app_secret ||
			!twoFactorInfo.app_initialization_vector ||
			!twoFactorInfo.app_auth_tag
		) {
			return reply.status(400).send({ error: "Authenticator 2fa not added" });
		}

		const secret = cryptoService.decrypt(
			twoFactorInfo.app_secret,
			twoFactorInfo.app_initialization_vector,
			twoFactorInfo.app_auth_tag
		);
		if (secret.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const { verificationCode } = request.body;

		const verified = speakeasy.totp.verify({
			secret: secret.decrypted,
			encoding: "base32",
			token: verificationCode,
		});
		if (!verified) {
			return reply.status(400).send({ error: "Invalid token" });
		}

		const enableResult = await db.updateAppEnabled(request.user.id, true);
		if (enableResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Authenticator app successfully added" });
	},
	deleteAuthenticatorApp: async (request, reply) => {
		const twoFactorInfo = await db.getTwoFactorInfo(request.user.id);
		if (!twoFactorInfo) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		if (!twoFactorInfo.app_secret && !twoFactorInfo.app_initialization_vector && !twoFactorInfo.app_auth_tag) {
			return reply.status(400).send({ error: "Authenticator app is already removed" });
		}

		const deleteResult = await db.deleteApp(request.user.id);
		if (deleteResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const updateModeResult = await db.updateMode(request.user.id, "email");
		if (updateModeResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Authenticator application has been removed" });
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

		if (
			mode === "sms" &&
			(!twoFactorInfo.sms_phone_number || !twoFactorInfo.sms_initialization_vector || !twoFactorInfo.sms_auth_tag)
		) {
			return reply.status(400).send({ error: "User has to add phone number first" });
		}

		if (
			mode === "app" &&
			(
				!twoFactorInfo.app_secret ||
				!twoFactorInfo.app_initialization_vector ||
				!twoFactorInfo.app_auth_tag ||
				!twoFactorInfo.app_enabled
			)
		) {
			return reply.status(400).send({ error: "User has to add authenticator app first" });
		}

		const updateResult = await db.updateMode(request.user.id, mode);
		if (updateResult.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		return reply.status(200).send({ success: "Two factor authentication mode has been changed" });
	}
};

export default authenticationController;