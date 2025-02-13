import { createUser } from './user_service.js'
import { emailValidator, displayNameValidator } from '../validation/validator.js';

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

  // await createUser(email, displayName, password);
  reply.send({ success: 'You have successfully registered' });
};

