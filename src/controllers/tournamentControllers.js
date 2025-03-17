import { tournamentService } from '../db/tournamentService.js'
import objects from '../db/objects.js'
import db from '../db/database.js'

export const tournamentController = {

  async generateTournament (request, reply){
    
    const insertTournament = db.prepare(`
      INSERT INTO tournaments
      (name, created_by, current_round, size, registration_start_time, registration_deadline, winner_id, schedule, created_at, started_at, ended_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const tournamentId = insertTournament.run(
      objects.tournaments.name,
      objects.tournaments.created_by,
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
  },

  async postRegisterPlayer (request, reply) {
    const { tournamentId } = request.params
    const { playerId } = request.body

    const result = tournamentService.registerPlayer(tournamentId, playerId)

    if (!result.success) {
      return reply.code(400).send({
        statusCode: 400,
        error: result.error,
        details: result.message
      })
    }
    return result
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
  },

  async getAllPlayers (request, reply) {
    const { tournamentId } = request.params

    try {
      const result = tournamentService.getAllPlayers(tournamentId)

      if (!result.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: result.error,
          details: result.message
        })
      }

      return result.players
    } catch (error) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Failed to fetch players',
        details: error.message
      })
    }
  },

  async startTournament (request, reply) {
    const { tournamentId } = request.params

    try {
      const result = tournamentService.startTournament(tournamentId)

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
  },

  async sendInvite (request, reply) {
    console.log(`Send Invite`)
  },

  async createTournament (request, reply) {
  }

  // TODO: get tournament statistics '/:tournamentId/statistics'
}
