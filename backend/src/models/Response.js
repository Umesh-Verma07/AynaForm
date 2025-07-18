const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: mongoose.Schema.Types.Mixed, required: true }
});

const responseSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  answers: [answerSchema],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', responseSchema); 