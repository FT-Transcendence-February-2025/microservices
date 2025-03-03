import fastify from "../server.js";
import userDataValidator from '../validation/validator.js';
import db from './database-service.js';

const passwordChangeService = async (request, reply) => {
	const { currentPassword, newPassword } = request.body;

	let user = {};
	try {
		user = await db.getUserById(request.user.id);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}
	if (!user) {
		return reply.status(404).send({ error: 'User not found' });
	}

	const isCurrentPasswordValid = await fastify.bcrypt.compare(currentPassword, user.password);
	if (!isCurrentPasswordValid) {
		return reply.status(400).send({ error: 'Current password invalid' });
	}

	const passwordValidationResult =
		await userDataValidator.password(newPassword, user.email, user.displayName, currentPassword);
	if (!passwordValidationResult.valid) {
		return reply.status(passwordValidationResult.code).send({ error: passwordValidationResult.error });
	}

	const hashedNewPassword = await fastify.bcrypt.hash(newPassword);
	try {
		await db.updatePassword(request.user.id, hashedNewPassword);
	} catch (error) {
		console.error('sqlite3: ' + error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}

	return reply.send({ success: 'Password has been changed' });
};

export default passwordChangeService;