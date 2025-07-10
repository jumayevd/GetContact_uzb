const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  static async create(phone, password, name = null) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `
        INSERT INTO users (phone, password_hash, name, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, phone, name, created_at
      `;
      
      const result = await pool.query(query, [phone, hashedPassword, name]);
      return result.rows[0];
    } catch (error) {
      console.error('User creation error:', error);
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User with this phone number already exists');
      }
      throw new Error('Failed to create user: ' + error.message);
    }
  }

  static async findByPhone(phone) {
    try {
      const query = 'SELECT * FROM users WHERE phone = $1';
      const result = await pool.query(query, [phone]);
      return result.rows[0];
    } catch (error) {
      console.error('User find error:', error);
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT id, phone, name, created_at FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('User find by ID error:', error);
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
  }

  static async uploadContacts(userId, contacts) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete existing contacts for this user
      await client.query('DELETE FROM contacts WHERE user_id = $1', [userId]);
      
      // Insert new contacts
      for (const contact of contacts) {
        await client.query(`
          INSERT INTO contacts (user_id, contact_name, contact_phone, created_at)
          VALUES ($1, $2, $3, NOW())
        `, [userId, contact.name, contact.phone]);
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Contact upload error:', error);
      throw new Error('Failed to upload contacts: ' + error.message);
    } finally {
      client.release();
    }
  }

  static async searchContact(phoneNumber) {
    try {
      const query = `
        SELECT DISTINCT contact_name, COUNT(*) as frequency
        FROM contacts 
        WHERE contact_phone = $1
        GROUP BY contact_name
        ORDER BY frequency DESC
      `;
      
      const result = await pool.query(query, [phoneNumber]);
      return result.rows;
    } catch (error) {
      console.error('Contact search error:', error);
      throw new Error('Failed to search contact: ' + error.message);
    }
  }
}

module.exports = User; 