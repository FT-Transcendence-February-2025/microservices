import database from "../database.js"

const createAuthCodesTable = async () => {
  try {
    await database.schema.createTable("auth_codes", (table) => {
      table.increments("id").primary();
      table.integer("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
			table.integer("code").notNullable();
      table.bigInteger("expires_at").notNullable();
			table.enu("type", ["sms", "email"]).notNullable();
    });
    console.log("Auth codes table created");
  } catch (error) {
    console.error("Error creating Auth codes table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
  await createAuthCodesTable();
})();