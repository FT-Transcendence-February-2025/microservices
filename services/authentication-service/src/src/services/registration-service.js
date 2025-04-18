import db from "./database-service.js";
import userDataValidator from "../validation/validator.js";
import fastify from "../server.js";
import notifyService from "./notify-service.js";

const registrationService = {
	registerUser: async (email, displayName, password) => {
		const emailValidationResult = await userDataValidator.email(email);
		if (!emailValidationResult.valid) {
			return { status: emailValidationResult.status, error: emailValidationResult.error };
		}

		const displayNameValidationResult = await userDataValidator.displayName(displayName);
		if (!displayNameValidationResult.valid) {
			return { status: displayNameValidationResult.status, error: displayNameValidationResult.error };
		}

		const passwordValidationResult = await userDataValidator.password(password, email);
		if (!passwordValidationResult.valid) {
			return { status: passwordValidationResult.status, error: passwordValidationResult.error };
		}

		const hashedPassword = await fastify.bcrypt.hash(password);
		
		const createUserResult = await db.createUser(email, hashedPassword, false);
		if (createUserResult.error) {
			return { status: 500, error: "Internal Server Error" };
		}

		const user = await db.getUserByEmail(email);
		if (!user || user.error) {
			return { status: 500, error: "Internal Server Error" };
		}

		const sendResult = await notifyService.sendEmail({
			settings: {
				type: "link",
				userId: user.id
			},
			receiver: user.email
		});
		if (sendResult.error) {
			await db.deleteUser(user.id);
			return { status: sendResult.status, error: sendResult.error };
		}

		return { 
			message: "Your account has been successfully created. Please check your email for the verification link to activate your account.",
			userId: user.id,
			displayName
		};
	}
};

export default registrationService;