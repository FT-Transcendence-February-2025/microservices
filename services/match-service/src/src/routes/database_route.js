import db from '../db/connection.js'

export const matchmakingDbRoute = (fastify) => {
  fastify.get('/test-matchmaking-db', async (request, reply) => {
    try {
      // With better-sqlite3, queries are synchronous
      const matches = db.prepare('SELECT * FROM matchmaking').all()

      reply.send({
        message: 'Successfully fetching matchmaking table information',
        matchCount: matches.length,
        matches
      })
    } catch (error) {
      console.error('Database error:', error)
      reply.status(500).send({
        error: 'Failed to fetch matchmaking table information',
        details: error.message
      })
    }
  })
}
