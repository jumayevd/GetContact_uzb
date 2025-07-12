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
      if (error.code === '23505') {
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

  static generateToken(userId, phone) {
    return jwt.sign({ id: userId, phone }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
  }

  

  static async uploadContacts(userId, contacts) {
    console.log('💾 Starting contact upload for user:', userId);
    console.log('💾 Total contacts to upload:', contacts.length);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('🔄 Transaction started');

      // Delete existing contacts for this user
      const deleteResult = await client.query('DELETE FROM contacts WHERE user_id = $1', [userId]);
      console.log('🗑️ Deleted old contacts:', deleteResult.rowCount);

      // Insert new contacts
      let insertedCount = 0;
      for (const contact of contacts) {
        try {
          await client.query(`
            INSERT INTO contacts (user_id, contact_name, contact_phone, created_at)
            VALUES ($1, $2, $3, NOW())
          `, [userId, contact.name, contact.phone]);
          insertedCount++;
        } catch (contactError) {
          console.warn('⚠️ Failed to insert contact:', contact, contactError.message);
        }
      }

      await client.query('COMMIT');
      console.log('✅ Transaction committed. Inserted:', insertedCount, 'contacts');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Contact upload error:', error);
      throw new Error('Failed to upload contacts: ' + error.message);
    } finally {
      client.release();
    }
  }


  static async searchContact(targetPhone, myPhone) {
    try {
      const query = `
        SELECT contact_name, COUNT(*) as frequency
        FROM contacts 
        WHERE contact_phone = $2 AND user_id = (
          SELECT id FROM users WHERE phone = $1
        )
        GROUP BY contact_name
        ORDER BY frequency DESC
      `;

      const result = await pool.query(query, [targetPhone, myPhone]);
      return result.rows;
    } catch (error) {
      console.error('Contact search error:', error);
      throw new Error('Failed to search contact: ' + error.message);
    }
  }


  static async getNameSavedBy(userPhone, targetPhone) {
    try {
      const query = `
        SELECT contact_name
        FROM contacts c
        JOIN users u ON c.user_id = u.id
        WHERE u.phone = $1 AND c.contact_phone = $2
        LIMIT 1
      `;
      const result = await pool.query(query, [userPhone, targetPhone]);
      return result.rows[0]?.contact_name || null;
    } catch (error) {
      console.error('getNameSavedBy error:', error);
      throw new Error('Failed to get name: ' + error.message);
    }
  }


  static async howAmISaved(myPhone, theirPhone) {
    try {
      const query = `
        SELECT contact_name
        FROM contacts
        JOIN users ON contacts.user_id = users.id
        WHERE users.phone = $1 AND contacts.contact_phone = $2
        LIMIT 1
      `;
      const result = await pool.query(query, [theirPhone, myPhone]);
      return result.rows[0]; // { contact_name: 'Abduaziz' } or undefined
    } catch (error) {
      console.error('HowAmISaved lookup error:', error);
      throw new Error('Failed to check how you are saved: ' + error.message);
    }
  }
}

module.exports = User;
