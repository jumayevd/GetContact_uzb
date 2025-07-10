const express = require('express');
const jwt = require('jsonwebtoken');
const { validateContactSearch, validateContactsUpload } = require('../middleware/validation');
const router = express.Router();

// In-memory storage for testing
const contacts = [];

// Simple auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Upload user contacts (requires authentication)
router.post('/upload', auth, validateContactsUpload, async (req, res) => {
  try {
    const { contacts: newContacts } = req.body;
    const userId = req.user.id;

    // Remove existing contacts for this user
    const userContactIndexes = contacts
      .map((contact, index) => contact.userId === userId ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    userContactIndexes.forEach(index => contacts.splice(index, 1));

    // Add new contacts
    newContacts.forEach(contact => {
      contacts.push({
        userId,
        contactName: contact.name,
        contactPhone: contact.phone,
        createdAt: new Date()
      });
    });

    res.json({
      message: 'Contacts uploaded successfully',
      count: newContacts.length
    });
  } catch (error) {
    console.error('Contact upload error:', error);
    res.status(500).json({ error: 'Failed to upload contacts' });
  }
});

// Search for contact names by phone number (requires authentication)
router.post('/search', auth, validateContactSearch, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Search for contact names
    const results = contacts
      .filter(contact => contact.contactPhone === phoneNumber)
      .reduce((acc, contact) => {
        const existing = acc.find(r => r.name === contact.contactName);
        if (existing) {
          existing.frequency++;
        } else {
          acc.push({ name: contact.contactName, frequency: 1 });
        }
        return acc;
      }, [])
      .sort((a, b) => b.frequency - a.frequency);

    res.json({
      phoneNumber,
      results,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Contact search error:', error);
    res.status(500).json({ error: 'Failed to search contacts' });
  }
});

// Get user's own contacts (requires authentication)
router.get('/my-contacts', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userContacts = contacts
      .filter(contact => contact.userId === userId)
      .map(contact => ({
        contact_name: contact.contactName,
        contact_phone: contact.contactPhone,
        created_at: contact.createdAt
      }));
    
    res.json({
      contacts: userContacts,
      count: userContacts.length
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

module.exports = router; 