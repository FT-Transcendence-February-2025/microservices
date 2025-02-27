import { createUser } from './database-service.js';
import { emailValidator, displayNameValidator, passwordValidator } from '../validation/validator.js';
import { fastify } from '../server.js';

export const registrationService = async (request, reply) => {
  const { email, displayName, password } = request.body;

  const emailValidationResult = await emailValidator(email);
  if (!emailValidationResult.valid) {
    return reply.status(emailValidationResult.code).send({ error: emailValidationResult.error });
  }

  const displayNameValidationResult = await displayNameValidator(displayName);
  if (!displayNameValidationResult.valid) {
    return reply.status(displayNameValidationResult.code).send({ error: displayNameValidationResult.error });
  }

  const passwordValidationResult = await passwordValidator(password, email, displayName);
  if (!passwordValidationResult.valid) {
    return reply.status(passwordValidationResult.code).send({ error: passwordValidationResult.error });
  }

  const hashedPassword = await fastify.bcrypt.hash(password);

	try {
		await createUser(email, displayName, hashedPassword);
	} catch (error) {
		console.error('sqlite3: ' + error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}

  return reply.send({ message: 'You have successfully registered' });
};