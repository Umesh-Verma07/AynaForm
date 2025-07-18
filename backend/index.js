const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Root route for basic server check
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});