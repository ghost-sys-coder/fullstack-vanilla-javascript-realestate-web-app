// connect to neon db
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

async function connectToDB() {
  const client = await pool.connect();

  try {
    console.log("Establishing Connection...");

    // drop table if it exists
    await client.query("DROP TABLE IF EXISTS products");
    await client.query("DROP TABLE IF EXISTS users");

    // create tables
    await client.query(`
        CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        fullname VARCHAR,
        email VARCHAR,
        password VARCHAR,
        role VARCHAR DEFAULT 'user'
        )
    `);

    await client.query(`
    CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR,
    address VARCHAR,
    buying_price FLOAT,
    rental_price FLOAT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area FLOAT,
    garages INTEGER,
    status VARCHAR,
    commercial BOOLEAN DEFAULT FALSE,
    location VARCHAR,
    images TEXT
    )
    `);
    console.log("Tables created!!");
  } catch (error) {
    console.error("Connection failed", error.stack);
  } finally {
    client.release();
    pool.end();
  }
}

connectToDB();
