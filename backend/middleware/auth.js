const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  console.log('🔐 Auth middleware called');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.log('❌ No authorization header');
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  if (!token) {
    console.log('❌ No token in header');
    return res.status(401).json({ error: 'Token missing in Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token decoded:', decoded);
    
    // FIX: Use 'id' not 'userId' - this was the main issue!
    req.user = { id: decoded.id, phone: decoded.phone };
    
    console.log('✅ User authenticated:', req.user);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;