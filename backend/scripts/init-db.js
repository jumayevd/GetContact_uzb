const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created: users, contacts');
    console.log('🔍 Indexes created for optimal performance');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase; 