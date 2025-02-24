import { fastify } from "../server.js";
import { getUserByEmail } from "./database-service.js";
import jwt from 'jsonwebtoken';

export const authenticationService = async (request, reply) => {
	const { email, password } = request.body;

	let user = {};
	try {
		user = await getUserByEmail(email);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}
	if (!user) {
		return reply.status(404).send({ error: 'User not found'});
	}

	const isPasswordValid = await fastify.bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return reply.status(400).send({ error: 'Invalid password' });
	}

	try {
		const token = jwt.sign(
			{ userId: user.id },
			process.env.SECRET_KEY,
			// TODO: this option is not working. Token is not expiring.
			 { expiresIn: 10 }
		);
		console.log(token);
		reply.send({ success: 'You have successfully logged in', token });
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}
};