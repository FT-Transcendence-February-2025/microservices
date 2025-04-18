import db from "../services/database-service.js";
import notifyService from "../services/notify-service.js";
import cryptoService from "../services/crypto-service.js";

const notifyController = {
	sendCodeDataChange: async (request, reply) => {
		const { email, action } = request.body;
		const user = await db.getUserByEmail(email);
		if (!user) {
			return reply.status(404).send({ error: "Provided email is not valid" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (!user.email_verified) {
			return reply.status(400).send({ error: "Please verify your email first" });
		}

		const sendResult = await notifyService.sendEmail({
			settings: {
				emailType: "code",
				codeType: action
			},
			receiver: email
		});
		if (sendResult.error) {
			return reply.status(sendResult.status).send({ error: sendResult.error });
		}

		return reply.status(200).send({ success: "Verification code has been sent" });
	},
	sendCodeLogin: async (request, reply) => {
		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}
		if (!user.email_verified) {
			return reply.status(400).send({ error: "Please verify your email first" });
		}

		const twoFactorInfo = await db.getTwoFactorInfo(user.id);
		if (!twoFactorInfo) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (twoFactorInfo.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		if (twoFactorInfo.mode === "sms") {
			const smsInfo = cryptoService.decrypt(
				twoFactorInfo.sms_phone_number,
				twoFactorInfo.sms_initialization_vector, 
				twoFactorInfo.sms_auth_tag
			);
			if (smsInfo.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
			const sendResult = await notifyService.sendSms(user.id, smsInfo.decrypted);
			if (sendResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		} else if (twoFactorInfo.mode === "email") {
			const sendResult = await notifyService.sendEmail({
				settings: {
					emailType: "code",
					userId: user.id,
					codeType: "email_auth"
				},
				receiver: user.email
			});
			if (sendResult.error) {
				return reply.status(500).send({ error: "Internal Server Error" });
			}
		} else {
			return reply.status(400).send({ error: "User doesn't have email/sms set as 2fa method" });
		}

		return reply.status(200).send({ success: "Verification code has been sent" });
	},
	sendConfirmationLink: async (request, reply) => {
		const user = await db.getUserById(request.user.id);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
		if (user.error) {
			return reply.status(500).send({ error: "Internal Server Error" });
		}

		const sendResult = await notifyService.sendEmail({
			settings: {
				emailType: "link",
				userId: user.id
			},
			receiver: user.email
		});
		if (sendResult.error) {
			return reply.status(sendResult.status).send({ error:sendResult.error });
		}

		return reply.status(200).send({ success: "Confirmation link sent" });
	}
};

export default notifyController;