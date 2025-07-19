import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForm, getResponses, exportCSV } from "../services/forms";

const PAGE_SIZE = 15;

// Page to view and export form responses
const FormResponses = () => {
  const { id } = useParams();
  // State
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("summary");
  const [filterText, setFilterText] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Load form and responses
  useEffect(() => {
    getForm(id).then((res) => setForm(res.data));
    getResponses(id)
      .then((res) => setResponses(res.data))
      .catch(() => setError("Failed to load responses"));
  }, [id]);

  // Toggle row expansion
  const toggleRowExpansion = (rowIndex) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
  };

  // Check if row has truncated content
  const hasTruncatedContent = (resp) => {
    return resp.answers.some(answer => {
      const answerText = answer.answer || "-";
      return answerText.length > 50; // Adjust threshold as needed
    });
  };

  // Filter responses based on search text
  const filteredResponses = responses.filter(response => {
    if (!filterText.trim()) return true;
    const searchTerm = filterText.toLowerCase();
    const answerMatch = response.answers.some(answer => 
      answer.answer.toLowerCase().includes(searchTerm)
    );
    const questionMatch = form?.questions.some(question => 
      question.text.toLowerCase().includes(searchTerm)
    );
    const dateMatch = new Date(response.submittedAt)
      .toLocaleString()
      .toLowerCase()
      .includes(searchTerm);
    return answerMatch || questionMatch || dateMatch;
  });

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterText]);

  // Export responses as CSV
  const handleExport = async () => {
    try {
      const res = await exportCSV(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const fileName = form?.title 
        ? `${form.title.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}_responses.csv`
        : `form_${id}_responses.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Export failed");
    }
  };

  // Calculate statistics for MCQ questions
  const getQuestionStats = (question) => {
    if (question.type !== 'mcq') return null;
    
    const optionCounts = {};
    let totalResponses = 0;
    
    responses.forEach(response => {
      const answer = response.answers.find(a => a.questionId === question._id)?.answer || 
                   response.answers[form.questions.indexOf(question)]?.answer;
      if (answer) {
        optionCounts[answer] = (optionCounts[answer] || 0) + 1;
        totalResponses++;
      }
    });
    
    return {
      optionCounts,
      totalResponses,
      percentages: Object.keys(optionCounts).reduce((acc, option) => {
        acc[option] = ((optionCounts[option] / totalResponses) * 100).toFixed(1);
        return acc;
      }, {})
    };
  };

  // Calculate unique answers for text questions
  const getTextQuestionStats = (question) => {
    const answerCounts = {};
    let totalResponses = 0;
    
    responses.forEach(response => {
      const answer = response.answers.find(a => a.questionId === question._id)?.answer || 
                   response.answers[form.questions.indexOf(question)]?.answer;
      if (answer && answer.trim() !== '') {
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        totalResponses++;
      }
    });
    
    return {
      answerCounts,
      totalResponses,
      percentages: Object.keys(answerCounts).reduce((acc, answer) => {
        acc[answer] = ((answerCounts[answer] / totalResponses) * 100).toFixed(1);
        return acc;
      }, {})
    };
  };

  // Generate colors for pie chart
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const paginated = filteredResponses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="max-w-4xl mx-auto mt-8 px-4 pt-20">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div className="w-full sm:w-[40rem] flex-shrink-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words line-clamp-3 leading-tight">
              {form?.title || "Form Responses"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              {responses.length} responses
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={handleExport}
              className="bg-green-600 dark:bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 whitespace-nowrap text-sm sm:text-base"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("summary")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 text-sm sm:text-base ${
              viewMode === "summary"
                ? "bg-purple-600 dark:bg-purple-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 text-sm sm:text-base ${
              viewMode === "table"
                ? "bg-purple-600 dark:bg-purple-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Table
          </button>
        </div>

        {error && <div className="text-red-500 dark:text-red-300 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">{error}</div>}

        {/* Responses Display */}
        <div className="bg-white dark:bg-[#232a47] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full max-w-6xl mx-auto">
          {form && responses.length > 0 ? (
            viewMode === "summary" ? (
              // Summary View (current detailed view)
              <div className="w-full">
                <div className="space-y-6 sm:space-y-8 w-full">
                  {/* Question Summary Cards */}
                  {form.questions.map((question, qIdx) => {
                    const stats = getQuestionStats(question);
                    return (
                      <div key={qIdx} className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8 last:border-b-0 w-full">
                        <div className="flex justify-between items-start mb-4 w-full">
                          <div className="w-full">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {question.text}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                              {responses.length} responses
                            </p>
                          </div>
                        </div>
                        
                        {question.type === 'mcq' && stats ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                            {/* Pie Chart Visualization */}
                            <div className="flex justify-center">
                              <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                                <svg width="192" height="192" viewBox="0 0 256 256" className="transform -rotate-90 sm:w-64 sm:h-64">
                                  {(() => {
                                    const radius = 100;
                                    const circumference = 2 * Math.PI * radius;
                                    const totalResponses = stats.totalResponses;
                                    let currentOffset = 0;
                                    
                                    return Object.entries(stats.optionCounts).map(([option, count], index) => {
                                      const percentage = (count / totalResponses) * 100;
                                      const segmentLength = (percentage / 100) * circumference;
                                      const strokeDasharray = `${segmentLength} ${circumference}`;
                                      
                                      const circle = (
                                        <circle
                                          key={option}
                                          cx="128"
                                          cy="128"
                                          r={radius}
                                          fill="none"
                                          stroke={COLORS[index % COLORS.length]}
                                          strokeWidth="40"
                                          strokeDasharray={strokeDasharray}
                                          strokeDashoffset={currentOffset}
                                          className="transition-all duration-300"
                                        />
                                      );
                                      
                                      currentOffset -= segmentLength;
                                      return circle;
                                    });
                                  })()}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                      {stats.totalResponses}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                      responses
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Legend and Statistics */}
                            <div className="space-y-2 sm:space-y-3 w-full">
                              {Object.entries(stats.optionCounts).map(([option, count], index) => (
                                <div key={option} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div 
                                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                                      {option}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                      {count}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                      {stats.percentages[option]}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Text question statistics
                          <div className="space-y-3">
                            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                              {responses.length} text responses
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                              {(() => {
                                const textStats = getTextQuestionStats(question);
                                return Object.entries(textStats.answerCounts)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 10)
                                  .map(([answer, count]) => (
                                    <div key={answer} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                      <span className="text-gray-900 dark:text-white text-sm sm:text-base flex-1 mr-2">
                                        {answer}
                                      </span>
                                      <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">
                                        {count}
                                      </span>
                                    </div>
                                  ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Table View
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">#</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                      {form.questions.map((q, idx) => (
                        <th key={idx} className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white max-w-[200px]">
                          {q.text}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((response, idx) => (
                      <tr key={response._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-400">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </td>
                        {form.questions.map((q, qIdx) => {
                          const answer = response.answers.find(a => a.questionId === q._id)?.answer || 
                                       response.answers[qIdx]?.answer || '';
                          const isTruncated = hasTruncatedContent(response);
                          
                          return (
                            <td key={qIdx} className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 dark:text-white">
                              <div className="max-w-[200px]">
                                {isTruncated && expandedRows.includes(idx) ? (
                                  <div>
                                    <div className="whitespace-pre-wrap">{answer}</div>
                                    <button
                                      onClick={() => toggleRowExpansion(idx)}
                                      className="text-purple-600 dark:text-purple-400 hover:underline text-xs sm:text-sm mt-1"
                                    >
                                      Show less
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="truncate">{answer}</div>
                                    {isTruncated && (
                                      <button
                                        onClick={() => toggleRowExpansion(idx)}
                                        className="text-purple-600 dark:text-purple-400 hover:underline text-xs sm:text-sm mt-1"
                                      >
                                        Show more
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                No responses yet
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {viewMode === "table" && filteredResponses.length > PAGE_SIZE && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm sm:text-base"
            >
              Previous
            </button>
            <span className="px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              Page {page} of {Math.ceil(filteredResponses.length / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(filteredResponses.length / PAGE_SIZE), p + 1))}
              disabled={page === Math.ceil(filteredResponses.length / PAGE_SIZE)}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default FormResponses; 