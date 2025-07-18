module.exports = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace
  res.status(500).json({ error: err.message || 'Internal Server Error' }); // Send error response
}; 