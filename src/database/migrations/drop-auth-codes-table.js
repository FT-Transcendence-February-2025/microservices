import database from "../database.js";

const dropAuthCodesTable = async () => {
  try {
    const exists = await database.schema.hasTable("auth_codes");
		if (exists) {
      await database.schema.dropTable("auth_codes");
      console.log("Auth codes table dropped");
    } else {
      console.log("Auth codes table does not exist");
    }
  } catch (error) {
    console.error("Error dropping auth codes table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
	await dropAuthCodesTable();
})();