const express = require('express');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const router = express.Router();

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    // Create new user
    const newUser = await User.create(phone, password, name);
    const token = User.generateToken(newUser.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.name
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Generate token
    const token = User.generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
});

module.exports = router; 