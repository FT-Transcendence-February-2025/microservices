import { tournamentMatchesController } from '../controllers/tournamentMatchesController.js'

const tournamentMatchResultsSchema = {
  body: {
    type: 'object',
    properties: {
      tournamentId: { type: 'number', multipleOf: 1 },
      matchId: { type: 'number', multipleOf: 1 },
      player1Score: { type: 'number', multipleOf: 1 },
      player2Score: { type: 'number', multipleOf: 1 },
      winnerId: { type: 'number', multipleOf: 1 }
    },
    required: ['tournamentId', 'matchId', 'player1Score', 'player2Score', 'winnerId']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        winUpdate: { type: 'object' },
        lossUpdate: { type: 'object' }
      }
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
}

export default async function (fastify) {
  // Register match results
  fastify.post('/results', { schema: tournamentMatchResultsSchema }, tournamentMatchesController.tournamentMatchResults)
}
