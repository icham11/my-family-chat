const { Pool } = require("pg");
require("dotenv").config();

const createDb = async () => {
  // Connect to default 'postgres' database to create new db
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: "postgres", // Default DB
  });

  try {
    const client = await pool.connect();

    // Check if database exists
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`
    );
    if (res.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log("Database created.");
    } else {
      console.log("Database already exists.");
    }
    client.release();
    await pool.end();

    // Connect to the new database to create tables
    const appPool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });

    const appClient = await appPool.connect();

    console.log("Creating tables...");

    // Users Table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rooms Table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      );
    `);

    // Seed Rooms if empty
    const roomCount = await appClient.query("SELECT COUNT(*) FROM rooms");
    if (parseInt(roomCount.rows[0].count) === 0) {
      await appClient.query(`
            INSERT INTO rooms (name, description) VALUES 
            ('General', 'Ruang keluarga umum'),
            ('Makan Malam', 'Diskusi menu makan'),
            ('Liburan', 'Rencana liburan keluarga')
        `);
      console.log("Rooms seeded.");
    }

    // Chats Table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        room_id INTEGER REFERENCES rooms(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tables created successfully.");
    appClient.release();
    await appPool.end();
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};

createDb();
