import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getForms, deleteForm } from "../services/forms";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Dashboard page: shows user's forms and allows creation/deletion
const Dashboard = () => {
  // State for forms, error messages, and delete modal
  const [forms, setForms] = useState([]);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, formId: null, formTitle: "" });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const navigate = useNavigate();

  // Fetch forms from API
  const fetchForms = async () => {
    try {
      const res = await getForms();
      setForms(res.data);
    } catch (err) {
      setError("Failed to load forms");
    }
  };

  // Load forms on mount
  useEffect(() => {
    fetchForms();
  }, []);

  // Show delete confirmation modal
  const handleDeleteClick = (form) => {
    setDeleteModal({ show: true, formId: form._id, formTitle: form.title });
    setDeleteConfirmText("");
  };

  // Confirm and delete a form
  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast.error("Please type 'delete' to confirm");
      return;
    }

    try {
      await deleteForm(deleteModal.formId);
      setForms(forms.filter((f) => f._id !== deleteModal.formId));
      toast.success("Form deleted successfully!");
      setDeleteModal({ show: false, formId: null, formTitle: "" });
      setDeleteConfirmText("");
    } catch (err) {
      setError("Delete failed");
      toast.error("Delete failed");
    }
  };

  // Cancel delete modal
  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, formId: null, formTitle: "" });
    setDeleteConfirmText("");
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto mt-8 px-2 sm:px-4 md:px-6 pt-20">
        {/* Header and new form button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 text-center sm:text-left dark:bg-gradient-to-r dark:from-blue-300 dark:to-purple-400">
            Your Forms
          </h1>
          <Link
            to="/forms/new"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-500 dark:from-blue-400 dark:to-purple-600 text-white px-4 py-2 rounded shadow-lg hover:scale-105 transition-transform duration-200 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            New Form
          </Link>
        </div>
        {/* Error message */}
        {error && <div className="text-red-500 mb-2 dark:text-red-300">{error}</div>}
        {/* Empty state */}
        {forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/80 dark:bg-[#232a47]/80 rounded-2xl shadow-lg mt-10">
            <svg className="w-20 h-20 text-purple-400 mb-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">You haven't created any form yet</h2>
            <p className="text-gray-500 dark:text-gray-300 mb-6 text-center max-w-md">Start by creating your first form to collect feedback, run surveys, or gather information easily.</p>
            <Link
              to="/forms/new"
              className="bg-gradient-to-r from-blue-600 to-purple-500 dark:from-blue-400 dark:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              + Create New Form
            </Link>
          </div>
        ) : (
          // List of forms
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {forms.map((form) => (
              <div
                key={form._id}
                className="cursor-pointer bg-white dark:bg-[#232a47] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200 hover:scale-105 hover:shadow-lg relative min-w-[240px] max-w-[280px] w-full"
                onClick={() => navigate(`/forms/${form._id}/details`)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/forms/${form._id}/details`); }}
                title={form.title}
              >
                {/* Accent bar */}
                <div className="h-2 w-full rounded-t-2xl bg-purple-500 mb-3" />
                <div className="px-4 pb-4 pt-1 flex-1 flex flex-col">
                  <div className="font-bold text-lg truncate mb-2" title={form.title}>{form.title}</div>
                  <div className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-4">{form.description || 'No description'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto">Created: {new Date(form.createdAt).toLocaleDateString()}</div>
                </div>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(form);
                  }}
                  className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  title="Delete form"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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
                  Delete Form
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteModal.formTitle}"</span>?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  This action cannot be undone. All form data and responses will be permanently deleted.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type "delete" to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Type 'delete' here"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
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

export default Dashboard; 