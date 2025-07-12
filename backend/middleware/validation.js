const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateContactSearch = (req, res, next) => {
  console.log('🔍 Validating contact search:', req.body);
  
  const { phoneNumber, myPhone } = req.body;

  const isValidPhone = (phone) =>
    typeof phone === 'string' && /^\+?[0-9]{9,15}$/.test(phone);

  if (!phoneNumber || !isValidPhone(phoneNumber)) {
    console.log('❌ Invalid phoneNumber:', phoneNumber);
    return res.status(400).json({ error: 'Invalid phoneNumber' });
  }

  if (!myPhone || !isValidPhone(myPhone)) {
    console.log('❌ Invalid myPhone:', myPhone);
    return res.status(400).json({ error: 'Invalid myPhone' });
  }

  console.log('✅ Contact search validation passed');
  next();
};

const validateContactsUpload = (req, res, next) => {
  console.log('📱 Validating contact upload:', req.body?.contacts?.length || 0, 'contacts');
  
  const { contacts } = req.body;
  
  if (!Array.isArray(contacts) || contacts.length === 0) {
    console.log('❌ Invalid contacts array');
    return res.status(400).json({ error: 'Contacts must be a non-empty array' });
  }

  // Validate each contact has required fields
  for (let i = 0; i < Math.min(contacts.length, 5); i++) { // Check first 5 for performance
    const contact = contacts[i];
    if (!contact.name || !contact.phone) {
      console.log('❌ Invalid contact at index:', i, contact);
      return res.status(400).json({ error: `Contact at index ${i} missing name or phone` });
    }
  }

  console.log('✅ Contact upload validation passed for', contacts.length, 'contacts');
  next();
};

// Export all validation functions
module.exports = {
  validateRegistration,
  validateLogin,
  validateContactSearch,
  validateContactsUpload
};