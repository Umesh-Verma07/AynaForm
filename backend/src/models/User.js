const mongoose = require('mongoose');

// Schema for a user
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 32 }, // Unique username
  password: { type: String, required: true }, // Hashed password
  createdAt: { type: Date, default: Date.now } // Account creation timestamp
});

module.exports = mongoose.model('User', userSchema); 