import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createForm, getForm, updateForm, deleteQuestionResponses } from "../services/forms";
import Navbar from "../components/Navbar";
import { FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from "react-hot-toast";

const defaultQuestion = { text: "", type: "text", options: [], required: true };

// Form builder page for creating and editing forms
const FormBuilder = ({ editMode, onUpdate }) => {
  // State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([ { ...defaultQuestion } ]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const [deleteModal, setDeleteModal] = useState({ show: false, questionIdx: null, questionText: '' });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [acceptingResponses, setAcceptingResponses] = useState(true);

  // Load form data if editing
  useEffect(() => {
    if (editMode && id) {
      getForm(id)
        .then((res) => {
          setTitle(res.data.title);
          setDescription(res.data.description || "");
          setQuestions(res.data.questions);
          setAcceptingResponses(res.data.acceptingResponses !== false); // default to true if undefined
        })
        .catch(() => setError("Failed to load form"));
    }
  }, [editMode, id]);

  // Handlers for question and option changes
  const handleQuestionChange = (idx, field, value) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === idx
          ? { ...q, [field]: value, ...(field === "type" && value === "mcq" ? { options: ["", ""] } : {}) }
          : q
      )
    );
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q;
        let newOptions = [...q.options];
        while (newOptions.length <= oIdx) {
          newOptions.push("");
        }
        newOptions[oIdx] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  // Add/remove questions and options
  const addQuestion = () => {
    if (questions.length < 5) setQuestions([...questions, { ...defaultQuestion }]);
  };

  const removeQuestion = (idx) => {
    setDeleteModal({ show: true, questionIdx: idx, questionText: questions[idx].text });
    setDeleteConfirmText("");
  };

  const handleDeleteQuestionConfirm = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") return;
    let questionId = questions[deleteModal.questionIdx]?._id;
    setQuestions(qs => qs.filter((_, i) => i !== deleteModal.questionIdx));
    if (editMode && id && questionId) {
      try {
        await deleteQuestionResponses(id, questionId);
        toast.success("Responses for this question deleted.");
      } catch (err) {
        toast.error("Failed to delete responses for this question.");
      }
    }
    setDeleteModal({ show: false, questionIdx: null, questionText: '' });
    setDeleteConfirmText("");
  };

  const handleDeleteQuestionCancel = () => {
    setDeleteModal({ show: false, questionIdx: null, questionText: '' });
    setDeleteConfirmText("");
  };

  const addOption = (qIdx) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  const removeOption = (qIdx, oIdx) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i === qIdx) {
          const newOptions = q.options.filter((_, j) => j !== oIdx);
          if (newOptions.length === 0 || newOptions[newOptions.length - 1].trim() !== "") {
            newOptions.push("");
          }
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Form submission
  const hasEmptyOption = questions.some(
    q => q.type === "mcq" &&
      q.options.slice(0, -1).some(opt => !opt.trim())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (hasEmptyOption) {
      setError("All MCQ options must be filled in and not empty.");
      return;
    }
    try {
      let questionsToSend = questions.map(q => {
        const { _id, ...rest } = q;
        let options = q.options;
        if (q.type === "mcq") {
          if (options.length && !options[options.length - 1].trim()) {
            options = options.slice(0, -1);
          }
          options = options.filter(opt => opt.trim() !== "");
        }
        return _id ? { ...rest, _id, options } : { ...rest, options };
      });
      const data = { title, description, questions: questionsToSend, acceptingResponses };
      if (editMode) {
        await updateForm(id, data);
        toast.success("Form updated successfully!");
        if (onUpdate) onUpdate();
      } else {
        await createForm(data);
        toast.success("Form created successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        setError(backendErrors.map(e => e.message).join("\n"));
      } else {
        setError(err.response?.data?.error || "Save failed");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen flex flex-col items-center py-8 ${editMode ? 'pt-0' : 'pt-20'}`}>
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-0">
          {/* Form title and description */}
          <div className="bg-white dark:bg-[#232a47] rounded-2xl shadow-xl border-t-8 border-purple-500 p-8 mb-3 mt-0">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Form Title"
              className="w-full text-3xl font-extrabold text-gray-900 dark:text-white mb-2 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
              maxLength={100}
              required
              aria-label="Form Title"
            />
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full text-gray-700 dark:text-gray-200 mb-2 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
              maxLength={300}
              aria-label="Form Description"
            />
          </div>
          {error && (
            <div className="text-red-500 dark:text-red-300 mb-2 whitespace-pre-line">
              {error.split('\n').map((msg, i) => (
                <div key={i}> {msg}</div>
              ))}
            </div>
          )}
          {/* Questions */}
          {questions.map((q, idx) => (
            <div key={idx} className="mb-3 bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center mb-2 gap-2 flex-wrap">
                {q.required && <span className="text-red-500 mr-1">*</span>}
                <input
                  type="text"
                  value={q.text}
                  onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
                  placeholder={`Question ${idx + 1}`}
                  className="font-semibold text-gray-900 dark:text-white text-lg bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 flex-1 min-w-[120px]"
                  maxLength={200}
                  required={q.required}
                  aria-label={`Question ${idx + 1} Title`}
                />
                <select
                  className="w-44 p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 ml-2"
                  value={q.type}
                  onChange={e => handleQuestionChange(idx, 'type', e.target.value)}
                  aria-label="Question Type"
                >
                  <option value="text">Short Answer</option>
                  <option value="mcq">Multiple Choice</option>
                </select>
                {/* Delete Icon */}
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(idx)} className="ml-2 p-1 text-red-500 hover:text-red-700 focus:outline-none" title="Delete"><FaTrash /></button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
                {/* Answer Preview */}
                {q.type === 'text' && (
                  <input type="text" disabled placeholder="Short-answer text" className="w-full border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent focus:ring-0 focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-2" />
                )}
                {q.type === 'mcq' && (
                  <div className="flex flex-col gap-2 w-full mt-2">
                    {(() => {
                      let options = q.options ? [...q.options] : [""];
                      options = options.filter(opt => opt.trim() !== "");
                      options.push("");
                      return options.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <input type="radio" disabled className="accent-purple-500" />
                          <input
                            type="text"
                            value={opt}
                            placeholder={oIdx === options.length - 1 ? 'Add option' : `Option ${oIdx + 1}`}
                            onChange={e => {
                              handleOptionChange(idx, oIdx, e.target.value);
                            }}
                            className="flex-1 p-2 border-0 border-b-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                            aria-label={`Option ${oIdx + 1}`}
                          />
                          {options.length > 2 && oIdx < options.length - 1 && (
                            <button type="button" onClick={() => removeOption(idx, oIdx)} className="ml-2 text-red-500 hover:underline" title="Remove Option">Remove</button>
                          )}
                        </label>
                      ));
                    })()}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end mt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-gray-700 dark:text-gray-200 text-sm">Required</span>
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={e => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, required: e.target.checked } : qq))}
                    className="sr-only"
                    aria-label="Toggle required"
                  />
                  <span className={`w-10 h-6 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 duration-300 ease-in-out ${q.required ? 'bg-purple-500' : ''}`}>
                    <span className={`bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${q.required ? 'translate-x-4' : ''}`}></span>
                  </span>
                </label>
              </div>
            </div>
          ))}
          {/* Add Question Button */}
          {questions.length < 5 && (
            <button type="button" onClick={addQuestion} className="w-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-4 py-2 rounded shadow hover:bg-purple-200 dark:hover:bg-purple-800 font-semibold mb-2 mt-2" aria-label="Add Question">+ Add Question</button>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-xl mt-4 hover:bg-purple-700 dark:hover:bg-purple-400 text-lg font-bold shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={hasEmptyOption}
            aria-label={editMode ? 'Update Form' : 'Create Form'}
          >
            {editMode ? 'Update' : 'Create'} Form
          </button>
        </form>
      </div>
      {/* Delete Question Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Question
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteModal.questionText || `Question ${deleteModal.questionIdx + 1}`}"</span>?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  This action cannot be undone. All responses for this question will be permanently deleted.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type "delete" to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Type 'delete' here"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteQuestionCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteQuestionConfirm}
                    disabled={deleteConfirmText.toLowerCase() !== "delete"}
                    className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FormBuilder; 