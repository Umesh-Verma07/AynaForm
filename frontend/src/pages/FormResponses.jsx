import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForm, getResponses, exportCSV } from "../services/forms";
import Navbar from "../components/Navbar";

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
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 px-2 sm:px-4 md:px-6 pt-20">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="w-[40rem] flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words line-clamp-3 leading-tight">
              {form?.title || "Form Responses"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {responses.length} responses
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleExport}
              className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("summary")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 ${
              viewMode === "summary"
                ? "bg-purple-600 dark:bg-purple-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 ${
              viewMode === "table"
                ? "bg-purple-600 dark:bg-purple-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Table
          </button>
        </div>

        {error && <div className="text-red-500 dark:text-red-300 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}

        {/* Responses Display */}
        <div className="bg-white dark:bg-[#232a47] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-6xl mx-auto">
          {form && responses.length > 0 ? (
            viewMode === "summary" ? (
              // Summary View (current detailed view)
              <div className="w-full">
                <div className="space-y-8 w-full">
                  {/* Question Summary Cards */}
                  {form.questions.map((question, qIdx) => {
                    const stats = getQuestionStats(question);
                    return (
                      <div key={qIdx} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0 w-full">
                        <div className="flex justify-between items-start mb-4 w-full">
                          <div className="w-full">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {question.text}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {responses.length} responses
                            </p>
                          </div>
                        </div>
                        
                        {question.type === 'mcq' && stats ? (
                          <div className="grid md:grid-cols-2 gap-6 w-full">
                            {/* Pie Chart Visualization */}
                            <div className="flex justify-center">
                              <div className="relative w-64 h-64">
                                <svg width="256" height="256" viewBox="0 0 256 256" className="transform -rotate-90">
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
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                      {stats.totalResponses}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      responses
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Legend and Statistics */}
                            <div className="space-y-3 w-full">
                              {Object.entries(stats.optionCounts).map(([option, count], index) => (
                                <div key={option} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-4 h-4 rounded-full" 
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                      {option}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {count}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      {stats.percentages[option]}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* Text Question Responses */
                          <div className="space-y-3 w-full">
                            {(() => {
                              const textStats = getTextQuestionStats(question);
                              const uniqueAnswers = Object.entries(textStats.answerCounts);
                              
                              if (uniqueAnswers.length === 0) {
                                return (
                                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No responses for this question
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="space-y-3">
                                  {uniqueAnswers.map(([answer, count], index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="w-4 h-4 rounded-full" 
                                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="text-gray-900 dark:text-white font-medium break-words">
                                          {answer}
                                        </span>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                          {count}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                          {textStats.percentages[answer]}%
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Table View
              <div className="w-full">
                {/* Filter Input */}
                <div className="mb-6 w-full">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Filter by question, answer, or date..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  {filterText && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Showing {filteredResponses.length} of {responses.length} responses
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto w-full">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold w-16">
                          #
                        </th>
                        {form.questions.map((q, idx) => (
                          <th key={idx} className="text-left py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold min-w-[200px] max-w-[300px] truncate" title={q.text}>
                            {q.text}
                          </th>
                        ))}
                        <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold w-48">
                          Submitted At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((resp, idx) => {
                        const rowIndex = (page - 1) * PAGE_SIZE + idx;
                        const isExpanded = expandedRows.has(rowIndex);
                        const hasTruncated = hasTruncatedContent(resp);
                        
                        return (
                          <React.Fragment key={idx}>
                            <tr 
                              className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${hasTruncated ? 'cursor-pointer' : ''}`}
                              onClick={() => hasTruncated && toggleRowExpansion(rowIndex)}
                            >
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium w-16">
                                {(page - 1) * PAGE_SIZE + idx + 1}
                              </td>
                              {form.questions.map((question, qIdx) => {
                                // Find the answer for this specific question using questionId
                                const answer = resp.answers.find(a => a.questionId === question._id)?.answer || "-";
                                return (
                                  <td key={qIdx} className="py-3 px-4 text-gray-900 dark:text-white min-w-[200px] max-w-[300px] truncate whitespace-nowrap" title={answer}>
                                    {answer}
                                  </td>
                                );
                              })}
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300 w-48">
                                {new Date(resp.submittedAt).toLocaleString()}
                              </td>
                            </tr>
                            {/* Expanded row with full content */}
                            {isExpanded && hasTruncated && (
                              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium w-16">
                                  {/* Empty cell for alignment */}
                                </td>
                                {form.questions.map((question, qIdx) => {
                                  const answer = resp.answers.find(a => a.questionId === question._id)?.answer || "-";
                                  return (
                                    <td key={qIdx} className="py-3 px-4 text-gray-900 dark:text-white min-w-[200px] max-w-[300px] whitespace-normal break-words">
                                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Full Answer:
                                      </div>
                                      <div className="text-gray-900 dark:text-white">
                                        {answer}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300 w-48">
                                  {/* Empty cell for alignment */}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No responses yet
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-sm">
                Share your form to start collecting responses
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading responses...</div>
            </div>
          )}
        </div>

        {/* Pagination - Only show for table view */}
        {viewMode === "table" && filteredResponses.length > PAGE_SIZE && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-gray-700 dark:text-gray-300">
                Page {page} of {Math.ceil(filteredResponses.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(filteredResponses.length / PAGE_SIZE), p + 1))}
                disabled={page === Math.ceil(filteredResponses.length / PAGE_SIZE)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FormResponses; 