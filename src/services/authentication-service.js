import { fastify } from "../server.js";
import { getUserByEmail } from "./database-service.js";
import jwt from 'jsonwebtoken';

export const authenticationService = async (request, reply) => {
	const {email, password} = request.body;

	const user = await getUserByEmail(email);
	if (!user) {
		reply.status(400).send({ error: 'User not found'});
		return;
	}

	const isPasswordValid = await fastify.bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		reply.status(400).send({ error: 'Invalid password' });
		return;
	}

	try {
		const token = jwt.sign(
			{ userId: user.id },
			process.env.SECRET_KEY,
			{expiresIn: '1h'}
		);
		console.log(token);

		reply.send({ success: 'You have successfully logged in', token });
	} catch (error) {
		console.error(error.message);
		reply.status(500).send({ error: 'Internal server error' });
	}
};