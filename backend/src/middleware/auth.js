const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

/**
 * JWT authentication middleware
 * Verifies the token from Authorization header and attaches user to request
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token format. Use: Bearer <token>' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    return res.status(500).json({ error: 'Authentication failed.' });
  }
}

/**
 * Generate JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { authenticate, generateToken };
