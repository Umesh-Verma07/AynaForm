// Returns CSV string for form responses
module.exports = (form, responses) => {
  // Add form title as the first row
  let csv = `"${form.title}"\n\n`;
  
  // Add question headers
  const headers = form.questions.map(q => q.text);
  csv += headers.join(',') + '\n';
  
  // Add response data
  const rows = responses.map(r =>
    r.answers.map(a => {
      if (typeof a.answer === 'string') return `"${a.answer.replace(/"/g, '""')}"`;
      return a.answer;
    })
  );
  
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  return csv;
}; 