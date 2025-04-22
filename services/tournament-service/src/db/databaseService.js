import db from './database.js'

export const databaseService = {
  async newScores(tournamentId, round_number, match_index){
    try{
      const insertScore = db.prepare(`
          INSERT INTO scores
        (tournament_id, round_number, match_index, winner_id, score, started_at, ended_at)
        VALUES(?, ?, ?, ?, ?, ?, ?)
        `)
        
      const result = insertScore.run(
        tournamentId,
        round_number,
        match_index,
        null,
        null,
        new Date().toISOString(),
        null
      )
      return{
        success: true,
        scoreId: result.lastInsertRowid
      }
      
    } catch(error) {
      console.error('Error creating new score entry:', error)
      return {
          success: false,
          error: 'Failed to create score entry',
          details: error.message
      };
    }
  }
}