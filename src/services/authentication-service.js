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
		const refreshToken = jwt.sign(
			{ userId: user.id },
			process.env.SECRET_KEY,
			{ expiresIn: '7d' }
		);
		const shortToken = jwt.sign(
			{ userId: user.id },
			process.env.SECRET_KEY,
			 { expiresIn: '5m' }
		);

		reply.setCookie('refreshToken', refreshToken, {
			signed: true,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60
		});

		reply.send({ success: 'You have successfully logged in', token: shortToken });
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}
};