import { tournamentService } from '../db/tournamentService.js'
import { databaseService } from '../db/databaseService.js'
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
      
      const playerExists = db.prepare('SELECT player_id FROM players WHERE player_id = ?').get(userId)
      if (playerExists) {
        return {
          success: false,
          error: 'Can not add player',
          message: `player ID ${userId} is already registered`
        }
      }
      
      const insertTournament = db.prepare(`
        INSERT INTO tournaments
      (name, created_by, current_round, size, registration_start_time, registration_deadline, winner_id, schedule, created_at, started_at, ended_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      const tournamentId = insertTournament.run(
        "default",
        userId,
        0,
        0,
        null,
        null,
        null,
        null,
        Date.now(),
        null,
        null
      ).lastInsertRowid
      
      console.log(`Created tournament with ID: ${tournamentId}`)

      const { success, scoreId, error, details } = await databaseService.newScores(tournamentId, 0);
      if (success) {
          console.log(`New score entry created with ID: ${scoreId}`);
      } else {
          // Handle logical errors (e.g., foreign key violations)
          console.error('Failed to create score entry:', error);
          console.error('Details:', details);
      }
      
      console.log(`Score table added at position: ${scoreId}`)
      
      const registerPlayer = tournamentService.registerPlayer(tournamentId, userId)
      if (!registerPlayer.success) {
        return reply.code(400).send({
            statusCode: 400,
            error: 'Bad Request',
            details: registerPlayer.message
        })
      }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          schedule: schedule.schedule // Ensure this is the 2D/3D array
        })
      });
      
      if (!response.ok) {
        const userdata = await response.json();
        const error = new Error(userdata.message || 'Failed to start match');
        error.statusCode = response.status;
        throw error;
      }
      reply.code(200).send({ 
        statusCode: 200,
        message: `Tournament ${tournamentId} started`
      });
    } catch (error) {
      reply.code(error.statusCode || 500).send({
        statusCode: error.statusCode || 500,
        error: error.message,
        details: error.details || error.stack
      });
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
