import { tournamentMatchesController } from '../controllers/tournamentMatchesController.js'

const tournamentMatchSchema = {
  body: {
    type: 'object',
    properties: {
      tournamentID: { type: 'number', multipleOf: 1 },
      round: { type: 'number', multipleOf: 1 },
      matches: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            player1Id: { type: 'number', multipleOf: 1 },
            player2Id: { type: 'number', multipleOf: 1 }
          },
          required: ['player1Id', 'player2Id']
        }
      }
    },
    required: ['tournamentID', 'matches', 'round']
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
