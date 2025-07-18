const mongoose = require('mongoose');

// Schema for a single answer in a response
const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the question
  answer: { type: mongoose.Schema.Types.Mixed, required: true } // The answer value (string, number, etc.)
});

// Schema for the response itself
const responseSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true }, // Reference to the form
  answers: [answerSchema], // Array of answers
  submittedAt: { type: Date, default: Date.now } // Submission timestamp
});

module.exports = mongoose.model('Response', responseSchema); 