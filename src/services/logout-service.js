import verifyToken from 'jwt-validator-tr';
import db from './database-service.js';

const logoutService = async (request,reply) => {
	await verifyToken(request, reply);

	try {
		await db.deleteRefreshToken(request.user.id);
		reply.clearCookie('refreshToken', {
			signed: true,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
			path: '/'
		});
		return reply.send({ success: 'You have successfully logged out' });
	}	catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal Server Error' });
	}
};

export default logoutService;