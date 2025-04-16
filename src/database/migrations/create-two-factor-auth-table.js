import database from "../database.js"

const createTwoFactorAuthTable = async () => {
  try {
    await database.schema.createTable("two_factor_auth", (table) => {
      table.increments("id").primary();
      table.integer("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE").unique();
			table.enu("mode", ["off", "email", "phone", "app"]).notNullable();
			table.string("phone_number").unique().nullable();
			table.string("phone_initialization_vector").nullable();
			table.string("phone_auth_tag").nullable();
			table.string("app_secret").unique().nullable();
			table.string("app_initialization_vector").nullable();
			table.string("app_auth_tag").nullable();
			table.boolean("app_enabled").nullable();
			table.timestamp("created_at").defaultTo(database.fn.now());
			table.timestamp("updated_at").defaultTo(database.fn.now());
    });
    console.log("Two factor auth table created");
  } catch (error) {
    console.error("Error creating two factor auth table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
  await createTwoFactorAuthTable();
})();