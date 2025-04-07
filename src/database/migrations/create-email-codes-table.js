import database from "../database.js"

const createEmailCodesTable = async () => {
  try {
    await database.schema.createTable("email_codes", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable().references("email").inTable("users").onDelete("CASCADE");
			table.integer("code").notNullable();
      table.bigInteger("expires_at").notNullable();
			table.enu("type", ["password", "email"]).notNullable();
    });
    console.log("Email codes table created");
  } catch (error) {
    console.error("Error creating email codes table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
  await createEmailCodesTable();
})();