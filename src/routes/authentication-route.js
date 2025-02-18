import { authenticationService } from '../services/authentication-service.js';

export const createAuthenticationRoute = {
	method: 'POST',
	url: '/login',
	schema: {
		body : {
			type: 'object',
			properties: {
				email: { type: 'string' },
				password: { type: 'string' }
			},
			required: ['email', 'password']
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
	handler: authenticationService
};
