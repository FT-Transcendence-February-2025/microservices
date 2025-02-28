import jwt from 'jsonwebtoken';

export const verifyToken = async (request, reply) => {
	try {
		const authorizationHeader = request.headers.authorization;
		if (!authorizationHeader) {
			return reply.status(401).send({ error: 'Unauthorized: No token provided' });
		}

		const token = authorizationHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		request.user = { id: decoded.userId };
	} catch (error) {
		return reply.status(401).send({ error: 'Unauthorized: Invalid token' });
	}
};