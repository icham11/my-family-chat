require("dotenv").config();
const { sequelize } = require("../models");

async function cleanup() {
  try {
    console.log("Cleaning up duplicate reactions...");
    await sequelize.query(`
      DELETE FROM message_reactions a USING message_reactions b
      WHERE a.id < b.id
      AND a.message_id = b.message_id
      AND a.user_id = b.user_id
      AND a.type = b.type;
    `);
    console.log("Duplicates removed.");
  } catch (err) {
    console.error("Error cleanup:", err);
  } finally {
    await sequelize.close();
  }
}

cleanup();
