const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting GetContact Uzb Backend Deployment...\n');

async function deploy() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  No .env file found. Creating from template...');
      
      const envTemplate = `# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=getcontact_uzb
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-and-make-it-very-long-and-random

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
HELMET_ENABLED=true
CORS_ENABLED=true

# Logging
LOG_LEVEL=info
`;
      
      fs.writeFileSync(envPath, envTemplate);
      console.log('✅ .env file created. Please update with your actual values.');
      console.log('   ⚠️  IMPORTANT: Change JWT_SECRET and DB_PASSWORD before deployment!');
      return;
    }

    // Check Node.js version
    console.log('1. Checking Node.js version...');
    const nodeVersion = process.version;
    console.log(`   Node.js version: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1).split('.')[0]) < 14) {
      throw new Error('Node.js version 14 or higher is required');
    }
    console.log('✅ Node.js version is compatible\n');

    // Install dependencies
    console.log('2. Installing dependencies...');
    execSync('npm install --production', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');

    // Check database connection
    console.log('3. Testing database connection...');
    try {
      const pool = require('../config/database');
      const result = await pool.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful');
      await pool.end();
    } catch (error) {
      console.log('⚠️  Database connection failed:', error.message);
      console.log('   Make sure PostgreSQL is running and credentials are correct');
    }
    console.log('');

    // Initialize database if needed
    console.log('4. Initializing database...');
    try {
      execSync('npm run init-db', { stdio: 'inherit' });
      console.log('✅ Database initialized\n');
    } catch (error) {
      console.log('⚠️  Database initialization failed:', error.message);
    }

    // Run tests
    console.log('5. Running API tests...');
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('✅ API tests passed\n');
    } catch (error) {
      console.log('⚠️  API tests failed:', error.message);
    }

    // Check if PM2 is available for process management
    console.log('6. Checking process manager...');
    try {
      execSync('pm2 --version', { stdio: 'pipe' });
      console.log('✅ PM2 is available for process management');
      
      // Create PM2 ecosystem file
      const ecosystemConfig = {
        apps: [{
          name: 'getcontact-uzb-backend',
          script: 'index.js',
          instances: 'max',
          exec_mode: 'cluster',
          env: {
            NODE_ENV: 'production',
            PORT: 5000
          },
          error_file: './logs/err.log',
          out_file: './logs/out.log',
          log_file: './logs/combined.log',
          time: true
        }]
      };
      
      fs.writeFileSync(
        path.join(__dirname, '../ecosystem.config.js'),
        `module.exports = ${JSON.stringify(ecosystemConfig, null, 2)};`
      );
      console.log('✅ PM2 ecosystem file created');
    } catch (error) {
      console.log('⚠️  PM2 not available. You can install it with: npm install -g pm2');
    }
    console.log('');

    // Create logs directory
    console.log('7. Setting up logging...');
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
      console.log('✅ Logs directory created');
    } else {
      console.log('✅ Logs directory already exists');
    }
    console.log('');

    // Final deployment instructions
    console.log('🎉 Deployment preparation completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Update .env file with your actual values');
    console.log('   2. Ensure PostgreSQL is running and accessible');
    console.log('   3. Start the server:');
    console.log('      - Development: npm run dev');
    console.log('      - Production: npm start');
    console.log('      - With PM2: pm2 start ecosystem.config.js');
    console.log('');
    console.log('🔒 Security checklist:');
    console.log('   ✅ Change JWT_SECRET to a strong random string');
    console.log('   ✅ Set secure database password');
    console.log('   ✅ Configure CORS origins for production');
    console.log('   ✅ Set up SSL/TLS certificates');
    console.log('   ✅ Configure firewall rules');
    console.log('');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if this file is executed directly
if (require.main === module) {
  deploy();
}

module.exports = deploy; 