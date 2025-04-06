import db from '../db/database.js'
import { tournamentService } from '../db/tournamentService.js'

export const deletionController = {
  async deleteTournaments() {
      try {
        db.exec('DROP TABLE IF EXISTS tournaments');
        console.log('Tournaments table deleted successfully');
      } catch (error) {
        console.error('Error deleting table:', error);
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