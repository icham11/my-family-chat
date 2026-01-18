const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log("Migrating database...");

    // Add type and attachment_url to chats
    await client.query(`
            ALTER TABLE chats 
            ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'text',
            ADD COLUMN IF NOT EXISTS attachment_url TEXT;
        `);

    console.log("Database migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
