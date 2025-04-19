import { tournamentController } from '../controllers/tournamentControllers.js'
import { inviteController } from '../controllers/inviteController.js';
import { updateController } from '../controllers/updateController.js'
import { usersController } from '../controllers/usersController.js';
import { playersController } from '../controllers/playersController.js';
import { joinController } from '../controllers/joinController.js';
import { deletionController } from '../controllers/deletionController.js';

export default async function (fastify) {
  
  //add to users table
  fastify.post('/addUser', {
    schema: {
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            usersPos: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }, handler: usersController.addUser
  })
  
  // Invite players
  fastify.post('/:tournamentId/invite', {
    schema: {
    params: {
      type: 'object',
      required: ['tournamentId'],
      properties: {
          tournamentId: { type: 'string', minLength: 1 }
        }
      },
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
					userId: {
						type: "number",
						multipleOf: 1
					},
          ids: {
            type: "array",
            items: { 
              type: "number",
              multipleOf: 1
            }
          }
        }
      }
    }, handler: inviteController.sendInvite
  })
  
  //fill tournament table
  fastify.post('/:tournamentId/updateTournament', {    
    schema: {
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
            tournamentId: { type: 'string', minLength: 1 }
          }
      },
      body: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 1 },
          current_round: { type: 'integer', minimum: 0 },
          registration_start_time: { type: 'string', format: 'date-time' },
          registration_deadline: { type: 'string', format: 'date-time' },
          winner_id: { type: 'string' },
          ended_at: { type: 'string', format: 'date-time' }
        }
      }
    }, handler:updateController.updateTournament
  })
  
  //fill scores table
  fastify.post('/:tournamentId/updateScores', {    
    schema: {
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
            tournamentId: { type: 'string', minLength: 1 }
          }
      },
      body: {
        type: 'object',
        required: ['round_number'],
        additionalProperties: false,
        properties: {
          round_number: { type: 'integer', minimum: 1 },
          match_index: { type: 'integer', minimum: 0 },
          winner_id: { type: 'string' },
          score: { type: 'string' },
          started_at: { type: 'string', format: 'date-time' },
          ended_at: { type: 'string', format: 'date-time' }
        }
      }
    }, handler:updateController.updateScores
  })

  // Get all players in tournament
  fastify.get('/:tournamentId/players', {
    schema: {
    params: {
      type: 'object',
      required: ['tournamentId'],
      properties: {
          tournamentId: { type: 'string', minLength: 1 }
        }
      }
    }, handler: playersController.getAllPlayers
  })
  
  // Register player for tournament
  fastify.post('/:tournamentId/register', {    
    schema: {
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
            tournamentId: { type: 'string', minLength: 1 }
          }
      },
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            usersPos: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }, handler:playersController.registerPlayer
  })
  
  // Get players matches in tournament
  fastify.get('/:tournamentId/players/:playerId/matches',  {
    schema: {
    params: {
      type: 'object',
      required: ['tournamentId', 'playerId'],
      properties: {
          tournamentId: { type: 'string', minLength: 1 }
        }
      }
    }, handler: tournamentController.getPlayerMatches
  })

  // Genarate new Tournament
  fastify.post('/host', tournamentController.generateTournament)
  
  // Start tournament
  fastify.post('/:tournamentId/start',  {
    schema: {
    params: {
      type: 'object',
      required: ['tournamentId'],
      properties: {
          tournamentId: { type: 'string', minLength: 1 }
        }
      }
    }, handler: tournamentController.startTournament
  })
  
  // Submit match results
  fastify.post('/:tournamentId/matches/:matchId/results',   {
    schema: {
    params: {
      type: 'object',
      required: ['tournamentId', 'matchId'],
      properties: {
          tournamentId: { type: 'string', minLength: 1 }
        }
      }
    }, handler: tournamentController.postMatchResults
  })
  
  // Get all tournaments
  fastify.get('/activeTournaments', tournamentController.getAllTournaments)

  // Join to tournament
  fastify.post('/:tournamentId/join', {
    schema: {
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
            tournamentId: { type: 'string', minLength: 1 }
          }
      },
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            usersPos: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: joinController.joinTournament
  })

  // Unregistered player for tournament
  fastify.delete('/:tournamentId/register',  {
    schema: {
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
            tournamentId: { type: 'string', minLength: 1 }
          }
      },
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            usersPos: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: deletionController.deletePlayer
  })

  //delete user from users table
  fastify.delete('/deleteUser', {    
    schema: {
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            usersPos: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }, handler:deletionController.deleteUser
  })

  fastify.delete('/:tournamentId/deleteTournament',  {
    schema: {
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
            tournamentId: { type: 'string', minLength: 1 }
          }
      }
    },
    handler: deletionController.deleteTournament
  })
}
