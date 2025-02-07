import { createUser, getUserByEmail } from 'user_service.js'

const registrationService = (request, reply) => {
  const { email, displayName, password } = request.body;

  // if (data correct) {
  //  await createUser(email, displayName, password);
  // }
}

export default registrationService;
