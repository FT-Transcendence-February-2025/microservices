import database from "../database.js"

const createFriendListTable = async () => {
	try {
		await database.schema.createTable("friend_list", (table) => {
			table.increments("id").primary();
			table.integer("inviting_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
			table.integer("invited_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
			table.enu("status", ["pending", "accepted"]).notNullable();
			table.integer("created_at").defaultTo(database.fn.now());
			table.unique(["inviting_id", "invited_id"]);
		});
		console.log("Friend list table created");
	} catch (error) {
		console.error("Error creating friend list table:", error);
	} finally {
		await database.destroy();
	}
};

(async () => {
	await createFriendListTable();
})();