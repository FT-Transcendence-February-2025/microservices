import { tournamentMatchesController } from '../controllers/tournamentMatchesController.js'

const tournamentMatchSchema = {
  body: {
    type: 'object',
    properties: {
      tournamentId: { type: 'number', multipleOf: 1 },
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
        statusCode: { type: 'number', multipleOf: 1 },
        success: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
}

export default async function (fastify) {
  fastify.post('/matches', { schema: tournamentMatchSchema }, tournamentMatchesController.postTournamentMatch)
}
