import registrationService from "../services/registration-service.js";

const registrationController = async (request, reply) => {
  const { email, displayName, password } = request.body;

	console.log("inside registration controller");
	const registrationResult = await registrationService(email, displayName, password);
	if (registrationResult.error) {
		console.error(registrationResult.error);
		return reply.status(registrationResult.status).send({ error: registrationResult.error });
	}
  return reply.send({ success: registrationResult.message });
};

export default registrationController;