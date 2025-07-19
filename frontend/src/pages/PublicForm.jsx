import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForm, submitResponse } from "../services/forms";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const PublicForm = () => {
  const { id } = useParams();
  // State
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

  // Load form data
  useEffect(() => {
    getForm(id)
      .then((res) => {
        setForm(res.data);
        setAnswers(res.data.questions.map(() => ""));
      })
      .catch(() => setError("Form not found"));
  }, [id]);

  // Handle answer changes
  const handleChange = (idx, value) => {
    setAnswers((a) => a.map((v, i) => (i === idx ? value : v)));
  };

  // Submit form response
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await submitResponse(id, form.questions.map((q, idx) => ({
        questionId: q._id,
        answer: answers[idx]
      })));
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
    }
  };

  const { isAuthenticated } = useAuth();

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 px-4">
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded shadow text-center transition-colors duration-300 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">Thank you for your feedback!</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8 px-4">{error}</div>;
  }

  if (!form) {
    return <div className="text-center mt-8 px-4">Loading...</div>;
  }

  if (form.acceptingResponses === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 pt-20 px-4">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 rounded-full p-2 sm:p-3 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors backdrop-blur-lg"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M7.05 4.93l-.71-.71M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          )}
        </button>

        <div className="bg-white dark:bg-[#232a47] rounded-2xl shadow-xl border-t-8 border-red-500 p-6 sm:p-8 mb-3 mt-0 w-full max-w-xl flex flex-col items-center">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Not Accepting Responses</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-2 text-sm sm:text-base">This form is currently not accepting responses. Please check back later or contact the form owner for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 pt-20 px-4">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-full p-2 sm:p-3 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors backdrop-blur-lg"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M7.05 4.93l-.71-.71M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        )}
      </button>

      {/* Title/Description Card */}
      <div className="bg-white dark:bg-[#232a47] rounded-2xl shadow-xl border-t-8 border-purple-500 p-6 sm:p-8 mb-3 mt-0 w-full max-w-xl">
        <h2 className="w-full text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 break-words">{form.title}</h2>
        <div className="w-full text-gray-700 dark:text-gray-200 mb-2 break-words text-sm sm:text-base">{form.description || ""}</div>
      </div>
      {/* Questions */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto p-0">
        {form.questions.map((q, idx) => (
          <div key={q._id || idx} className="mb-3 bg-white dark:bg-gray-900 rounded-2xl shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center mb-2 gap-2">
              {q.required && <span className="text-red-500 mr-1">*</span>}
              <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg break-words">{q.text}</span>
            </div>
            <div className="mb-4">
              {q.type === "text" ? (
                <input
                  type="text"
                  className="w-full border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent focus:ring-0 focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-2 pl-3 text-base"
                  value={answers[idx]}
                  onChange={e => handleChange(idx, e.target.value)}
                  required={q.required}
                  placeholder="Short-answer text"
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2 text-gray-900 dark:text-white pl-3 text-sm sm:text-base">
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={opt}
                        checked={answers[idx] === opt}
                        onChange={e => handleChange(idx, opt)}
                        required={q.required}
                        className="accent-purple-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="text-red-500 dark:text-red-300 mb-2 whitespace-pre-line text-sm">
            {error.split('\n').map((msg, i) => (
              <div key={i}> {msg}</div>
            ))}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-xl mt-4 hover:bg-purple-700 dark:hover:bg-purple-400 text-base sm:text-lg font-bold shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PublicForm; 