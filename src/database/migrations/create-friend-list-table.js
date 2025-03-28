import database from "../database.js"

const createFriendListTable = async () => {
	try {
		await database.schema.createTable("friend_list", (table) => {
			table.increments("id").primary();
			table.integer("user1_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
			table.integer("user2_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
			table.enu("status", ["pending", "accepted"]).notNullable();
			table.integer("created_at").defaultTo(database.fn.now());
			table.unique(["user1_id", "user2_id"]);
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