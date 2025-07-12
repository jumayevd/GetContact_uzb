const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const pool = require('../config/database');
const {
  validateContactSearch,
  validateContactsUpload
} = require('../middleware/validation');

// Upload contacts for a user
router.post('/upload', auth, validateContactsUpload, async (req, res) => {
  console.log('📱 Contact upload started');
  console.log('User ID:', req.user.id);
  console.log('Contacts count:', req.body.contacts?.length);
  
  try {
    const { contacts } = req.body;
    const userId = req.user.id;

    console.log('📋 Sample contacts:', contacts.slice(0, 3));

    await User.uploadContacts(userId, contacts);

    console.log('✅ Contacts uploaded successfully');
    res.json({
      message: 'Contacts uploaded successfully',
      count: contacts.length
    });
  } catch (error) {
    console.error('❌ Upload contacts error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Search contacts - FIXED: removed duplicate route
router.post('/search', auth, validateContactSearch, async (req, res) => {
  console.log('🔍 Contact search started');
  console.log('Search params:', req.body);
  console.log('User:', req.user);
  
  try {
    const { phoneNumber, myPhone } = req.body;

    const results = await User.searchContact(phoneNumber, myPhone);
    
    console.log('🎯 Search results:', results);

    res.json({
      phoneNumber,
      results,
      totalResults: results.length
    });
  } catch (error) {
    console.error('❌ Contact search error:', error);
    res.status(500).json({ error: 'Failed to search contacts' });
  }
});

// Get the authenticated user's uploaded contacts
router.get('/my-contacts', auth, async (req, res) => {
  console.log('📱 Getting user contacts for:', req.user.id);
  
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT contact_name, contact_phone, created_at FROM contacts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    console.log('📊 Found contacts:', result.rows.length);

    res.json({
      contacts: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get contacts error:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

// Get stats about user's contact uploads
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalResult, uniqueResult, recentResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM contacts WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(DISTINCT contact_phone) as unique_phones FROM contacts WHERE user_id = $1', [userId]),
      pool.query('SELECT created_at FROM contacts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId])
    ]);

    res.json({
      totalContacts: parseInt(totalResult.rows[0].total),
      uniquePhones: parseInt(uniqueResult.rows[0].unique_phones),
      lastUpload: recentResult.rows[0]?.created_at || null
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
