import db from '../db/database.js'

export const deletionController = {
    async deleteTournaments() {
        try {
          db.exec('DROP TABLE IF EXISTS tournaments');
          console.log('Tournaments table deleted successfully');
        } catch (error) {
          console.error('Error deleting table:', error);
        }
      } 
}