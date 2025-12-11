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

// create bookings table
async function createBookingsTable() {
  const client = await pool.connect();

  try {
    console.log("Creating bookings table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        
        -- Relationships
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,

        -- Booking dates
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,

        -- Guests
        guests_adults INTEGER DEFAULT 1 CHECK (guests_adults >= 1),
        guests_children INTEGER DEFAULT 0 CHECK (guests_children >= 0),

        -- Pricing (snapshot at booking time)
        nightly_rate NUMERIC(12,2) NOT NULL CHECK (nightly_rate > 0),
        total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
        currency CHAR(3) DEFAULT 'UGX' CHECK (currency ~ '^[A-Z]{3}$'),

        -- Status
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
          'pending',
          'confirmed',
          'cancelled',
          'completed',
          'no_show'
        )),

        -- Payment
        payment_method VARCHAR(50),
        payment_id VARCHAR(100),
        paid_at TIMESTAMPTZ,

        -- Notes
        notes TEXT,

        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),

        -- Constraints
        CONSTRAINT valid_date_range CHECK (check_out > check_in),
        CONSTRAINT prevent_double_booking 
          UNIQUE (apartment_id, check_in, check_out)
      );
    `);

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_apartment_dates 
        ON bookings(apartment_id, check_in, check_out);
      
      CREATE INDEX IF NOT EXISTS idx_bookings_user 
        ON bookings(user_id);
      
      CREATE INDEX IF NOT EXISTS idx_bookings_status 
        ON bookings(status);
      
      CREATE INDEX IF NOT EXISTS idx_bookings_dates 
        ON bookings(check_in, check_out);
    `);

    // Trigger: Auto-update updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
      
      CREATE TRIGGER update_bookings_updated_at
        BEFORE UPDATE ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("Bookings table created successfully with all constraints & indexes!");
    console.log("Ready for Airbnb-level booking system!");

  } catch (error) {
    console.error("Failed to create bookings table:", error.stack);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the function
// createBookingsTable().then(() => process.exit(0)).catch(() => process.exit(1));


// create reviews table
async function createReviewsTable() {
  const client = await pool.connect();

  try {
    console.log("Establishing connection...");

    // create reviews table
    await client.query(
      `CREATE TABLE IF NOT EXISTS reviews(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        apartment_id INTEGER REFERENCES apartments(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    console.log("Reviews table has been created!");
  } catch (error) {
    console.error("Connection Failed:", error.stack);
  } finally {
    client.release();
    pool.end();
  }
}
