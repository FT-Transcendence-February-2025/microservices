import database from "../database.js";

const dropEmailCodesTable = async () => {
  try {
    const exists = await database.schema.hasTable("email_codes");
		if (exists) {
      await database.schema.dropTable("email_codes");
      console.log("Email codes table dropped");
    } else {
      console.log("Email codes table does not exist");
    }
  } catch (error) {
    console.error("Error dropping email codes table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
	await dropEmailCodesTable();
})();