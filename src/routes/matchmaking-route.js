import { matchmakingController } from '../controllers/matchmakingControllers.js'

const responseSchema = {
  body: {
    type: 'object',
    properties: {
      userId: { type: 'number', multipleOf: 1 }
    },
    required: ['userId']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'string' },
        displayName: { type: 'string' }
      }
    }
  }
}

export default async function (fastify) {
  fastify.post('/matchmaking', { schema: responseSchema }, matchmakingController.postMatchMaking)
}
