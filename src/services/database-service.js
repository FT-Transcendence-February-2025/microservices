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
	deleteUser: async (userId) => {
		try {
			await database("users").where({ id: userId }).del();
			return { success: true };
		} catch (error) {
			console.error(error);
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
	},
	addAuthCode: async (userId, code, expiresAt, type) => {
		try {
			await database("auth_codes").insert({ user_id: userId, code, expires_at: expiresAt, type });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.addAuthCode: ", error);
			return { error };
		}
	},
	getAuthCode: async (userId, code, type) => {
		try {
			const authCodeEntry = await database("auth_codes")
				.where({ user_id: userId, code, type })
				.first();
			if (!authCodeEntry) {
				return { error: "Verification code invalid", status: 404 };
			}

			const currentTime = Math.floor(Date.now() / 1000);
			if (currentTime > authCodeEntry.expires_at) {
				await database("auth_codes")
					.where({ user_id: userId, code, type })
					.del();
	
				return { error: "Verification code expired", status: 410 };
			}
	
			return authCodeEntry;
		} catch (error) {
			console.error("Error in function db.getAuthCode: ", error);
			return { error: "Internal Server Error", status: 500 };
		}
	},
	deleteAuthCode: async (id) => {
		try {
			await database("auth_codes").where({ id }).del();
			return { success: true };
		} catch (error) {
			console.error("Error in function db.deleteAuthCode:", error);
			return { error };
		}
	},
	deleteExpiredAuthCodes: async () => {
		console.log("Running scheduled expired auth codes removal...");
		try {
			const currentDate = Math.floor(Date.now() / 1000);
			const deletedRows = await database("auth_codes")
				.where("expires_at", "<", currentDate)
				.del();

			console.log(`Deleted ${deletedRows} expired codes.`);
    } catch (error) {
			console.error("Error in function db.deleteExpiredTokens: ", error);
			return { error };
    }
	},
	updatePhoneNumber: async (userId, smsPhoneNumber, smsInitializationVector, smsAuthTag) => {
		try {
			await database("two_factor_auth")
				.where({ user_id: userId })
				.update({
					sms_phone_number: smsPhoneNumber,
					sms_initialization_vector: smsInitializationVector,
					sms_auth_tag: smsAuthTag
				});
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updatePhoneNumber: ", error);
			return { error };
		}
	},
	deletePhoneNumber: async (userId) => {
		try {
			await database("two_factor_auth")
				.where({ user_id: userId })
				.update({
					sms_phone_number: null,
					sms_initialization_vector: null,
					sms_auth_tag: null
				});
	
			return { success: true };
		} catch (error) {
			console.error("Error in function db.deletePhoneNumber:", error);
			return { error: "Internal Server Error", status: 500 };
		}
	},
	updateApp: async (userId, appSecret, appInitializationVector, appAuthTag, appEnabled) => {
		try {
			await database("two_factor_auth")
				.where({ user_id: userId })
				.update({
					app_secret: appSecret,
					app_initialization_vector: appInitializationVector,
					app_auth_tag: appAuthTag,
					app_enabled: appEnabled
				});
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateApp: ", error);
			return { error };
		}
	},
	updateAppEnabled: async (userId, appEnabled) => {
		try {
			await database("two_factor_auth")
				.where({ user_id: userId })
				.update({ app_enabled: appEnabled });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateAppEnabled: ", error);
			return { error };
		}
	},
	deleteApp: async (userId) => {
		try {
			await database("two_factor_auth")
				.where({ user_id: userId })
				.update({
					app_secret: null,
					app_initialization_vector: null,
					app_auth_tag: null,
					app_enabled: false
				});
	
			return { success: true };
		} catch (error) {
			console.error("Error in function db.deleteApp:", error);
			return { error: "Internal Server Error", status: 500 };
		}
	},
	updateMode: async (userId, newMode) => {
		try {
			await database("two_factor_auth")
				.where({ user_id: userId })
				.update({ mode: newMode });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.updateMode:", error);
			return { error };
		}
	},
	getTwoFactorInfo: async (userId) => {
		try {
			return await database("two_factor_auth").where({ user_id: userId }).first();
		} catch (error) {
			console.error("Error in function db.get2faInfo:", error);
			return { error };
		}
	},
	addUserTwoFactor: async (userId) => {
		try {
			await database("two_factor_auth").insert({ user_id: userId, mode: "off" });
			return { success: true };
		} catch (error) {
			console.error("Error in function db.addUserTwoFactor: ", error);
			return { error };
		}
	},
};

export default db;