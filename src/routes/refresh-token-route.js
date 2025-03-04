import refreshTokenService from '../services/refresh-token-service.js';

const refreshTokenRoute = {
	method: 'POST',
	url: '/refresh',
	response: {
		200: {
			type: 'object',
			properties: {
				token: { type: 'string' }
			}
		}
	},
	handler: refreshTokenService
}

export default refreshTokenRoute;
