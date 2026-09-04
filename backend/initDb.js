require('dotenv').config();
const { Client, Pool } = require('pg');

const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'api';
const user = process.env.DB_USER || 'postgres';
const host = process.env.DB_HOST || 'localhost';
const password = process.env.DB_PASSWORD || 'postgres';
const port = parseInt(process.env.DB_PORT || '5432', 10);
const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

async function initializeDatabase() {
  console.log(`Connecting to PostgreSQL at ${host}:${port} as user '${user}'...`);

  // Step 1: Connect to default postgres DB to check/create the target database
  const defaultClient = new Client({
    user,
    host,
    database: 'postgres',
    password,
    port,
    ssl,
  });

  try {
    await defaultClient.connect();
    console.log('Connected to default postgres database.');

    // Check if database exists
    const checkDbRes = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      // CREATE DATABASE cannot run inside a transaction block or with parameterized query
      await defaultClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('Warning during database creation check:', err.message);
  } finally {
    await defaultClient.end();
  }

  // Step 2: Connect to the target DB and create table
  const targetPool = new Pool({
    user,
    host,
    database: dbName,
    password,
    port,
    ssl,
  });

  try {
    console.log(`Connecting to database '${dbName}' to ensure tables exist...`);
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await targetPool.query(createTableQuery);
    console.log(`Table 'users' verified / created successfully.`);

    // Check if we have sample users, if not, insert initial test data
    const countRes = await targetPool.query('SELECT COUNT(*) FROM users');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('Inserting initial sample users...');
      await targetPool.query(`
        INSERT INTO users (name, email) VALUES
        ('Saketh Varma', 'saketh@example.com'),
        ('John Doe', 'john.doe@example.com'),
        ('Jane Smith', 'jane.smith@example.com')
      `);
      console.log('Initial sample users created.');
    }
    console.log('Database initialization completed successfully! 🚀');
  } catch (err) {
    console.error('Error creating table or inserting data:', err.message);
  } finally {
    await targetPool.end();
  }
}

initializeDatabase();
