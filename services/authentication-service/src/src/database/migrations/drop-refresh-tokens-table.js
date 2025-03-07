import database from "../database.js";

const dropRefreshTokensTable = async () => {
  try {
    const exists = await database.schema.hasTable("refreshTokens");
    if (exists) {
      await database.schema.dropTable("refreshTokens");
      console.log("refreshTokens table dropped");
    } else {
      console.log("refreshTokens table does not exist");
    }
  } catch (error) {
    console.error("Error dropping refreshTokens table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
	await dropRefreshTokensTable();
})();