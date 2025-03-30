import database from "../database.js";

const dropFriendListTable = async () => {
	try {
		const exists = await database.schema.hasTable("friend_list");
		if (exists) {
			await database.schema.dropTable("friend_list");
			console.log("Friend list table dropped");
		} else {
			console.log("Friend list table does not exist");
		}
	} catch (error) {
		console.error("Error dropping friend list table:", error);
	} finally {
		await database.destroy();
	}
};

dropFriendListTable();