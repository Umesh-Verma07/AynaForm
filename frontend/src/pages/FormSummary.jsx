import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForm, getSummary } from "../services/forms";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

// Page to show summary of form responses
const FormSummary = () => {
  const { id } = useParams();
  // State
  const [form, setForm] = useState(null);
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState("");

  // Load form and summary
  useEffect(() => {
    getForm(id).then((res) => setForm(res.data));
    getSummary(id)
      .then((res) => setSummary(res.data))
      .catch(() => setError("Failed to load summary"));
  }, [id]);

  return (
    <>
      <div className="max-w-3xl mx-auto mt-8 px-4 pt-20">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">Summary</h2>
        {error && <div className="text-red-500 dark:text-red-300 mb-2 text-sm">{error}</div>}
        <div className="bg-white/60 dark:bg-[#232a47]/70 shadow-2xl dark:shadow-blue-900/40 rounded-3xl p-4 sm:p-6 transition-all duration-500 backdrop-blur-lg border border-gray-200 dark:border-blue-900/60">
          {summary.map((q, idx) => (
            <div key={idx} className="mb-6 sm:mb-8">
              <div className="font-semibold mb-2 text-gray-900 dark:text-white break-words max-w-full text-sm sm:text-base" title={q.question}>{q.question}</div>
              {q.type === "mcq" ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(q.counts).map(([name, value]) => ({ name, value }))}>
                    <XAxis dataKey="name" stroke="#8884d8" tick={{ fill: '#8884d8', fontSize: 12 }} />
                    <YAxis allowDecimals={false} stroke="#8884d8" tick={{ fill: '#8884d8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#222', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="value" fill={idx % 2 === 0 ? '#8884d8' : '#82ca9d'} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ul className="list-disc ml-4 sm:ml-6 text-gray-900 dark:text-white text-sm sm:text-base">
                  {q.answers.map((a, i) => (
                    <li key={i} className="mb-1">{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FormSummary; 