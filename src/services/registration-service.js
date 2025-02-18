import { createUser } from './user_service.js';
import { emailValidator, displayNameValidator, passwordValidator } from '../validation/validator.js';
import { fastify } from '../server.js';

export const registrationService = async (request, reply) => {
  const { email, displayName, password } = request.body;

  const emailValidationResult = await emailValidator(email);
  if (!emailValidationResult.valid) {
    reply.status(400).send({ error: emailValidationResult.error });
    return;
  }

  const displayNameValidationResult = await displayNameValidator(displayName);
  if (!displayNameValidationResult.valid) {
    reply.status(400).send({ error: displayNameValidationResult.error });
    return;
  }

  const passwordValidationResult = await passwordValidator(password, email, displayName);
  if (!passwordValidationResult.valid) {
    reply.status(400).send({ error: passwordValidationResult.error });
    return;
  }

  const hashedPassword = await fastify.bcrypt.hash(password);

  await createUser(email, displayName, password);
  reply.send({ success: 'You have successfully registered' });
};