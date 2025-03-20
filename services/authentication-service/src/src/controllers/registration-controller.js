import registrationService from "../services/registration-service.js";
import sendIdToUserManagement from "../services/user-management-service.js";

const registrationController = async (request, reply) => {
  const { email, password } = request.body;

	const registrationResult = await registrationService(email, password);
	if (registrationResult.error) {
		console.error(registrationResult.error);
		return reply.status(registrationResult.status).send({ error: registrationResult.error });
	}

	const sendResult = await sendIdToUserManagement(registrationResult.userId);
	if (sendResult.error) {
		return reply.status(500).send({ error: "Internal Server Error" });
	}

  return reply.send({ success: registrationResult.message });
};

export default registrationController;