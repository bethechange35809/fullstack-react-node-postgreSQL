require('dotenv').config();
const { Pool } = require('pg');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let pool = null;

async function getDatabaseConfig() {
  const secretName = process.env.AWS_SECRET_NAME;
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-2';

  // Option 1: Fetch securely from AWS Secrets Manager if configured
  if (secretName) {
    try {
      console.log(`Fetching database credentials from AWS Secrets Manager: ${secretName}...`);
      const client = new SecretsManagerClient({ region });
      const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
      
      if (response.SecretString) {
        const secret = JSON.parse(response.SecretString);
        console.log('Successfully retrieved database secret from AWS Secrets Manager!');
        return {
          user: secret.username || secret.user || 'postgres',
          host: secret.host || 'localhost',
          database: secret.dbname || secret.database || 'api',
          password: secret.password,
          port: parseInt(secret.port || '5432', 10),
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        };
      }
    } catch (err) {
      console.error('Failed to retrieve secret from AWS Secrets Manager, falling back to environment variables:', err.message);
    }
  }

  // Option 2: Fallback to environment variables
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }

  return {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'api',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

async function getPool() {
  if (!pool) {
    const config = await getDatabaseConfig();
    pool = new Pool(config);
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  return pool;
}

// Wrapper to export query method
module.exports = {
  query: async (text, params) => {
    const p = await getPool();
    return p.query(text, params);
  },
  getPool,
};
