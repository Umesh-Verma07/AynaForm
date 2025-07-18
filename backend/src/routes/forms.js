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

// Protected routes
router.post('/', auth, createForm);
router.get('/', auth, getForms);
router.put('/:id', auth, updateForm);
router.delete('/:id', auth, deleteForm);
router.get('/:id/responses', auth, getResponses);
router.get('/:id/summary', auth, getSummary);
router.get('/:id/export', auth, exportCSV);
router.delete('/:id/questions/:questionId/responses', auth, deleteQuestionResponses);

// Public routes
router.get('/:id', getForm);
router.post('/:id/responses', submitResponse);

module.exports = router; 