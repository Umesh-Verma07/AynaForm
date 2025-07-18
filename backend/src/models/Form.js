const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['text', 'mcq'], required: true },
  required: { type: Boolean, default: true },
  options: [{ type: String }] // Only for MCQ
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  acceptingResponses: { type: Boolean, default: true }
});

module.exports = mongoose.model('Form', formSchema); 