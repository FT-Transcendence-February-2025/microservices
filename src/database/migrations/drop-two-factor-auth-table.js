import database from "../database.js";

const dropTwoFactorAuthTable = async () => {
  try {
    const exists = await database.schema.hasTable("two_factor_auth");
    if (exists) {
      await database.schema.dropTable("two_factor_auth");
      console.log("Two factor auth table dropped");
    } else {
      console.log("Two factor auth table does not exist");
    }
  } catch (error) {
    console.error("Error dropping two factor auth table:", error);
  } finally {
    await database.destroy();
  }
};

dropTwoFactorAuthTable();
