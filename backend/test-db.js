const pool = require('./config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test a simple query
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Database query result:', result.rows);
    
    // Test user creation
    const userResult = await pool.query(`
      INSERT INTO users (phone, password_hash, name, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, phone, name, created_at
    `, ['+998901234567', 'hashed_password', 'Test User']);
    
    console.log('User creation result:', userResult.rows);
    
  } catch (error) {
    console.error('Database test error:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase(); 