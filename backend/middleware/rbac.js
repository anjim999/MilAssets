
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

function scopeToBase(req, res, next) {
  if (req.user.role === 'admin') {
    // Admin can access all bases - base_id comes from query/body
    req.scopedBaseId = req.query.base_id ? parseInt(req.query.base_id) : null;
  } else {
    // Non-admin users are scoped to their assigned base
    req.scopedBaseId = req.user.base_id;
  }
  next();
}

module.exports = { requireRole, scopeToBase };
