const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validateContactSearch, validateContactsUpload } = require('../middleware/validation');
const router = express.Router();

// Upload user contacts (requires authentication)
router.post('/upload', auth, validateContactsUpload, async (req, res) => {
  try {
    const { contacts: newContacts } = req.body;
    const userId = req.user.id;

    // Upload contacts using User model
    await User.uploadContacts(userId, newContacts);

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

    // Search for contact names using User model
    const results = await User.searchContact(phoneNumber);

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
    
    const pool = require('../config/database');
    const result = await pool.query(
      'SELECT contact_name, contact_phone, created_at FROM contacts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const userContacts = result.rows;
    
    res.json({
      contacts: userContacts,
      count: userContacts.length
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

// Get contact statistics (requires authentication)
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pool = require('../config/database');
    
    // Get total contacts count
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM contacts WHERE user_id = $1',
      [userId]
    );
    
    // Get unique phone numbers count
    const uniqueResult = await pool.query(
      'SELECT COUNT(DISTINCT contact_phone) as unique_phones FROM contacts WHERE user_id = $1',
      [userId]
    );
    
    // Get recent uploads
    const recentResult = await pool.query(
      'SELECT created_at FROM contacts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    res.json({
      totalContacts: parseInt(totalResult.rows[0].total),
      uniquePhones: parseInt(uniqueResult.rows[0].unique_phones),
      lastUpload: recentResult.rows[0]?.created_at || null
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Delete user's contacts (requires authentication)
router.delete('/my-contacts', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pool = require('../config/database');
    const result = await pool.query(
      'DELETE FROM contacts WHERE user_id = $1 RETURNING COUNT(*) as deleted_count',
      [userId]
    );
    
    const deletedCount = parseInt(result.rows[0].deleted_count);
    
    res.json({
      message: 'Contacts deleted successfully',
      deletedCount
    });
  } catch (error) {
    console.error('Delete contacts error:', error);
    res.status(500).json({ error: 'Failed to delete contacts' });
  }
});

module.exports = router; 