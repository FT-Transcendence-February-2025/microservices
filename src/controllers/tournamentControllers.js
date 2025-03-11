import { tournamentService } from '../db/tournamentService.js'
import { initTournament} from '../db/schema.js'
import objects from '../db/objects.js'
import db from '../db/database.js'

export const tournamentController = {

  async generateTournament (request, reply){
    // const serializedTournament = serializeTournament(objects.tournament)
    try {
      initTournament()
      console.log('Tournament initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      process.exit(1)
    }
    
    const insertTournament = db.prepare(`
      INSERT INTO tournaments
      (created_by, current_round, size, registration_start_time, registration_deadline, winner_id, schedule, scores, created_at, started_at, ended_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const tournamentId = insertTournament.run(
      objects.tournaments.created_by,
      objects.tournaments.current_round,
      objects.tournaments.size,
      objects.tournaments.registration_start_time,
      objects.tournaments.registration_deadline,
      objects.tournaments.winner_id,
      objects.tournaments.schedule,
      objects.tournaments.scores,
      objects.tournaments.created_at,
      objects.tournaments.started_at,
      objects.tournaments.ended_at
   ).lastInsertRowid

    console.log(`Added tournament with ID: ${tournamentId}`)
  },

  async postRegisterPlayer (request, _reply) {
    const { tournamentId } = request.params
    const { playerId } = request.body

    // TODO: implement registration logic with databse
    // return {
    //   success: true,
    //   message: `Player ${playerId} registered for tournament ${tournamentId}`
    // }
    const result = tournamentService.registerPlayer(tournamentId, playerId)

    if (!result.success) {
      _reply.code(400)
    }
    return result
  },

  async deletePlayer (request, _reply) {
    const { tournamentId } = request.params
    const { playerId } = request.body

    // TODO: implement unregistration logic
    // return {
    //   success: true,
    //   message: `Player ${playerId} unregistered from tournament ${tournamentId}`
    // }

    try {
      const result = tournamentService.unregisterPlayer(tournamentId, playerId)

      if (!result) {
        return _reply.code(404).send({
          statusCode: 404,
          error: 'Player not found in tournament'
        })
      }

      return {
        success: true,
        message: `Player ${playerId}, unregistered from tournament ${tournamentId}`
      }
    } catch (error) {
      _reply.code(500).send({
        statusCode: 500,
        error: 'Failed to unregister player',
        details: error.message
      })
    }
  },

  async getAllPlayers (request, _reply) {
    const { tournamentId } = request.params

    // TODO: fetch players from database
    return [
      { id: 'player1', username: 'Player One', message: `Tournament ID: ${tournamentId}` },
      { id: 'player2', username: 'Player Two', message: `Tournament ID: ${tournamentId}` }
    ]
  },

  async postMatchResults (request, _reply) {
    const { tournamentId, matchId } = request.params
    const { winner, score } = request.body

    // TODO: save match results
    return {
      success: true,
      matchId,
      tournamentId,
      result: { winner, score }
    }
  },

  async getPlayerMatches (request, _reply) {
    const { tournamentId, playerId } = request.params

    // TODO: fetch matches from database
    return [
      { id: 'match1', player1: playerId, player2: 'opponent1', status: 'completed', result: { winner: playerId }, message: `Tournament ID: ${tournamentId}` },
      { id: 'match2', player1: playerId, player2: 'opponent2', status: 'scheduled', message: `Tournament ID: ${tournamentId}` }
    ]
  },

  // TODO: get tournament statistics '/:tournamentId/statistics'

  async createSchedule (request, reply) {

    const result = myFunction(); // Call your function here
    reply.send(result); // Send a response back to the client

    // Respond with the created tournament
    // console.log(size);
    // return reply.status(201).send(tournament);

    
    //-name
    //-invites
    //-registrationTime
  },

  async sendInvite (request, reply) {
    // Invite players to a tournament
  },

  async createTournament (request, reply) {
    const { name, players } = request.body
    const newTournament = createTournament(name, players)
    return newTournament
  },

  async getTournaments (request, reply)  {
    try {
    const tournaments = db.prepare('SELECT * FROM tournaments').all();
    console.log('Fetched tournaments:', tournaments); // Add this line for debugging
    reply.send(tournaments);
  } catch (error) {
    console.error('Database error:', error); // Add this line for error logging
    reply.status(500).send({ error: 'Failed to fetch tournament table' });
  }
}
}


