const db = require('../config/db');

/**
 * Get purchases with filters
 */
function getPurchases(filters = {}) {
  const { base_id, equipment_type_id, start_date, end_date } = filters;

  let query = `
    SELECT p.id, p.quantity, p.unit_price, p.supplier, p.purchase_date, p.notes, p.created_at,
           et.name as equipment_name, et.category, et.unit,
           b.name as base_name,
           u.full_name as created_by_name
    FROM purchases p
    JOIN equipment_types et ON p.equipment_type_id = et.id
    JOIN bases b ON p.base_id = b.id
    JOIN users u ON p.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (base_id) {
    query += ' AND p.base_id = ?';
    params.push(base_id);
  }
  if (equipment_type_id) {
    query += ' AND p.equipment_type_id = ?';
    params.push(equipment_type_id);
  }
  if (start_date) {
    query += ' AND p.purchase_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND p.purchase_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY p.purchase_date DESC';

  return db.prepare(query).all(...params);
}

/**
 * Create a new purchase
 */
function createPurchase(data) {
  const { base_id, equipment_type_id, quantity, unit_price, supplier, purchase_date, notes, created_by } = data;

  const result = db.prepare(
    `INSERT INTO purchases (base_id, equipment_type_id, quantity, unit_price, supplier, purchase_date, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(base_id, equipment_type_id, quantity, unit_price || 0, supplier || '', purchase_date, notes || '', created_by);

  return { id: result.lastInsertRowid, ...data };
}

module.exports = { getPurchases, createPurchase };
