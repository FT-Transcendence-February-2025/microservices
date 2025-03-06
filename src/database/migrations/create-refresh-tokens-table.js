import database from "../database.js"

const createRefreshTokensTable = async () => {
  try {
    await database.schema.createTable("refreshTokens", (table) => {
      table.increments("id").primary();
			table.string("token").notNullable();
      table.bigInteger("expiresAt").notNullable();
      table.integer("userId").unsigned().notNullable()
	      .references("id").inTable("users")
	      .onDelete("CASCADE");
    });
    console.log("refreshTokens table created");
  } catch (error) {
    console.error("Error creating refreshTokens table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
  await createRefreshTokensTable();
})();