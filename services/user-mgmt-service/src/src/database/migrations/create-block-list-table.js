import database from "../database.js"

const createBlockListTable = async () => {
	try {
		await database.schema.createTable("block_list", (table) => {
			table.increments("id").primary();
			table.integer("blocking_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
			table.integer("blocked_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
			table.integer("created_at").defaultTo(database.fn.now());
			table.unique(["blocking_id", "blocked_id"]);
		});
		console.log("Block list table created");
	} catch (error) {
		console.error("Error creating block list table:", error);
	} finally {
		await database.destroy();
	}
};

(async () => {
	await createBlockListTable();
})();