const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const router = express.Router();

// In-memory storage for testing (replace with database later)
const users = [];

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      phone,
      password_hash: hashedPassword,
      name,
      created_at: new Date()
    };
    
    users.push(newUser);
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

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

module.exports = router; 