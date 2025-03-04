import passwordChangeService from '../services/password-change-service.js';
import verifyToken from 'jwt-validator-tr';

const changePasswordRoute = {
	method: 'POST',
	url: '/password',
	schema: {
		body: {
			type: 'object',
			properties: {
				currentPassword: {type: 'string'},
				newPassword: {type: 'string'}
			},
			required: ['currentPassword', 'newPassword']
		},
		response: {
			200: {
				type: 'object',
				properties: {
					success: { type: 'string' }
				}
			}
		}
	},
	preHandler: verifyToken,
	handler: passwordChangeService
};

export default changePasswordRoute;