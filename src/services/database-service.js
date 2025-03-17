import database from "../database/database.js"

const db = {
	createUser: async (email, password) => {
		try {
			await database("users").insert({ email, password });
			return { success: true };
		} catch (error) {
			console.error("db error", error);
			return { error };
		}
	},

	getUserByEmail: async (email) => {
		try {
			return await database("users").where({ email }).first();
		} catch (error) {

			return { error };
		}
	},

	getUserById: async (id) => {
		try {
			return await database("users").where({ id }).first();
		} catch (error) {
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
			return { error };
		}
	},

	createRefreshToken: async (token, expiresAt, userId) => {
		try {
			await database("refreshTokens").insert({ token, expiresAt, userId });
			return { success: true };
		} catch (error) {
			return { error };
		}
	},

	deleteRefreshToken: async (userId) => {
		try {
			await database("refreshTokens").where({ userId }).del();
			return { success: true };
		} catch (error) {
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
        console.error("Error deleting expired tokens:", error);
    }
	}
};

export default db;