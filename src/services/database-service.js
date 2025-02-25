import database from '../database/database.js'

export const updateAvatarPath = async (id, avatarPath) => {
	try {
		await database('users')
			.where({ id })
			.update( { avatarPath })
	} catch (error) {
		throw new Error(error);
	}
};