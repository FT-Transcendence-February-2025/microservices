import db from "./database-service.js";
import userDataValidator from "../validation/validator.js";
import fastify from "../server.js";
import notifyService from "./notify-service.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

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

		// TODO: if errors below, delete user from db.
		const user = await db.getUserByEmail(email);
		if (!user || user.error) {
			return { status: 500, error: "Internal Server Error" };
		}

		const confirmationToken = generateConfirmationToken(user.id, "email_confirmation", 10);
		const link = `http://localhost:3001/verify-email/${confirmationToken}`;
		const sendResult = await notifyService.sendEmail({ type: "confirm", receiver: email, link });
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

const generateConfirmationToken = (userId, action, expirationMinutes) => {
  const identifier = uuidv4().split('-')[0];
  const timestamp = Math.floor(Date.now() / 1000);

  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);

  hmac.update(`${identifier}:${userId}:${action}:${timestamp}:${expirationMinutes}`);
  const signature = hmac.digest('hex').substr(0, 8);

  return `${identifier}-${userId}-${signature}-${timestamp}-${expirationMinutes}`;
}

export default registrationService;