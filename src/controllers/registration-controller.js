import registrationService from "../services/registration-service.js";

const registrationController = async (request, reply) => {
  const { email, displayName, password } = request.body;

	const registrationResult = await registrationService(email, displayName, password);
	if (registrationResult.error) {
		return reply.status(registrationResult.status).send({ error: registrationResult.error });
	}
  return reply.send({ success: registrationResult.message });
};

export default registrationController;