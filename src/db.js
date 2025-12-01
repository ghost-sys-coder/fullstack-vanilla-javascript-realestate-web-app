// connect to neon db
import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

// create tables
async function connectToDB() {
  const client = await pool.connect();

  try {
    console.log("Establishing Connection...");

    // dropping the table deletes all users
    //await client.query("DROP TABLE IF EXISTS apartments");
    // await client.query("DROP TABLE IF EXISTS users");

    //create tables
    await client.query(`
        CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        fullname VARCHAR,
        email VARCHAR,
        password VARCHAR,
        role VARCHAR DEFAULT 'user',

        -- i need to update the users with new columns without dropping it
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    await client.query(`
    CREATE TABLE apartments(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    
    details JSONB NOT NULL DEFAULT '{}',

    amenities JSONB NOT NULL DEFAULT '{}',

    images TEXT[] DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

// create agents table
async function createAgentsTable() {
  const client = await pool.connect();

  try {
    console.log("Establishing Connection...");
    console.log("Creating Agents Table...");

    // query to drop table table
    //await client.query("DROP TABLE IF EXISTS agents");

    await client.query(`
      CREATE TABLE agents(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        mobile TEXT NOT NULL,
        role TEXT NOT NULL,
        socials TEXT[],
        profile_image TEXT NOT NULL
      )
    `);

    console.log("Agents table has been created!");
  } catch (error) {
    console.error("Connection Failed:", error.stack);
  } finally {
    client.release();
    pool.end();
  }
}

// update user table with phone number column
async function updateUsersTableWithContact() {
  const client = await pool.connect();

  try {
    console.log("Establishing connection...");

    // update users table
    await client.query(
      `ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone_number TEXT
      `
    );
    console.log("phone contact column has been added!!");
  } catch (error) {
    console.log("Failed to update user table", error.stack);
  }
}

// updated tables
async function updateTables() {
  const client = await pool.connect();
  try {
    console.log("Establishing connection...");

    // update the user table
    await client.query(
      `ALTER TABLE users
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
      `
    );

    console.log("The table has been updated!");
  } catch (error) {
    console.error("Failed to update table", error.stack);
  } finally {
    client.release();
    pool.end();
  }
}

// create search & filter indexes
async function createIndexes() {
  const client = await pool.connect();

  try {
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_apartments_location ON apartments(location);
      `
    );

    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_apartments_price ON apartments(price);
      `
    );
    console.log("Search & field indices added!");
  } catch (error) {
    console.error("Failed to create indexes", error.stack);
  } finally {
    client.release();
    pool.end();
  }
}

// createAgentsTable();
