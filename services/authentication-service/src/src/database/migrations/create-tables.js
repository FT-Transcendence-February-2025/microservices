import { exec } from "child_process";
import database from "../database.js";

const checkAndCreateTables = async (tables) => {
  try {
    console.log("Checking for missing tables in database...");
    const existingTables = await database("sqlite_master")
      .select("name")
      .where("type", "table");

    const existingTableNames = existingTables.map((table) => table.name);

    const missingTables = tables.filter((table) => !existingTableNames.includes(table));

    if (missingTables.length === 0) {
      console.log("All tables exist:", existingTableNames);
      return;
    }

    console.log("Missing tables:", missingTables);

    for (const table of missingTables) {
      const scriptName = `create-${table}-table.js`;
      console.log(`Running script: ${scriptName}`);
      await new Promise((resolve, reject) => {
        exec(`node ${scriptName}`, { cwd: "./src/database/migrations" }, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error running script ${scriptName}:`, error);
            reject(error);
          } else {
            console.log(`Output from ${scriptName}:\n`, stdout);
            if (stderr) console.error(`Error output from ${scriptName}:\n`, stderr);
            resolve();
          }
        });
      });
    }
  } catch (error) {
    console.error("Error checking or creating tables:", error);
  }
};

export default checkAndCreateTables;