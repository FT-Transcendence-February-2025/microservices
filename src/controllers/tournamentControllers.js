import { tournamentService } from '../db/tournamentService.js'
import objects from '../db/objects.js'
import db from '../db/database.js'
const UM_SERVICE_URL = 'http://localhost:3000';

export const tournamentController = {

  async generateTournament (request, reply){
    const { userId } = request.body;
    
    try{
      const userExists = db.prepare('SELECT user_id FROM users WHERE user_id = ?').get(userId)
      if (!userExists) {
        return {
          success: false,
          error: 'User not found',
          message: `Cannot register player ID ${userId}`
        }
      }

      const insertTournament = db.prepare(`
        INSERT INTO tournaments
      (name, created_by, current_round, size, registration_start_time, registration_deadline, winner_id, schedule, created_at, started_at, ended_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      const tournamentId = insertTournament.run(
      objects.tournaments.name,
      userId,
      objects.tournaments.current_round,
      objects.tournaments.size,
      objects.tournaments.registration_start_time,
      objects.tournaments.registration_deadline,
      objects.tournaments.winner_id,
      objects.tournaments.schedule,
      objects.tournaments.created_at,
      objects.tournaments.started_at,
      objects.tournaments.ended_at
      ).lastInsertRowid
      
      console.log(`Added tournament with ID: ${tournamentId}`)
      
      return reply.code(201).send({
        success: true,
        message: 'New tournament created successfully',
        tournamentId: tournamentId
      });
    } catch (error){
      return reply.code(500).send({
        statusCode: 500,
        error: 'Failed to generate tournament',
        details: error.message
      })
    }
  },

  async startTournament (request, reply) {
    const { tournamentId } = request.params

    try {
      const schedule = tournamentService.startTournament(tournamentId)

      if (!schedule.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: schedule.error,
          details: schedule.message
        })
      }
      const response = await fetch(`${UM_SERVICE_URL}/tournament/matches`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tournamentId, schedule})
      })
      if (!response.ok) {
          const userdata = await response.json()
          console.log(userdata)
          const error = new Error(`Failed to start match`);
          error.statusCode = response.status;
          throw error;
      }
      reply.code(200).send({ 
        statusCode: 200,
        message: `Tournament ${tournamentId} started`
    });
    } catch (error) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Failed to start tournament',
        details: error.message
      })
    }
  },

  async postMatchResults (request, reply) {
    const { tournamentId, matchId } = request.params
    const { winner, score } = request.body

    try {
      if (!winner || !score) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Missing required fields',
          details: 'Winner and score are required'
        })
      }

      const result = tournamentService.recordMatchResult(tournamentId, matchId, winner, score)

      if (!result.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: result.error,
          details: result.message
        })
      }
      return result
    } catch (error) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Failed to record match result',
        details: error.message
      })
    }
  },

  async getPlayerMatches (request, reply) {
    const { tournamentId, playerId } = request.params

    try {
      const result = tournamentService.getPlayerMatches(tournamentId, playerId)

      if (!result.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: result.error,
          details: result.message
        })
      }
      return result
    } catch (error) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Failed to fetch player matches',
        details: error.message
      })
    }
  }
  // TODO: get tournament statistics '/:tournamentId/statistics'
}
