import database from "../database/database.js"

const db = {
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

	// TODO: change exception to object return.
	updateAvatarPath: async (id, avatarPath) => {
		try {
			await database("users")
				.where({ id })
				.update( { avatarPath })
		} catch (error) {
			throw new Error(error);
		}
	}
};


export default db;