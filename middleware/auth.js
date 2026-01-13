const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

    // Get user from token
    req.user = await User.findById(decoded.user.id).select('-password');

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};