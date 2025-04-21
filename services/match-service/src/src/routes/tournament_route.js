import { tournamentMatchesController } from '../controllers/tournamentMatchesController.js'

const tournamentMatchSchema = {
  body: {
    type: 'object',
    properties: {
      tournamentId: { type: 'string', minLength: 1 },
      schedule: {
        type: 'array',
        items: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number', multipleOf: 1 }
          }
        }
      }
    },
    required: ['tournamentId', 'schedule']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'string' },
        message: { type: 'string' }
      },
      required: ['success', 'message']
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      },
      required: ['error']
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      },
      required: ['error']
    }
  }
}

export default async function (fastify) {
  fastify.post('/matches', { schema: tournamentMatchSchema }, tournamentMatchesController.postTournamentMatch)
}
