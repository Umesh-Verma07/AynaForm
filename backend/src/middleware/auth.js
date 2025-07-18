const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided
    return res.status(401).json({ error: 'No token provided' });
  }
  // Extract the token from the header
  const token = authHeader.split(' ')[1];
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to the request object
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    // Token is invalid
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 