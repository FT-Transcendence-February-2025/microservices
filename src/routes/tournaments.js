import { tournamentController } from '../controllers/tournamentControllers.js'

// TODO methods schema

export default async function (fastify) {
  // Register player for tournament
  fastify.post('/:tournamentId/register', tournamentController.postRegisterPlayer)

  fastify.post('/:tournamentId/invite', tournamentController.sendInvite)

  fastify.post('/:tournamentId/schudule', tournamentController.createSchedule)

  fastify.post('/:tournamentId/tournament', tournamentController.createTournament)

  // Unregistered player for tournament
  fastify.delete('/:tournamentId/register', tournamentController.deletePlayer)

  // Get all players in tournament
  fastify.get('/:tournamentId/players', tournamentController.getAllPlayers)

  // Submit match results
  fastify.post('/:tournamentId/matches/:matchId/results', tournamentController.postMatchResults)

  // Get players matches in tournament
  fastify.get('/:tournamentId/players/:playerId/matches', tournamentController.getPlayerMatches)
}
