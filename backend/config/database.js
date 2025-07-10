const { Pool } = require('pg');

// Check if we're in development mode without database
const isDevelopmentWithoutDB = process.env.NODE_ENV === 'development' && !process.env.DB_HOST;

let pool;

if (isDevelopmentWithoutDB) {
  console.log('⚠️  Running in development mode without database connection');
  console.log('📝 API endpoints will work but data will not persist');
  
  // Create a mock pool for development
  pool = {
    query: async (text, params) => {
      console.log('Mock DB Query:', text, params);
      return { rows: [], rowCount: 0 };
    },
    connect: async () => {
      return {
        query: async (text, params) => {
          console.log('Mock DB Query:', text, params);
          return { rows: [], rowCount: 0 };
        },
        release: () => {}
      };
    },
    end: async () => {}
  };
} else {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'getcontact_uzb',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  // Test the connection
  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    if (process.env.NODE_ENV === 'production') {
      process.exit(-1);
    }
  });
}

module.exports = pool; 