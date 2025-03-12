import { tournamentController } from '../controllers/tournamentControllers.js'

// TODO methods schema

export default async function (fastify) {

  fastify.get('/', async (request, reply) => {
    return reply.sendFile('tournament.html');
  });

  fastify.get('/host', async (request, reply) => {
    return reply.sendFile('host.html');
  });
  
  // Genarate new Tournament
  fastify.post('/create', tournamentController.generateTournament)

  fastify.post('/:tournamentId/invite', tournamentController.sendInvite)
  
  // Register player for tournament
  fastify.post('/:tournamentId/register', tournamentController.postRegisterPlayer)

  // Unregistered player for tournament
  fastify.delete('/:tournamentId/register', tournamentController.deletePlayer)

  // Get all players in tournament
  fastify.get('/:tournamentId/players', tournamentController.getAllPlayers)

  // Start tournament
  fastify.post('/:tournamentId/start', tournamentController.startTournament)

  // Submit match results
  fastify.post('/:tournamentId/matches/:matchId/results', tournamentController.postMatchResults)

  // // Get players matches in tournament
  fastify.get('/:tournamentId/players/:playerId/matches', tournamentController.getPlayerMatches)
}
