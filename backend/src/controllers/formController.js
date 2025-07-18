const Form = require('../models/Form');
const Response = require('../models/Response');
const csvExport = require('../utils/csvExport');
const Joi = require('joi');

const formSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(''),
  questions: Joi.array().items(
    Joi.object({
      text: Joi.string().min(1).required(),
      type: Joi.string().valid('text', 'mcq').required(),
      required: Joi.boolean().default(true),
      options: Joi.alternatives().conditional('type', {
        is: 'mcq',
        then: Joi.array().items(Joi.string().min(1)).min(2).required(),
        otherwise: Joi.array().items(Joi.string().min(1)).optional().allow(null)
      })
    }).unknown(true) // <-- allow unknown keys like _id
  ).min(1).max(5).required(),
  acceptingResponses: Joi.boolean().optional()
});

const formatJoiErrors = (error) => {
  if (!error) return null;
  return error.details.map((d) => ({
    message: d.message,
    path: d.path,
    code: 'VALIDATION_ERROR'
  }));
};

exports.createForm = async (req, res, next) => {
  try {
    if (Array.isArray(req.body.questions)) {
      req.body.questions = req.body.questions.map(q => {
        const { _id, ...rest } = q;
        return rest;
      });
    }
    const { error } = formSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: formatJoiErrors(error),
        code: 'VALIDATION_ERROR'
      });
    }
    const form = await Form.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(form);
  } catch (err) {
    console.error('Create Form Error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};

exports.getForms = async (req, res, next) => {
  try {
    const forms = await Form.find({ createdBy: req.user.id });
    res.json(forms);
  } catch (err) {
    next(err);
  }
};

exports.getForm = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    next(err);
  }
};

exports.updateForm = async (req, res, next) => {
  try {
    // For update, preserve _id for existing questions, assign new _id for new questions
    if (Array.isArray(req.body.questions)) {
      req.body.questions = req.body.questions.map(q => {
        if (q._id) {
          // Existing question, preserve _id
          return q;
        } else {
          // New question, assign new _id
          return { ...q, _id: new (require('mongoose').Types.ObjectId)() };
        }
      });
    }
    const { error } = formSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: formatJoiErrors(error),
        code: 'VALIDATION_ERROR'
      });
    }
    // Get the old form before update
    const oldForm = await Form.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!oldForm) return res.status(404).json({ error: 'Form not found or unauthorized', code: 'NOT_FOUND' });
    // Save the update
    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    // Find deleted questions (by _id)
    const oldIds = (oldForm.questions || []).map(q => q._id?.toString()).filter(Boolean);
    // Only consider questions with _id in the new form (i.e., existing questions)
    const newIds = (req.body.questions || []).map(q => q._id).filter(Boolean).map(id => id.toString());
    const deletedIds = oldIds.filter(id => !newIds.includes(id));
    if (deletedIds.length > 0) {
      // Remove answers for deleted questions from all responses for this form
      await Response.updateMany(
        { form: req.params.id },
        { $pull: { answers: { questionId: { $in: deletedIds } } } }
      );
    }
    res.json(form);
  } catch (err) {
    console.error('Update Form Error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};

exports.deleteForm = async (req, res, next) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!form) return res.status(404).json({ error: 'Form not found or unauthorized' });
    await Response.deleteMany({ form: form._id });
    res.json({ message: 'Form and responses deleted' });
  } catch (err) {
    next(err);
  }
};

exports.submitResponse = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // Validate answers
    if (!Array.isArray(req.body.answers) || req.body.answers.length !== form.questions.length) {
      return res.status(400).json({ error: 'Invalid answers' });
    }

    // Optionally, add more validation per question type

    const response = await Response.create({
      form: form._id,
      answers: req.body.answers
    });
    res.status(201).json({ message: 'Response submitted' });
  } catch (err) {
    next(err);
  }
};

exports.getResponses = async (req, res, next) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!form) return res.status(404).json({ error: 'Form not found or unauthorized' });

    const responses = await Response.find({ form: form._id });
    res.json(responses);
  } catch (err) {
    next(err);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!form) return res.status(404).json({ error: 'Form not found or unauthorized' });

    const responses = await Response.find({ form: form._id });
    // Simple summary: count answers per question
    const summary = form.questions.map((q, idx) => {
      if (q.type === 'mcq') {
        const counts = {};
        q.options.forEach(opt => { counts[opt] = 0; });
        responses.forEach(r => {
          const ans = r.answers[idx]?.answer;
          if (counts[ans] !== undefined) counts[ans]++;
        });
        return { question: q.text, type: q.type, counts };
      } else {
        return { question: q.text, type: q.type, answers: responses.map(r => r.answers[idx]?.answer) };
      }
    });
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!form) return res.status(404).json({ error: 'Form not found or unauthorized' });

    const responses = await Response.find({ form: form._id });
    const csv = csvExport(form, responses);

    res.header('Content-Type', 'text/csv');
    res.attachment(`form_${form._id}_responses.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// Remove all answers for a specific question from all responses for a form
exports.deleteQuestionResponses = async (req, res, next) => {
  try {
    const { id: formId, questionId } = req.params;
    // Only allow if user owns the form
    const form = await Form.findOne({ _id: formId, createdBy: req.user.id });
    if (!form) return res.status(404).json({ error: 'Form not found or unauthorized' });
    // Remove the answer with questionId from all responses for this form
    await Response.updateMany(
      { form: formId },
      { $pull: { answers: { questionId: questionId } } }
    );
    res.json({ message: 'Responses for question deleted' });
  } catch (err) {
    next(err);
  }
}; 