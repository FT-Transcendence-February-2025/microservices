import database from "../database.js";

const dropDevicesTable = async () => {
  try {
    const exists = await database.schema.hasTable("devices");
		if (exists) {
      await database.schema.dropTable("devices");
      console.log("Devices table dropped");
    } else {
      console.log("Devices table does not exist");
    }
  } catch (error) {
    console.error("Error dropping Devices table:", error);
  } finally {
    await database.destroy();
  }
};

(async () => {
	await dropDevicesTable();
})();