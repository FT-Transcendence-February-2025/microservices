import database from "../database/database.js"

const db = {
	addUser: async (id, displayName, avatarPath, wins, loses) => {
		try {
			await database("users").insert({ id, display_name: displayName, avatar_path: avatarPath, wins, loses });
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	getUser: async (identifier) => {
    try {
      let query = database("users");

      if (typeof identifier === "number") {
          query = query.where({ id: identifier });
      } else {
          query = query.where({ display_name: identifier });
      }

      return await query.first();
    } catch (error) {
      console.error(error);
      return { error };
    }
	},

	updateDisplayName: async (id, newDisplayName) => {
		try {
			await database("users")
				.where({ id })
				.update({ display_name: newDisplayName });
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	},

	updateAvatarPath: async (id, avatarPath) => {
		try {
			await database("users")
				.where({ id })
				.update({ avatar_path: avatarPath })
			return { success: true };
		} catch (error) {
			console.error(error);
			return { error };
		}
	}
};


export default db;