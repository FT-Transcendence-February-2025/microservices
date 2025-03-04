import fastify from '../server.js';
import jwt from 'jsonwebtoken';
import db from './database-service.js';

const authenticationService = async (request, reply) => {
	const { email, password } = request.body;

	let user = {};
	try {
		user = await db.getUserByEmail(email);
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
		const expiresInSeconds = 7 * 24 * 60 * 60;
		reply.setCookie('refreshToken', refreshToken, {
			signed: true,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
			path: '/',
			maxAge: expiresInSeconds
		});
		await db.deleteRefreshToken(user.id);
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
		await db.createRefreshToken(refreshToken, expiresAt, user.id);

		const shortToken = jwt.sign(
			{ userId: user.id },
			process.env.SECRET_KEY,
			 { expiresIn: '15m' }
		);
		reply.send({ success: 'You have successfully logged in', token: shortToken });
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}
};

export default authenticationService;