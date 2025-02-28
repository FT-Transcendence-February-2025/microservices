import { refreshTokenService } from '../services/refresh-token-service.js';

export const createRefreshTokenRoute = {
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


