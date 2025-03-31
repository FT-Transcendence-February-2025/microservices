import { tournamentService } from '../db/tournamentService.js'

export const playersController = {
    
  async registerPlayer (request, reply) {
    const { tournamentId } = request.params
    const { playerId } = request.body

    const result = tournamentService.registerPlayer(tournamentId, playerId)

    if (!result.success) {
      return reply.code(400).send({
        statusCode: 400,
        error: result.error,
        details: result.message
      })
    }
    return result
  },

  async getAllPlayers (request, reply) {
    const { tournamentId } = request.params

    try {
      const result = tournamentService.getAllPlayers(tournamentId)

      if (!result.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: result.error,
          details: result.message
        })
      }

      return result.players
    } catch (error) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Failed to fetch players',
        details: error.message
      })
    }
  }
}