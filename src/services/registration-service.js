import db from "./database-service.js";
import userDataValidator from "../validation/validator.js";
import fastify from "../server.js";

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
		return { status: 500, error: "Internal Server Error"};
	}
	return { message: "You have successfully registered" };
};

export default registrationService;