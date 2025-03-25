import { tournamentController } from '../controllers/tournamentControllers.js'
import { inviteController } from '../controllers/inviteController.js';
import { settingsController } from '../controllers/settingsController.js'
import { usersController } from '../controllers/usersController.js';
import { playersController } from '../controllers/playersController.js';
import { deletionController } from '../controllers/deletionController.js';

// TODO methods schema

export default async function (fastify) {

  fastify.get('/', async (request, reply) => {
    return reply.sendFile('tournament.html');
  });

  fastify.get('/:tournamentId', async (request, reply) => {
    return reply.sendFile('host.html');
  });
  
  //init users table
  fastify.post('/users', usersController.initUsersTable)

  // Genarate new Tournament
  fastify.post('/create', tournamentController.generateTournament)

  // Init players table
  fastify.post('/:tournamentId/players', playersController.initPlayersTable)

  // Invite players
  fastify.post('/:tournamentId/invite', inviteController.sendInvite)

  //fill tournament table with settings and info
  fastify.post('/:tournamentId/settings', settingsController.updateTournament)

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

  // Get players matches in tournament
  fastify.get('/:tournamentId/players/:playerId/matches', tournamentController.getPlayerMatches)
}
