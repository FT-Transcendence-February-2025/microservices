import database from "../database.js";

const dropMatchHistoryTable = async () => {
	try {
		const exists = await database.schema.hasTable("match_history");
		if (exists) {
			await database.schema.dropTable("match_history");
			console.log("Match history table dropped");
		} else {
			console.log("Match history table does not exist");
		}
	} catch (error) {
		console.error("Error dropping match history table:", error);
	} finally {
		await database.destroy();
	}
};

dropMatchHistoryTable();