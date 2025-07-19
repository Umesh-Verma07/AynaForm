import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getForm, deleteForm, getResponses, updateForm } from "../services/forms";
import toast, { Toaster } from "react-hot-toast";
import FormBuilder from "./FormBuilder";
import { motion, AnimatePresence } from "framer-motion";

// Form details page for viewing and editing a form
const FormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // State
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, formId: null, formTitle: "" });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [responseCount, setResponseCount] = useState(0);
  const [acceptingResponsesModal, setAcceptingResponsesModal] = useState({ show: false, nextValue: true });

  // Load form and response count
  useEffect(() => {
    getForm(id)
      .then((res) => setForm(res.data))
      .catch(() => setError("Failed to load form details"));
    getResponses(id)
      .then((res) => setResponseCount(res.data.length))
      .catch(() => setResponseCount(0));
  }, [id]);

  // Delete handlers
  const handleDeleteClick = () => {
    setDeleteModal({ show: true, formId: id, formTitle: form?.title || "" });
    setDeleteConfirmText("");
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast.error("Please type 'delete' to confirm");
      return;
    }
    try {
      await deleteForm(id);
      toast.success("Form deleted successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError("Delete failed");
      toast.error("Delete failed");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, formId: null, formTitle: "" });
    setDeleteConfirmText("");
  };

  // Refresh form data
  const refreshForm = () => {
    getForm(id)
      .then((res) => setForm(res.data))
      .catch(() => setError("Failed to load form details"));
    getResponses(id)
      .then((res) => setResponseCount(res.data.length))
      .catch(() => setResponseCount(0));
  };

  // Accepting responses toggle
  const handleToggleAcceptingResponses = () => {
    setAcceptingResponsesModal({ show: true, nextValue: !form.acceptingResponses });
  };
  const handleAcceptingResponsesConfirm = async () => {
    try {
      await updateForm(id, { ...form, acceptingResponses: acceptingResponsesModal.nextValue });
      toast.success(
        acceptingResponsesModal.nextValue ? "Form is now accepting responses." : "Form is no longer accepting responses."
      );
      setAcceptingResponsesModal({ show: false, nextValue: true });
      refreshForm();
    } catch {
      toast.error("Failed to update accepting responses.");
      setAcceptingResponsesModal({ show: false, nextValue: true });
    }
  };
  const handleAcceptingResponsesCancel = () => {
    setAcceptingResponsesModal({ show: false, nextValue: true });
  };

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-[#181c2f] dark:via-[#232a47] dark:to-[#2d1e3a] transition-colors duration-500 px-4">
        <div className="mt-16 text-gray-700 dark:text-gray-200 text-center">{error || "Loading..."}</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-[#181c2f] dark:via-[#232a47] dark:to-[#2d1e3a] transition-colors duration-500 py-8 pt-20 px-4">
        {/* Action buttons */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-3 justify-end">
          {/* Accepting Responses Toggle */}
          <button
            type="button"
            onClick={async () => {
              try {
                await updateForm(id, {
                  title: form.title,
                  description: form.description,
                  questions: form.questions,
                  acceptingResponses: !form.acceptingResponses
                });
                toast.success(!form.acceptingResponses ? "Form is now accepting responses." : "Form is no longer accepting responses.");
                refreshForm();
              } catch {
                toast.error("Failed to update accepting responses.");
              }
            }}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded shadow text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${form.acceptingResponses ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'}`}
            aria-pressed={form.acceptingResponses}
            aria-label="Toggle accepting responses"
          >
            <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${form.acceptingResponses ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {form.acceptingResponses ? 'Accepting Responses' : 'Not Accepting Responses'}
          </button>
          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            className="bg-red-600 dark:bg-red-500 text-white px-3 sm:px-4 py-2 rounded shadow hover:bg-red-700 dark:hover:bg-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 text-xs sm:text-sm font-medium"
          >
            Delete
          </button>
          <button
            onClick={() => navigate(`/forms/${form._id}/responses`)}
            className="bg-green-600 dark:bg-green-500 text-white px-3 sm:px-4 py-2 rounded shadow hover:bg-green-700 dark:hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 text-xs sm:text-sm font-medium relative"
          >
            Responses
            {responseCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-purple-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow">
                {responseCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/forms/${form._id}`);
              toast.success('Public link copied!');
            }}
            className="border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-3 sm:px-4 py-2 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs sm:text-sm font-medium"
            type="button"
          >
            Copy Public Link
          </button>
        </div>
        {/* Edit Form */}
        <div className="w-full max-w-2xl">
          <FormBuilder editMode onUpdate={refreshForm} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Form
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteModal.formTitle}"</span>?
                </p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mb-4">
                  This action cannot be undone. All form data and responses will be permanently deleted.
                </p>
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type "delete" to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-sm"
                    placeholder="Type 'delete' here"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleteConfirmText.toLowerCase() !== "delete"}
                    className="flex-1 px-3 sm:px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Accepting Responses Confirmation Modal */}
      <AnimatePresence>
        {acceptingResponsesModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {acceptingResponsesModal.nextValue ? 'Accept Responses?' : 'Stop Accepting Responses?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                  {acceptingResponsesModal.nextValue
                    ? 'Users will be able to submit responses to this form.'
                    : 'Users will NOT be able to submit responses to this form.'}
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleAcceptingResponsesCancel}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptingResponsesConfirm}
                    className={`flex-1 px-3 sm:px-4 py-2 ${acceptingResponsesModal.nextValue ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500'} text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base`}
                  >
                    {acceptingResponsesModal.nextValue ? 'Accept Responses' : 'Stop Accepting'}
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

export default FormDetails; 