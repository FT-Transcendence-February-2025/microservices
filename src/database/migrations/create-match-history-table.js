import database from "../database.js"

const createMatchHistoryTable = async () => {
	try {
		await database.schema.createTable("match_history", (table) => {
			table.increments("id").primary();
			table.string("display_name").notNullable();
			table.string("opponent_display_name").notNullable();
			table.integer("user_score").notNullable();
			table.integer("opponent_score").notNullable();
			table.timestamp("match_date").notNullable();
		});
		console.log("Match history table created");
	} catch (error) {
		console.error("Error creating match table:", error);
	} finally {
		await database.destroy();
	}
};

(async () => {
	await createMatchHistoryTable();
})();