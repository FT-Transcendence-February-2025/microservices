import db from '../db/database.js'
import { tournamentService } from '../db/tournamentService.js'

export const deletionController = {
  async deleteTournament(request, reply) {
    const { tournamentId} = request.params;
    try {
      const deleteScores = db.prepare('DELETE FROM scores WHERE tournament_id = ?').run(tournamentId);
      // if (deleteScores.changes === 0) {
      //   return reply.code(404).send({
      //     statusCode: 404,
      //     error: 'Scores not found',
      //     message: `No Scores found with ID ${tournamentId}`
      //   });
      // }
      const deletePlayers = db.prepare('DELETE FROM players WHERE tournament_id = ?').run(tournamentId);
      // if (deletePlayers.changes === 0) {
      //   return reply.code(404).send({
      //       statusCode: 404,
      //       error: 'Players not found',
      //       message: `No Players found in Tournament: ${tournamentId}`
      //   });
      // }
      const deleteTournament = db.prepare('DELETE FROM tournaments WHERE id = ?').run(tournamentId);
      if (deleteTournament.changes === 0) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Tournament not found',
          message: `No Tournament found with ID ${tournamentId}`
        });
      }
      console.log('Tournament, scores and players deleted successfully');
      reply.code(200).send({ 
        message: 'Tournament deleted successfully',
    });
    } catch (error) {
      request.log.error(`Error deleting tournament: ${error.message}`);
      reply.code(500).send({ 
          statusCode: 500,
          error: `Error deleting tournament: ${error.message}`,
      });
    }
  },

  async deleteUser(request, reply) {
    const { userId } = request.body;
    try {
        const deletePlayerResult = db.prepare('DELETE FROM players WHERE player_id = ?').run(userId);
        console.log(`Deleted ${deletePlayerResult.changes} row(s) from players table for user ID ${userId}`);

        const deleteUserResult = db.prepare('DELETE FROM users WHERE user_id = ?').run(userId);
        if (deleteUserResult.changes === 0) {
            return reply.code(404).send({
                statusCode: 404,
                error: 'User not found',
                message: `No user found with ID ${userId}`
            });
        }

        console.log(`User with ID ${userId} deleted successfully`);
        reply.code(200).send({ 
            message: 'User deleted successfully',
        });
    } catch (error) {
        request.log.error(`Error deleting user: ${error.message}`);
        reply.code(500).send({ 
            statusCode: 500,
            error: `Error deleting user: ${error.message}`,
        });
    }
  },

  async deletePlayer (request, reply) {
    const { tournamentId } = request.params
    const { userId } = request.body

    try {
      const result = tournamentService.unregisterPlayer(tournamentId, userId)

      if (!result) {
        console.log(`no result`)
        return reply.code(404).send({
          statusCode: 404,
          error: 'Player not found in tournament'
        })
      }

      reply.code(200).send({
        statusCode: 200,
        message: `Player ${userId}, unregistered from tournament ${tournamentId}`
      })
    } catch (error) {
      reply.code(500).send({
        statusCode: 500,
        error: 'Failed to unregister player',
        details: error.message
      })
    }
  }
}