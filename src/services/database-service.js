import database from '../database/database.js'

const db = {
	createUser: async (email, displayName, password) => {
		try {
			await database('users').insert({ email, displayName, password });
		} catch (error) {
			throw new Error(error);
		}
	},

	getUserByEmail: async (email) => {
		try {
			return await database('users').where({ email }).first();
		} catch (error) {
			throw new Error(error);
		}
	},

	getUserByDisplayName: async (displayName) => {
		try {
			return await database('users').where({ displayName }).first();
		} catch (error) {
			throw new Error(error);
		}
	},

	getUserById: async (id) => {
		try {
			return await database('users').where({ id }).first();
		} catch (error) {
			throw new Error(error);
		}
	},

	updatePassword: async (id, newPassword) => {
		try {
			await database('users')
				.where({ id })
				.update({ password: newPassword });
		} catch (error) {
			throw new Error(error);
		}
	},

	createRefreshToken: async (token, expiresAt, userId) => {
		try {
			await database('refreshTokens').insert({ token, expiresAt, userId });
		} catch (error) {
			throw new Error(error);
		}
	},

	deleteRefreshToken: async (userId) => {
		try {
			await database('refreshTokens').where({ userId }).del();
		} catch (error) {
			throw new Error(error);
		}
	},

	deleteExpiredTokens: async () => {
		const currentDate = Math.floor(Date.now() / 1000);
		
	}
};

export default db;