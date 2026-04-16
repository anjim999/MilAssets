const db = require('../config/db');

function getTransfers(filters = {}) {
  const { base_id, equipment_type_id, start_date, end_date, status } = filters;

  let query = `
    SELECT t.id, t.quantity, t.transfer_date, t.status, t.notes, t.created_at,
           et.name as equipment_name, et.category, et.unit,
           fb.name as from_base, fb.id as from_base_id,
           tb.name as to_base, tb.id as to_base_id,
           u.full_name as created_by_name
    FROM transfers t
    JOIN equipment_types et ON t.equipment_type_id = et.id
    JOIN bases fb ON t.from_base_id = fb.id
    JOIN bases tb ON t.to_base_id = tb.id
    JOIN users u ON t.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (base_id) {
    query += ' AND (t.from_base_id = ? OR t.to_base_id = ?)';
    params.push(base_id, base_id);
  }
  if (equipment_type_id) {
    query += ' AND t.equipment_type_id = ?';
    params.push(equipment_type_id);
  }
  if (start_date) {
    query += ' AND t.transfer_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND t.transfer_date <= ?';
    params.push(end_date);
  }
  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }

  query += ' ORDER BY t.transfer_date DESC';

  return db.prepare(query).all(...params);
}

function createTransfer(data) {
  const { from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, notes, created_by } = data;

  if (from_base_id === to_base_id) {
    throw new Error('Cannot transfer to the same base.');
  }

  const result = db.prepare(
    `INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status || 'completed', notes || '', created_by);

  return { id: result.lastInsertRowid, ...data };
}

module.exports = { getTransfers, createTransfer };
