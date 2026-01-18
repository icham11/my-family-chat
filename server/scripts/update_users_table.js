const pool = require("../config/db");

const runMigration = async () => {
  try {
    console.log("Starting user table migration...");

    // Add bio column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT;
    `);
    console.log("Added bio column.");

    // Add avatar_url column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
    `);
    console.log("Added avatar_url column.");

    console.log("User table migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
