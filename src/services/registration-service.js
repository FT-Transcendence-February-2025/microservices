import db from "./database-service.js";
import userDataValidator from "../validation/validator.js";
import fastify from "../server.js";
import notifyService from "./notify-service.js";

const registrationService = async (email, password) => {
  const emailValidationResult = await userDataValidator.email(email);
  if (!emailValidationResult.valid) {
		return { status: emailValidationResult.status, error: emailValidationResult.error };
  }

  const passwordValidationResult = await userDataValidator.password(password, email);
  if (!passwordValidationResult.valid) {
		return { status: passwordValidationResult.status, error: passwordValidationResult.error };
  }

  const hashedPassword = await fastify.bcrypt.hash(password);

	const createUserResult = await db.createUser(email, hashedPassword);
	if (createUserResult.error) {
		return { status: 500, error: "Internal Server Error" };
	}

	const user = await db.getUserByEmail(email);
	if (!user || user.error) {
		return { status: 500, error: "Internal Server Error" };
	}

	const sendResult = await notifyService.sendEmail({
		type: "confirm",
		receiver: email,
		link: "https://www.google.com/"
	});
	if (sendResult.error) {
		return { statuts: sendResult.status, error: sendResult.error };
	}

	return { message: "You have successfully registered", userId: user.id };
};

export default registrationService;