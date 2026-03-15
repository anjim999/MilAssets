const db = require('../config/db');

/**
 * Audit Logger Middleware
 * Logs all mutating API requests (POST, PUT, DELETE) to the audit_logs table.
 */
function auditLogger(action, entityType) {
  return (req, res, next) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Log after successful operations (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const logEntry = db.prepare(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
             VALUES (?, ?, ?, ?, ?, ?)`
          );

          logEntry.run(
            req.user ? req.user.id : null,
            action,
            entityType,
            data && data.id ? data.id : null,
            JSON.stringify({
              method: req.method,
              path: req.originalUrl,
              body: req.body || {},
              query: req.query || {},
            }),
            req.ip || req.connection.remoteAddress
          );
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Get audit logs (for admin viewing)
 */
function getAuditLogs(filters = {}) {
  let query = `
    SELECT al.id, al.action, al.entity_type, al.entity_id, al.details,
           al.ip_address, al.created_at, u.username, u.full_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.action) {
    query += ' AND al.action = ?';
    params.push(filters.action);
  }
  if (filters.user_id) {
    query += ' AND al.user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.start_date) {
    query += ' AND al.created_at >= ?';
    params.push(filters.start_date);
  }
  if (filters.end_date) {
    query += ' AND al.created_at <= ?';
    params.push(filters.end_date);
  }

  query += ' ORDER BY al.created_at DESC LIMIT 100';

  return db.prepare(query).all(...params);
}

module.exports = { auditLogger, getAuditLogs };
