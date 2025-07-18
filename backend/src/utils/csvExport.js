module.exports = (form, responses) => {
  // Add form title as the first row
  let csv = `"${form.title}"\n\n`;
  
  // Add question headers (the text of each question)
  const headers = form.questions.map(q => q.text);
  csv += headers.join(',') + '\n';
  
  // Add response data: each row corresponds to a user's answers
  const rows = responses.map(r =>
    r.answers.map(a => {
      // Escape double quotes in answers
      if (typeof a.answer === 'string') return `"${a.answer.replace(/"/g, '""')}"`;
      return a.answer;
    })
  );
  
  // Append each response row to the CSV
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  return csv;
}; 