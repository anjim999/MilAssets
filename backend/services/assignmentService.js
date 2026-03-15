const db = require('../config/db');

/**
 * Get assignments with filters
 */
function getAssignments(filters = {}) {
  const { base_id, equipment_type_id, status } = filters;

  let query = `
    SELECT a.id, a.assigned_to, a.quantity, a.assignment_date, a.return_date, a.status, a.notes, a.created_at,
           et.name as equipment_name, et.category, et.unit,
           b.name as base_name,
           u.full_name as created_by_name
    FROM assignments a
    JOIN equipment_types et ON a.equipment_type_id = et.id
    JOIN bases b ON a.base_id = b.id
    JOIN users u ON a.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (base_id) {
    query += ' AND a.base_id = ?';
    params.push(base_id);
  }
  if (equipment_type_id) {
    query += ' AND a.equipment_type_id = ?';
    params.push(equipment_type_id);
  }
  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }

  query += ' ORDER BY a.assignment_date DESC';

  return db.prepare(query).all(...params);
}

/**
 * Create a new assignment
 */
function createAssignment(data) {
  const { base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes, created_by } = data;

  const result = db.prepare(
    `INSERT INTO assignments (base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes || '', created_by);

  return { id: result.lastInsertRowid, ...data };
}

/**
 * Return an assignment (mark as returned)
 */
function returnAssignment(id) {
  const today = new Date().toISOString().split('T')[0];
  db.prepare(
    `UPDATE assignments SET status = 'returned', return_date = ? WHERE id = ?`
  ).run(today, id);

  return { id, status: 'returned', return_date: today };
}

module.exports = { getAssignments, createAssignment, returnAssignment };
