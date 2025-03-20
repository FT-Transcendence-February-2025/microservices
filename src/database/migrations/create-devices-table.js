import database from "../database.js"

const createDevicesTable = async () => {
  try {
    await database.schema.createTable("devices", (table) => {
      table.increments("id").primary();
			table.integer("user_id").unsigned().notNullable()
	      .references("id").inTable("users")
	      .onDelete("CASCADE");
			table.string("device_hash").notNullable();
			table.string("token").notNullable();
      table.bigInteger("expires_at").notNullable();
			table.unique(["user_id", "device_hash"]);
    });
    console.log("refreshTokens table created");
  } catch (error) {
    console.error("Error creating refreshTokens table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
  await createDevicesTable();
})();