import { fastify } from "../server.js";
import { getUserById } from './database-service.js';
import { passwordValidator } from '../validation/validator.js';
import { updatePassword } from './database-service.js';

export const passwordChangeService = async (request, reply) => {
	const { currentPassword, newPassword } = request.body;

	let user = {};
	try {
		user = await getUserById(request.user.id);
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

	const passwordValidationResult = await passwordValidator(newPassword, user.email, user.displayName, currentPassword);
	if (!passwordValidationResult.valid) {
		return reply.status(passwordValidationResult.code).send({ error: passwordValidationResult.error });
	}

	const hashedNewPassword = await fastify.bcrypt.hash(newPassword);
	try {
		await updatePassword(request.user.id, hashedNewPassword);
	} catch (error) {
		console.error('sqlite3: ' + error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}

	return reply.send({ message: 'Password has been changed' });
};