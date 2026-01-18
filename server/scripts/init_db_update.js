const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const runMigration = async () => {
  try {
    console.log("Starting migration...");

    // Add reply_to_id column
    await pool.query(`
      ALTER TABLE chats 
      ADD COLUMN IF NOT EXISTS reply_to_id INT REFERENCES chats(id);
    `);
    console.log("Added reply_to_id column.");

    // Add is_forwarded column
    await pool.query(`
      ALTER TABLE chats 
      ADD COLUMN IF NOT EXISTS is_forwarded BOOLEAN DEFAULT FALSE;
    `);
    console.log("Added is_forwarded column.");

    // Create message_reactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_reactions (
        id SERIAL PRIMARY KEY,
        message_id INT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, user_id, type)
      );
    `);
    console.log("Created message_reactions table.");

    // Add last_read_message_id to room_members
    await pool.query(`
      ALTER TABLE room_members 
      ADD COLUMN IF NOT EXISTS last_read_message_id INT;
    `);
    console.log("Added last_read_message_id to room_members.");

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
