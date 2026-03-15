/**
 * Role-Based Access Control Middleware
 * 
 * Roles:
 *   admin            - Full access to all bases and operations
 *   base_commander   - Full access to their assigned base
 *   logistics_officer - Access to purchases and transfers for their base
 */

/**
 * Restrict access to specific roles
 * @param  {...string} allowedRoles - Roles that can access this route
 */
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

/**
 * Middleware to scope queries by base_id for non-admin users.
 * Admin users can access all bases.
 * Base commanders and logistics officers are restricted to their base.
 */
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
