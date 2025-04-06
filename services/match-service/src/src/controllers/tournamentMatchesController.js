import db from '../db/connection.js'

export const tournamentMatchesController = {
  async postTournamentMatch (request, reply) {
    const { tournamentId, schedule } = request.body
    if (!tournamentId || !schedule) {
      return reply.code(400).send({
        success: false,
        message: 'Missing required parameters'
      })
    }

    try {
      const insertStmt = db.prepare(`
          INSERT INTO tournament_matches (tournament_id, round, player1_id, player2_id, created_at, room_code)
          VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
        `)

      const insertMany = db.transaction((schedule) => {
        for (let roundIndex = 0; roundIndex < schedule.length; roundIndex++) {
          const roundMatches = schedule[roundIndex]
          const round = roundIndex + 1
          for (const match of roundMatches) {
            const [player1Id, player2Id] = match
            insertStmt.run(tournamentId, round, player1Id, player2Id)
          }
        }
      })

      insertMany(schedule)

      return reply.code(200).send({
        success: true,
        message: 'Tournament matches saved successfully'
      })
    } catch (error) {
      console.error('Error saving tournament matches:', error)
      return reply.code(500).send({
        success: false, message: 'Error saving tournament matches'
      })
    }
  }
}
