import db from './database-service.js';
import userDataValidator from '../validation/validator.js';
import fastify from '../server.js';

const registrationService = async (request, reply) => {
  const { email, displayName, password } = request.body;

  const emailValidationResult = await userDataValidator.email(email);
  if (!emailValidationResult.valid) {
    return reply.status(emailValidationResult.code).send({ error: emailValidationResult.error });
  }

  const displayNameValidationResult = await userDataValidator.displayName(displayName);
  if (!displayNameValidationResult.valid) {
    return reply.status(displayNameValidationResult.code).send({ error: displayNameValidationResult.error });
  }

  const passwordValidationResult = await userDataValidator.password(password, email, displayName);
  if (!passwordValidationResult.valid) {
    return reply.status(passwordValidationResult.code).send({ error: passwordValidationResult.error });
  }

  const hashedPassword = await fastify.bcrypt.hash(password);

	try {
		await db.createUser(email, displayName, hashedPassword);
	} catch (error) {
		console.error('sqlite3: ' + error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}

  return reply.send({ success: 'You have successfully registered' });
};

export default registrationService;