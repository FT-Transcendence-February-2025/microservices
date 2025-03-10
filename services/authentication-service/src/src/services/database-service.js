import database from "../database/database.js"

const db = {
	createUser: async (email, displayName, password) => {
		try {
			await database("users").insert({ email, displayName, password });
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	getUserByEmail: async (email) => {
		try {
			return await database("users").where({ email }).first();
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	getUserByDisplayName: async (displayName) => {
		try {
			return await database("users").where({ displayName }).first();
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	getUserById: async (id) => {
		try {
			return await database("users").where({ id }).first();
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	updatePassword: async (id, newPassword) => {
		try {
			await database("users")
				.where({ id })
				.update({ password: newPassword });
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	createRefreshToken: async (token, expiresAt, userId) => {
		try {
			await database("refreshTokens").insert({ token, expiresAt, userId });
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	deleteRefreshToken: async (userId) => {
		try {
			await database("refreshTokens").where({ userId }).del();
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	deleteExpiredTokens: async () => {
		console.log("Running scheduled expired token removal...");
		try {
			const currentDate = Math.floor(Date.now() / 1000);
			const deletedRows = await database("refreshTokens")
				.where("expiresAt", "<", currentDate)
				.del();

			console.log(`Deleted ${deletedRows} expired tokens.`);
    } catch (error) {
			console.error(error);
			console.error("Error deleting expired tokens:", error);
			throw error; // Re-throw the error to be caught by the caller
    }
	}
};

export default db;