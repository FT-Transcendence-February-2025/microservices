import { registrationService } from '../services/registration_service.js';

const createAccountRoute = {
  method: 'POST',
  url: '/create_account',
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        displayName: { type: 'string' },
        password: { type: 'string' }
      },
      required: ['email', 'displayName', 'password']
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
  handler: registrationService
};

export default createAccountRoute;