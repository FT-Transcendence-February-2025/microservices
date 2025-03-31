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
  
  //add to users table
  fastify.post('/adduser', usersController.addUser)
  
  // Invite players
  fastify.post('/:tournamentId/invite', inviteController.sendInvite)
  
  //fill tournament table with settings and info
  fastify.post('/:tournamentId/settings', settingsController.updateTournament)
  
  // Get all players in tournament
  fastify.get('/:tournamentId/players', playersController.getAllPlayers)
  
  // Register player for tournament
  fastify.post('/:tournamentId/register', playersController.registerPlayer)
  
  // Get players matches in tournament
  fastify.get('/:tournamentId/players/:playerId/matches', tournamentController.getPlayerMatches)

  // Genarate new Tournament
  fastify.post('/create', tournamentController.generateTournament)
  
  // Start tournament
  fastify.post('/:tournamentId/start', tournamentController.startTournament)
  
  // Submit match results
  fastify.post('/:tournamentId/matches/:matchId/results', tournamentController.postMatchResults)
  
  // Unregistered player for tournament
  fastify.delete('/:tournamentId/register', deletionController.deletePlayer)

  //delete from users table
  fastify.delete('/deleteUser', deletionController.deleteUser)
}
