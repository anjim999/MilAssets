const db = require('../config/db');

/**
 * Get expenditures with filters
 */
function getExpenditures(filters = {}) {
  const { base_id, equipment_type_id, start_date, end_date } = filters;

  let query = `
    SELECT e.id, e.quantity, e.expenditure_date, e.reason, e.notes, e.created_at,
           et.name as equipment_name, et.category, et.unit,
           b.name as base_name,
           u.full_name as created_by_name
    FROM expenditures e
    JOIN equipment_types et ON e.equipment_type_id = et.id
    JOIN bases b ON e.base_id = b.id
    JOIN users u ON e.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (base_id) {
    query += ' AND e.base_id = ?';
    params.push(base_id);
  }
  if (equipment_type_id) {
    query += ' AND e.equipment_type_id = ?';
    params.push(equipment_type_id);
  }
  if (start_date) {
    query += ' AND e.expenditure_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND e.expenditure_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY e.expenditure_date DESC';

  return db.prepare(query).all(...params);
}

/**
 * Create a new expenditure
 */
function createExpenditure(data) {
  const { base_id, equipment_type_id, quantity, expenditure_date, reason, notes, created_by } = data;

  const result = db.prepare(
    `INSERT INTO expenditures (base_id, equipment_type_id, quantity, expenditure_date, reason, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(base_id, equipment_type_id, quantity, expenditure_date, reason || '', notes || '', created_by);

  return { id: result.lastInsertRowid, ...data };
}

module.exports = { getExpenditures, createExpenditure };
