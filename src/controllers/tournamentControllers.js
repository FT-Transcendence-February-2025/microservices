import { tournamentService } from '../db/tournamentService.js'

export const tournamentController = {

  async postRegisterPlayer (request, _reply) {
    const { tournamentId } = request.params
    const { playerId } = request.body

    // TODO: implement registration logic with databse
    // return {
    //   success: true,
    //   message: `Player ${playerId} registered for tournament ${tournamentId}`
    // }
    const result = tournamentService.registerPlayer(tournamentId, playerId)

    if (!result.success) {
      _reply.code(400)
    }
    return result
  },

  async deletePlayer (request, _reply) {
    const { tournamentId } = request.params
    const { playerId } = request.body

    // TODO: implement unregistration logic
    // return {
    //   success: true,
    //   message: `Player ${playerId} unregistered from tournament ${tournamentId}`
    // }

    try {
      const result = tournamentService.unregisterPlayer(tournamentId, playerId)

      if (!result) {
        return _reply.code(404).send({
          statusCode: 404,
          error: 'Player not found in tournament'
        })
      }

      return {
        success: true,
        message: `Player ${playerId}, unregistered from tournament ${tournamentId}`
      }
    } catch (error) {
      _reply.code(500).send({
        statusCode: 500,
        error: 'Failed to unregister player',
        details: error.message
      })
    }
  },

  async getAllPlayers (request, _reply) {
    const { tournamentId } = request.params

    // TODO: fetch players from database
    return [
      { id: 'player1', username: 'Player One', message: `Tournament ID: ${tournamentId}` },
      { id: 'player2', username: 'Player Two', message: `Tournament ID: ${tournamentId}` }
    ]
  },

  async postMatchResults (request, _reply) {
    const { tournamentId, matchId } = request.params
    const { winner, score } = request.body

    // TODO: save match results
    return {
      success: true,
      matchId,
      tournamentId,
      result: { winner, score }
    }
  },

  async getPlayerMatches (request, _reply) {
    const { tournamentId, playerId } = request.params

    // TODO: fetch matches from database
    return [
      { id: 'match1', player1: playerId, player2: 'opponent1', status: 'completed', result: { winner: playerId }, message: `Tournament ID: ${tournamentId}` },
      { id: 'match2', player1: playerId, player2: 'opponent2', status: 'scheduled', message: `Tournament ID: ${tournamentId}` }
    ]
  },

  // TODO: get tournament statistics '/:tournamentId/statistics'

  async createSchedule (request, reply) {

    const result = myFunction(); // Call your function here
    reply.send(result); // Send a response back to the client

    // Respond with the created tournament
    // console.log(size);
    // return reply.status(201).send(tournament);

    
    //-name
    //-invites
    //-registrationTime
  },

  async sendInvite (request, reply) {
    // Invite players to a tournament
  },

  async createTournament (request, reply) {
    const { name, players } = request.body
    const newTournament = createTournament(name, players)
    return newTournament
  }
}
