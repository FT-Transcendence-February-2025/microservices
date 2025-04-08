import db from "../services/database-service.js";
import registrationService from "../services/registration-service.js";
import userManagementService from "../services/user-management-service.js";

const registrationController = async (request, reply) => {
  const { email, displayName, password } = request.body;

	const registrationResult = await registrationService.registerUser(email, displayName, password);
	if (registrationResult.error) {
		console.error(registrationResult.error);
		return reply.status(registrationResult.status).send({ error: registrationResult.error });
	}

	const sendResult = await userManagementService.sendId(registrationResult.userId, registrationResult.displayName);
	if (sendResult.error) {
		await db.deleteUser(registrationResult.userId);
		return reply.status(500).send({ error: "Internal Server Error" });
	}

  return reply.send({ success: registrationResult.message });
};

export default registrationController;