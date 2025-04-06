import db from '../db/database.js'

export const updateController = {
  async updateTournament (request, reply) {
    console.log(`Sets tournament...`);
    const { tournamentId } = request.params
    const { name,
            current_round,
            size,
            registration_start_time,
            registration_deadline,
            winner_id,
            schedule,
            started_at,
            ended_at 
    } = request.body;
    const query = `
      UPDATE tournaments 
      SET name = ?,
          current_round = ?,
          size = ?,
          registration_start_time = ?,
          registration_deadline = ?,
          winner_id = ?,
          schedule = ?,
          started_at = ?,
          ended_at = ?
      WHERE id = ?`
    try {
      const results = db.prepare(query).run(
        name,
        current_round,
        size,
        registration_start_time,
        registration_deadline,
        winner_id,
        schedule,
        started_at,
        ended_at,
        tournamentId
      );

      if (results.changes > 0) {
        reply.code(200).send({
          message: 'Tournament updated successfully',
        });
      } else {
        reply.code(404).send({
          message: 'Tournament not found'
        });
      }
    } catch (error) {
      console.error('Error updating tournament:', error);
      reply.code(500).send('Error updating tournament');
    }
  }
}

//call everytime when tm table has to get updated with new values in req body
/*
in request body:
{
    "name": "tournament1",
    "created_by": "userId",
    "current_round": "0",
    "size": "2",
    "registration_start_time": "now",
    "registration_deadline": "30 seconds",
    "started_at": "now"
}
*/