import { passwordChangeService } from '../services/password-change-service.js';

export const createChangePasswordRoute = {
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
					success: {type: 'string'}
				}
			}
		}
	},
	handler: passwordChangeService
};