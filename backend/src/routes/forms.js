const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createForm,
  getForms,
  getForm,
  updateForm,
  deleteForm,
  submitResponse,
  getResponses,
  getSummary,
  exportCSV,
  deleteQuestionResponses
} = require('../controllers/formController');

// -------- Protected routes (require authentication) --------
// Create a new form
router.post('/', auth, createForm);
// Get all forms created by the user
router.get('/', auth, getForms);
// Update a form by ID
router.put('/:id', auth, updateForm);
// Delete a form by ID
router.delete('/:id', auth, deleteForm);
// Get all responses for a form
router.get('/:id/responses', auth, getResponses);
// Get a summary of responses for a form
router.get('/:id/summary', auth, getSummary);
// Export responses for a form as CSV
router.get('/:id/export', auth, exportCSV);
// Delete all responses for a specific question in a form
router.delete('/:id/questions/:questionId/responses', auth, deleteQuestionResponses);

// -------- Public routes (no authentication required) --------
// Get a form by ID (public)
router.get('/:id', getForm);
// Submit a response to a form (public)
router.post('/:id/responses', submitResponse);

module.exports = router; 