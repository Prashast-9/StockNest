const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
// verifyToken
// Checks that a valid JWT is present in the
// Authorization header. Attaches decoded user
// info to req.user for downstream use.
// ─────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Header must be: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, email, role, org_id }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// ─────────────────────────────────────────────
// checkRole(...roles)
// Use AFTER verifyToken.
// Pass allowed roles as arguments.
//
// Example:
//   router.delete('/asset/:id', verifyToken, checkRole('Admin'), deleteAsset)
//   router.get('/inventory',    verifyToken, checkRole('Admin', 'Manager'), getInventory)
// ─────────────────────────────────────────────
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
