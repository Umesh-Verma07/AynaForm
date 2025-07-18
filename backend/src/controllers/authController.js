const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Joi schema for validating registration and login input
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(32).required(),
  password: Joi.string().min(6).max(128).required()
});

// Helper function to format Joi validation errors
const formatJoiErrors = (error) => {
  if (!error) return null;
  return error.details.map((d) => ({
    message: d.message,
    path: d.path,
    code: 'VALIDATION_ERROR'
  }));
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: formatJoiErrors(error),
        code: 'VALIDATION_ERROR'
      });
    }
    const { username, password } = req.body;
    // Check if username already exists
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'Username already exists', code: 'USERNAME_EXISTS' });
    // Hash the password
    const hashed = await bcrypt.hash(password, 10);
    // Create the user
    const user = await User.create({ username, password: hashed });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};

// Login an existing user
exports.login = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: formatJoiErrors(error),
        code: 'VALIDATION_ERROR'
      });
    }
    const { username, password } = req.body;
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}; 