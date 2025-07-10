console.log('=== STARTUP TEST ===');
console.log('1. Basic console.log works');

try {
  console.log('2. Testing require statements...');
  
  console.log('2a. Testing dotenv...');
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  
  console.log('2b. Testing express...');
  const express = require('express');
  console.log('✅ express loaded');
  
  console.log('2c. Testing cors...');
  const cors = require('cors');
  console.log('✅ cors loaded');
  
  console.log('2d. Testing helmet...');
  const helmet = require('helmet');
  console.log('✅ helmet loaded');
  
  console.log('2e. Testing rate-limit...');
  const rateLimit = require('express-rate-limit');
  console.log('✅ rate-limit loaded');
  
  console.log('3. Testing route imports...');
  const authRoutes = require('./routes/auth');
  console.log('✅ auth routes loaded');
  
  const contactRoutes = require('./routes/contacts');
  console.log('✅ contact routes loaded');
  
  console.log('4. Creating Express app...');
  const app = express();
  console.log('✅ Express app created');
  
  console.log('5. Setting up middleware...');
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  console.log('✅ Middleware setup complete');
  
  console.log('6. Adding routes...');
  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint working!' });
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/contacts', contactRoutes);
  console.log('✅ Routes added');
  
  console.log('7. Starting server...');
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server started successfully on port ${PORT}`);
    console.log(`🌐 Test URL: http://localhost:${PORT}/test`);
  });
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('=== STARTUP TEST COMPLETE ==='); 