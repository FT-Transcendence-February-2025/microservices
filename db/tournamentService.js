import { generateRoundRobin } from '../logic/roundRobin.js'
import db from './database.js'

export const tournamentService = {
  // Player registration
  registerPlayer (tournamentId, userId) {
    try {
      // User exists?
      const playerExists = db.prepare('SELECT player_id FROM players WHERE player_id = ?').get(userId)
      if (playerExists) {
        return {
          success: false,
          error: 'Can not add player',
          message: `player ID ${userId} is already registered`
        }
      }

      const userExists = db.prepare('SELECT user_id FROM users WHERE user_id = ?').get(userId)
      if (!userExists) {
        return {
          success: false,
          error: 'User not found',
          message: `Cannot register player ID ${userId}`
        }
      }

      const tournamentExists = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
      if (!tournamentExists) {
        return {
          success: false,
          error: 'Tournament not found',
          message: `Cannot register for tournament ID ${tournamentId}: tournament does not exists`
        }
      }

      try {
        const insertPlayer = db.prepare(`
          INSERT INTO players
          (player_id, tournament_id, joined_at)
          VALUES(?, ?, ?)
          `);
          
        const result = insertPlayer.run(
            userId,
            tournamentId,
            new Date().toISOString()
        );
        console.log(`Player ${userId} inserted in Position: ${result.lastInsertRowid}`);
        return {
          success: true,
          message: `Player ${userId} successfully registered for tournament ${tournamentId}`
        }
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          return {
            success: false,
            error: 'Already registered',
            message: `Player ${userId} is already registered for tournament ${tournamentId}`
          }
        }
        throw error
      }
    } catch (error) {
      console.log(`Player insertion failed`)
      return {
        success: false,
        error: 'Database error',
        message: error.message
      }
    }
  },

  unregisterPlayer (tournamentId, playerId) {
    try {
      const result = db.prepare(
        'DELETE FROM players WHERE tournament_id = ? AND player_id = ?'
      ).run(tournamentId, playerId)
      return result.changes > 0
    } catch (error) {
      console.error(`Error unregistering player: ${error.message}`)
      throw error
    }
  },

  getAllPlayers (tournamentId) {
    try {
      // Check if tournament exists
      const tournamentExists = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
      if (!tournamentExists) {
        return {
          success: false,
          error: 'Tournament not found',
          message: `Tournament ID ${tournamentId} does not exist`
        }
      }

      // Join players and users table to get player info
      const players = db.prepare(`
        SELECT u.user_id, u.display_name, p.joined_at
        FROM players p
        JOIN users u ON p.player_id = u.user_id
        WHERE p.tournament_id = ?
        `).all(tournamentId)

      return {
        success: true,
        players
      }
    } catch (error) {
      return {
        success: false
      }
    }
  },
  
  startTournament (tournamentId) {
    try {
      const players = db.prepare(`
        SELECT player_id 
        FROM players 
        WHERE tournament_id = ?
    `).all(tournamentId);

      if (!players || players.length < 2) {
          return {
              success: false,
              error: 'Not enough players',
              message: 'At least 2 players required to start tournament'
          };
      }

      const playersIds = players.map(player => player.player_id)
      const schedule = generateRoundRobin(playersIds)

      db.prepare(`
        UPDATE tournaments
        SET schedule = ?,
          started_at = CURRENT_TIMESTAMP,
          current_round = 1
        WHERE id = ?
        `).run(JSON.stringify(schedule), tournamentId)

      return {
        success: true,
        message: `Tournament ${tournamentId} started with ${playersIds.length} players`,
        schedule
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to start tournament',
        message: error.message
      }
    }
  },

  recordMatchResult (tournamentId, matchId, winnerId, score) {
    try {
      const tournament = db.prepare(
        'SELECT current_round, schedule, started_at FROM tournaments WHERE id = ?'
      ).get(tournamentId)

      if (!tournament) {
        return {
          success: false,
          error: 'Tournament not found',
          message: `Tournament with ID ${tournamentId} does not exist`
        }
      }

      if (!tournament.started_at) {
        return {
          success: false,
          error: 'Tournament not started',
          message: 'Cannot record results for a tournament that has not started yet'
        }
      }

      const schedule = JSON.parse(tournament.schedule || '[]')
      const currentRound = tournament.current_round

      if (currentRound < 1 || currentRound > schedule.length) {
        return {
          success: false,
          error: 'Invalid round',
          message: `Current round ${currentRound} is invalid for this tournament`
        }
      }

      const roundIndex = currentRound - 1
      const matchIndex = parseInt(matchId, 10)

      if (isNaN(matchIndex) || matchIndex < 0 || !schedule[roundIndex] || matchIndex >= schedule[roundIndex].length) {
        return {
          success: false,
          error: 'Match not found',
          message: `Match ID ${matchId} not found in round ${currentRound}`
        }
      }

      const match = schedule[roundIndex][matchIndex]
      const [player1Id, player2Id] = match

      if (parseInt(winnerId) !== player1Id && parseInt(winnerId) !== player2Id) {
        return {
          success: false,
          error: 'Invalid winner',
          message: 'Winner must be one of the players in the match'
        }
      }

      db.prepare(`
        INSERT INTO scores (tournament_id, round_number, match_index, winner_id, score)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(tournament_id, round_number, match_index)
        DO UPDATE SET winner_id = ?, score = ?, completed_at = CURRENT_TIMESTAMP
      `).run(
        tournamentId,
        currentRound,
        matchIndex,
        parseInt(winnerId),
        score,
        parseInt(winnerId),
        score
      )

      // Check if all matches are done
      const roundMatches = schedule[roundIndex].length
      const completedMatchesResult = db.prepare(`
        SELECT COUNT(*) AS count FROM scores
        WHERE tournament_id = ? AND round_number = ?
      `).get(tournamentId, currentRound)

      const completedMatches = completedMatchesResult.count

      if (completedMatches === roundMatches) {
        if (currentRound === schedule.length) {
          this.determineTournamentWinner(tournamentId)
        } else {
          db.prepare(
            'UPDATE tournaments SET current_round = current_round + 1 WHERE id = ?'
          ).run(tournamentId)
        }
      }

      return {
        success: true,
        match: {
          tournamentId,
          matchId,
          round: currentRound,
          player1: player1Id,
          player2: player2Id,
          winner: parseInt(winnerId),
          score
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Database error (recordMatchResult method)',
        message: error.message
      }
    }
  },

  determineTournamentWinner (tournamentId) {
    const matchResults = db.prepare(`
      SELECT winner_id FROM scores
      WHERE tournament_id = ?
    `).all(tournamentId)

    const playerWins = {}

    for (const match of matchResults) {
      const winnerId = match.winner_id
      playerWins[winnerId] = (playerWins[winnerId] || 0) + 1
    }

    let tournamentWinner = null
    let maxWins = -1

    for (const [playerId, wins] of Object.entries(playerWins)) {
      if (wins > maxWins) {
        maxWins = wins
        tournamentWinner = playerId
      }
    }
    if (tournamentWinner) {
      db.prepare(`
        UPDATE tournaments
        SET winner_id = ?, ended_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(tournamentWinner, tournamentId)
    }
  },

  getPlayerMatches (tournamentId, playerId) {
    try {
      const tournament = db.prepare(
        'SELECT id, current_round, schedule FROM tournaments WHERE id = ?'
      ).get(tournamentId)

      if (!tournament) {
        return {
          success: false,
          error: 'Tournament not found',
          message: `Tournament with ID ${tournamentId} does not exist`
        }
      }

      const schedule = JSON.parse(tournament.schedule || '[]')

      const matches = []

      for (let round = 0; round < schedule.length; round++) {
        const roundMatches = schedule[round]

        for (let matchIndex = 0; matchIndex < roundMatches.length; matchIndex++) {
          const match = roundMatches[matchIndex]
          const [player1Id, player2Id] = match
          const playerIdInt = parseInt(playerId)

          if (player1Id === playerIdInt || player2Id === playerIdInt) {
            let status = 'scheduled'

            const result = db.prepare(`
              SELECT winner_id as winner, score, completed_at as completedAt
              FROM scores
              WHERE tournament_id = ? AND round_number = ? AND match_index = ?
            `).get(tournamentId, round + 1, matchIndex)

            if (result) {
              status = 'completed'
            }

            matches.push({
              id: matchIndex,
              round: round + 1,
              player1: player1Id,
              player2: player2Id,
              status,
              result
            })
          }
        }
      }
      if (matches.length === 0) {
        return {
          success: false,
          error: 'Player is not register in tournament'
        }
      } else {
        return {
          success: true,
          matches
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Database error (getPlayerMatches method)',
        message: error.message
      }
    }
  },

  getAllTournaments () {
    try {
      const tournaments = db.prepare(`
        SELECT t.id, t.name, u.user_id, u.display_name
        FROM tournaments t
        JOIN users u ON t.created_by = u.user_id
        `).all()

      return {
        success: true,
        tournaments
      }
    } catch (error) {
      console.log(`${error}`);
      return {
        success: false,
        error: error
      }
    }
  }
}
