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
  const schema = Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateContactsUpload = (req, res, next) => {
  const schema = Joi.object({
    contacts: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
      })
    ).min(1).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateContactSearch,
  validateContactsUpload
}; 