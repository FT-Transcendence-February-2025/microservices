import db from '../db/database.js'
import { databaseService } from '../db/databaseService.js'

export const updateController = {
  async updateTournament (request, reply) {
    console.log(`Updates tournament...`);
    const { tournamentId } = request.params
    const { name,
            current_round,
            registration_start_time,
            registration_deadline,
            winner_id,
            started_at,
            ended_at
    } = request.body;

    const tournamentExists = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
    if (!tournamentExists) {
        return reply.code(400).send({
            statusCode: 400,
            error: 'Tournament not found',
            message: `Cannot register for tournament ID ${tournamentId}: tournament does not exists`
      })
    }
    
    const fieldsToUpdate = [];
    const values = [];

    const size = db.prepare(`
        SELECT COUNT(*) AS count
        FROM players
        WHERE tournament_id = ?
    `).get(tournamentId).count;

    if (name !== undefined) {
        fieldsToUpdate.push('name = ?');
        values.push(name);
    }
    if (current_round !== undefined) {
        fieldsToUpdate.push('current_round = ?');
        values.push(current_round);
    }

    fieldsToUpdate.push('size = ?')
    values.push(size);
    
    if (registration_start_time !== undefined) {
        fieldsToUpdate.push('registration_start_time = ?');
        values.push(registration_start_time);
    }
    if (registration_deadline !== undefined) {
        fieldsToUpdate.push('registration_deadline = ?');
        values.push(registration_deadline);
    }
    if (winner_id !== undefined) {
        fieldsToUpdate.push('winner_id = ?');
        values.push(winner_id);
    }
    if (started_at !== undefined) {
      fieldsToUpdate.push('started_at = ?');
      values.push(started_at);
    }

    if (ended_at !== undefined) {
        fieldsToUpdate.push('ended_at = ?');
        values.push(ended_at);
    }

    const query = `
      UPDATE tournaments 
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = ?
      `;
    values.push(tournamentId);

    try {
      const results = db.prepare(query).run(...values);
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
        reply.code(500).send({
            error: 'Failed to update tournament',
            details: error.message
        });
    }
  },

  async updateScores(request, reply) {
    console.log(`Updating scores...`);
    const { tournamentId } = request.params;
    const { round_number, 
            match_index, 
            winner_id, 
            score, 
            started_at,
            ended_at
    } = request.body;

    const tournamentExists = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
    if (!tournamentExists) {
        return reply.code(400).send({
            statusCode: 400,
            error: 'Tournament not found',
            message: `Cannot register for tournament ID ${tournamentId}: tournament does not exists`
      })
    }

    const fieldsToUpdate = [];
    const values = [];
    
    const current_round = db.prepare(`SELECT round_number AS current_round FROM scores WHERE tournament_id = ?`).get(tournamentId).current_round
    console.log(`Current round:${current_round}`);
    if(round_number != current_round)
    {
        console.log(`Switch to new round:${round_number}`);
        try {
            const { success, scoreId, error, details } = await databaseService.newScores(tournamentId, round_number);
            
            if (success) {
                console.log(`Score table added at position: ${scoreId}`);
            } else {
                console.error('Failed to create score entry:', error);
                console.error('Details:', details);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }
    
    if (round_number !== undefined) {
        fieldsToUpdate.push('round_number = ?');
        values.push(round_number);
    }
    if (match_index !== undefined) {
        fieldsToUpdate.push('match_index = ?');
        values.push(match_index);
    }
    if (winner_id !== undefined) {
        fieldsToUpdate.push('winner_id = ?');
        values.push(winner_id);
    }
    if (score !== undefined) {
        fieldsToUpdate.push('score = ?');
        values.push(score);
    }
    if (started_at !== undefined) {
        fieldsToUpdate.push('started_at = ?');
        values.push(started_at);
    }
    if (ended_at !== undefined) {
      fieldsToUpdate.push('ended_at = ?');
      values.push(ended_at);
    }

    if (fieldsToUpdate.length === 0) {
        return reply.code(400).send({
            error: 'No fields to update',
            message: 'At least one field (round_number, match_index, winner_id, score, started_at, ended_at) must be provided'
        });
    }

    const query = `
        UPDATE scores 
        SET ${fieldsToUpdate.join(', ')}
        WHERE tournament_id = ? AND round_number = ?
    `;
    values.push(tournamentId, round_number);

    try {
        const results = db.prepare(query).run(...values);

        if (results.changes > 0) {
            reply.code(200).send({
                message: 'Scores updated successfully',
            });
        } else {
            reply.code(404).send({
                message: 'No matching scores found for this tournament/round'
            });
        }
    } catch (error) {
        console.error('Error updating scores:', error);
        reply.code(500).send({
            error: 'Failed to update scores',
            details: error.message
        });
    }
  }
}
 