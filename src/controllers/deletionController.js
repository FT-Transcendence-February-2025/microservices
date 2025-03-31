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
    const { userId } = request.body
    try {
      const stmt = db.prepare('DELETE FROM users WHERE user_id = ?');
      stmt.run(userId);
      console.log(`User with ID ${userId} deleted successfully`);
      reply.code(200).send({ 
          message: 'User deleted successfully',
      });
    } catch (error) {
      request.log.error('Error deleting user:', error);
      reply.code(500).send({ error: 'Failed to delete user from users table' });
    }
  },

  async deletePlayer (request, reply) {
    const { tournamentId } = request.params
    const { playerId } = request.body

    try {
      const result = tournamentService.unregisterPlayer(tournamentId, playerId)

      if (!result) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Player not found in tournament'
        })
      }

      reply.send({
        success: true,
        message: `Player ${playerId}, unregistered from tournament ${tournamentId}`
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