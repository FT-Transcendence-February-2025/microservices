import registrationService from "../services/registration-service.js";

const registrationController = async (request, reply) => {
  const { email, password } = request.body;

	const registrationResult = await registrationService(email, password);
	if (registrationResult.error) {
		console.error(registrationResult.error);
		return reply.status(registrationResult.status).send({ error: registrationResult.error });
	}
  return reply.send({ success: registrationResult.message });
};

export default registrationController;