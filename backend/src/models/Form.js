const mongoose = require('mongoose');

// Schema for a single question in a form
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true }, // The question text
  type: { type: String, enum: ['text', 'mcq'], required: true }, // Question type: text or multiple choice
  required: { type: Boolean, default: true }, // Whether answering is required
  options: [{ type: String }] // Options for MCQ questions
});

// Schema for the form itself
const formSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Form title
  description: String, // Optional description
  questions: [questionSchema], // Array of questions
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to creator
  createdAt: { type: Date, default: Date.now }, // Creation timestamp
  acceptingResponses: { type: Boolean, default: true } // Whether form is open for responses
});

module.exports = mongoose.model('Form', formSchema); 