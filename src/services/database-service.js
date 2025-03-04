import database from '../database/database.js'

const db = {
	updateAvatarPath: async (id, avatarPath) => {
		try {
			await database('users')
				.where({ id })
				.update( { avatarPath })
		} catch (error) {
			throw new Error(error);
		}
	}
};


export default db;