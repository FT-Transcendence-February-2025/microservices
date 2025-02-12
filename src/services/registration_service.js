import { createUser } from './user_service.js'
import { emailValidator } from '../validation/validator.js';

export const registrationService = async (request, reply) => {
  const { email, displayName, password } = request.body;

  const emailValidationResult = await emailValidator(email);
  if (!emailValidationResult.valid) {
    reply.status(400).send({ error: emailValidator.error });
    return;
  }

  // if (data correct) {
  //  await createUser(email, displayName, password);
  // }
};

