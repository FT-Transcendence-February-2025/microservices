import database from "../database.js";

const dropUsersTable = async () => {
	try {
		const exists = await database.schema.hasTable("users");
		if (exists) {
			await database.schema.dropTable("users");
			console.log("Users table dropped");
		} else {
			console.log("Users table does not exist");
		}
	} catch (error) {
		console.error("Error dropping users table:", error);
	} finally {
		await database.destroy();
	}
};

dropUsersTable();