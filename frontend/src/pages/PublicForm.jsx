import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForm, submitResponse } from "../services/forms";
import { useAuth } from "../hooks/useAuth";

const PublicForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getForm(id)
      .then((res) => {
        setForm(res.data);
        setAnswers(res.data.questions.map(() => ""));
      })
      .catch(() => setError("Form not found"));
  }, [id]);

  const handleChange = (idx, value) => {
    setAnswers((a) => a.map((v, i) => (i === idx ? value : v)));
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 p-8 rounded shadow text-center transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Thank you for your feedback!</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!form) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (form.acceptingResponses === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 pt-20">
        <div className="bg-white dark:bg-[#232a47] rounded-2xl shadow-xl border-t-8 border-red-500 p-8 mb-3 mt-0 w-full max-w-xl flex flex-col items-center">
          <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Not Accepting Responses</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-2">This form is currently not accepting responses. Please check back later or contact the form owner for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 pt-20">
      {/* Title/Description Card */}
      <div className="bg-white dark:bg-[#232a47] rounded-2xl shadow-xl border-t-8 border-purple-500 p-8 mb-3 mt-0 w-full max-w-xl">
        <h2 className="w-full text-3xl font-extrabold text-gray-900 dark:text-white mb-2 break-words">{form.title}</h2>
        <div className="w-full text-gray-700 dark:text-gray-200 mb-2 break-words">{form.description || ""}</div>
      </div>
      {/* Questions */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto p-0">
        {form.questions.map((q, idx) => (
          <div key={q._id || idx} className="mb-3 bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center mb-2 gap-2">
              {q.required && <span className="text-red-500 mr-1">*</span>}
              <span className="font-semibold text-gray-900 dark:text-white text-lg break-words">{q.text}</span>
            </div>
            <div className="mb-4">
              {q.type === "text" ? (
                <input
                  type="text"
                  className="w-full border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent focus:ring-0 focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-2 pl-3"
                  value={answers[idx]}
                  onChange={e => handleChange(idx, e.target.value)}
                  required={q.required}
                  placeholder="Short-answer text"
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2 text-gray-900 dark:text-white pl-3">
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
          <div className="text-red-500 dark:text-red-300 mb-2 whitespace-pre-line">
            {error.split('\n').map((msg, i) => (
              <div key={i}>• {msg}</div>
            ))}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-xl mt-4 hover:bg-purple-700 dark:hover:bg-purple-400 text-lg font-bold shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PublicForm; 