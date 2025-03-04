import logoutService from '../services/logout-service.js';

const logoutRoute = {
  method: 'POST',
	url: '/logout',
	response: {
		200: {
			type: 'object',
			properties: {
				success: { type: 'string' }
			}
		}
	},
	handler: logoutService
};

export default logoutRoute;