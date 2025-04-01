import database from "../database/database.js"

const db = {
	createUser: async (email, password, emailVerified) => {
		try {
			await database("users").insert({ email, password, email_verified: emailVerified });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.createUser: ", error);
			return { error };
		}
	},
	getUserByEmail: async (email) => {
		try {
			return await database("users").where({ email }).first();
		} catch (error) {
			console.error("Error in function db.getUserByEmail: ", error);
			return { error };
		}
	},
	getUserById: async (id) => {
		try {
			return await database("users").where({ id }).first();
		} catch (error) {
			console.error("Error in function db.getUserById: ", error);
			return { error };
		}
	},
	getUserByDisplayName: async (displayName) => {
		try {
			return await database("users").where({ display_name: displayName }).first();
		} catch (error) {
			console.error("Error in function db.getUserByDisplayName: ", error);
			return { error };
		}
	},
	updateEmail: async (id, newEmail) => {
		try {
			await database("users")
				.where({ id })
				.update({ email: newEmail });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateEmail: ", error);
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
			console.error("Error in function db.updatePassword: ", error);
			return { error };
		}
	},
	updateEmailVerified: async (id, verified) => {
		try {
			await database("users")
				.where({ id })
				.update({ email_verified: verified });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateEmailVerified: ", error);
			return { error };
		}
	},
	getDevice: async (userId, deviceHash) => {
		try {
			return await database("devices").where({ user_id: userId, device_hash: deviceHash }).first();
		} catch (error) {
			console.error("Error in function db.getDevice: ", error);
			return { error };
		}
	},
	addDevice: async (userId, deviceHash, token, expiresAt) => {
		try {
			await database("devices").insert({ user_id: userId, device_hash: deviceHash, token, expires_at: expiresAt });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.addDevice: ", error);
			return { error };
		}
	},
	updateToken: async (userId, deviceHash, newToken, newExpiresAt) => {
  try {
    const updatedRows = await database("devices")
      .where({ user_id: userId, device_hash: deviceHash })
      .update({ token: newToken, expires_at: newExpiresAt });

    if (updatedRows === 0) {
			console.error("Error in function db.updateToken: device not found in table.");
      return { error: "Device not found" };
    }

    return { success: true };
  } catch (error) {
		console.error("Error in function db.updateToken: ", error);
    return { error };
  }
},
	deleteDevice: async (userId, deviceHash) => {
		try {
			await database("devices").where({ user_id: userId, device_hash: deviceHash }).del();
			return { success: true };
		} catch (error) {
			console.error("Error in function db.deleteDevice: ", error);
			return { error };
		}
	},
	deleteExpiredTokens: async () => {
		console.log("Running scheduled expired token removal...");
		try {
			const currentDate = Math.floor(Date.now() / 1000);
			const deletedRows = await database("devices")
				.where("expires_at", "<", currentDate)
				.del();

			console.log(`Deleted ${deletedRows} expired tokens.`);
    } catch (error) {
			console.error("Error in function db.deleteExpiredTokens: ", error);
			return { error };
    }
	}
};

export default db;