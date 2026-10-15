const jwt = require('jsonwebtoken');

// ==========================================
// 1. TOKEN AUTHENTICATION VERIFIER
// ==========================================
// Verifies whether the incoming request contains a valid JWT in the Authorization header
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format: "Bearer <JWT_TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Access Denied: Missing authentication token.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
    req.user = decoded; // Appends token payload (id, role, username) to request object
    next();
  } catch (err) {
    return res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Access Denied: Token is invalid, expired, or tampered.'
    });
  }
};

// ==========================================
// 2. ROLE-BASED ACCESS CONTROL (RBAC) GUARD
// ==========================================
// Restricts route execution strictly to approved roles (e.g. 'Admin', 'Procurement')
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: `Forbidden: The role '${req.user?.role || 'Guest'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};