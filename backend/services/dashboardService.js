const db = require('../config/db');

function getSummary(filters = {}) {
  const { base_id, equipment_type_id, start_date, end_date } = filters;

  // Default date range: last 30 days
  const endDt = end_date || new Date().toISOString().split('T')[0];
  const startDt = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Build WHERE clauses for base and equipment filtering
  let baseFilter = '';
  let equipFilter = '';
  const baseParams = [];
  const equipParams = [];

  if (base_id) {
    baseFilter = ' AND base_id = ?';
    baseParams.push(base_id);
  }
  if (equipment_type_id) {
    equipFilter = ' AND equipment_type_id = ?';
    equipParams.push(equipment_type_id);
  }

  // --- Purchases before start date (for opening balance) ---
  const purchasesBefore = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM purchases 
     WHERE purchase_date < ?${baseFilter}${equipFilter}`
  ).get(startDt, ...baseParams, ...equipParams).total;

  // --- Transfers IN before start date ---
  const transfersInBefore = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers 
     WHERE transfer_date < ? AND status = 'completed'
     ${base_id ? ' AND to_base_id = ?' : ''}${equipFilter}`
  ).get(startDt, ...(base_id ? [base_id] : []), ...equipParams).total;

  // --- Transfers OUT before start date ---
  const transfersOutBefore = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers 
     WHERE transfer_date < ? AND status = 'completed'
     ${base_id ? ' AND from_base_id = ?' : ''}${equipFilter}`
  ).get(startDt, ...(base_id ? [base_id] : []), ...equipParams).total;

  // --- Expenditures before start date ---
  const expendBefore = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures 
     WHERE expenditure_date < ?${baseFilter}${equipFilter}`
  ).get(startDt, ...baseParams, ...equipParams).total;

  // Opening Balance
  const openingBalance = purchasesBefore + transfersInBefore - transfersOutBefore - expendBefore;

  // --- Purchases in range ---
  const purchasesInRange = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM purchases 
     WHERE purchase_date >= ? AND purchase_date <= ?${baseFilter}${equipFilter}`
  ).get(startDt, endDt, ...baseParams, ...equipParams).total;

  // --- Transfers IN in range ---
  const transfersInRange = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers 
     WHERE transfer_date >= ? AND transfer_date <= ? AND status = 'completed'
     ${base_id ? ' AND to_base_id = ?' : ''}${equipFilter}`
  ).get(startDt, endDt, ...(base_id ? [base_id] : []), ...equipParams).total;

  // --- Transfers OUT in range ---
  const transfersOutRange = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers 
     WHERE transfer_date >= ? AND transfer_date <= ? AND status = 'completed'
     ${base_id ? ' AND from_base_id = ?' : ''}${equipFilter}`
  ).get(startDt, endDt, ...(base_id ? [base_id] : []), ...equipParams).total;

  // --- Expenditures in range ---
  const expendInRange = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures 
     WHERE expenditure_date >= ? AND expenditure_date <= ?${baseFilter}${equipFilter}`
  ).get(startDt, endDt, ...baseParams, ...equipParams).total;

  // --- Active assignments ---
  const assigned = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) as total FROM assignments 
     WHERE status = 'active'${baseFilter}${equipFilter}`
  ).get(...baseParams, ...equipParams).total;

  // Net Movement
  const netMovement = purchasesInRange + transfersInRange - transfersOutRange;

  // Closing Balance
  const closingBalance = openingBalance + netMovement - expendInRange;

  return {
    opening_balance: openingBalance,
    closing_balance: closingBalance,
    net_movement: netMovement,
    purchases: purchasesInRange,
    transfers_in: transfersInRange,
    transfers_out: transfersOutRange,
    assigned: assigned,
    expended: expendInRange,
    filters: { base_id, equipment_type_id, start_date: startDt, end_date: endDt },
  };
}

function getMovementDetails(filters = {}) {
  const { base_id, equipment_type_id, start_date, end_date } = filters;
  const endDt = end_date || new Date().toISOString().split('T')[0];
  const startDt = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let baseFilter = '';
  let equipFilter = '';
  const baseParams = [];
  const equipParams = [];

  if (base_id) {
    baseFilter = ' AND p.base_id = ?';
    baseParams.push(base_id);
  }
  if (equipment_type_id) {
    equipFilter = ' AND p.equipment_type_id = ?';
    equipParams.push(equipment_type_id);
  }

  // Purchases details
  const purchases = db.prepare(
    `SELECT p.id, p.quantity, p.purchase_date, p.supplier, p.notes,
            et.name as equipment_name, et.category, b.name as base_name
     FROM purchases p
     JOIN equipment_types et ON p.equipment_type_id = et.id
     JOIN bases b ON p.base_id = b.id
     WHERE p.purchase_date >= ? AND p.purchase_date <= ?${baseFilter}${equipFilter}
     ORDER BY p.purchase_date DESC`
  ).all(startDt, endDt, ...baseParams, ...equipParams);

  // Transfers In details
  let tiBaseFilter = base_id ? ' AND t.to_base_id = ?' : '';
  let tiEquipFilter = equipment_type_id ? ' AND t.equipment_type_id = ?' : '';
  const transfersIn = db.prepare(
    `SELECT t.id, t.quantity, t.transfer_date, t.status, t.notes,
            et.name as equipment_name, et.category,
            fb.name as from_base, tb.name as to_base
     FROM transfers t
     JOIN equipment_types et ON t.equipment_type_id = et.id
     JOIN bases fb ON t.from_base_id = fb.id
     JOIN bases tb ON t.to_base_id = tb.id
     WHERE t.transfer_date >= ? AND t.transfer_date <= ? AND t.status = 'completed'${tiBaseFilter}${tiEquipFilter}
     ORDER BY t.transfer_date DESC`
  ).all(startDt, endDt, ...(base_id ? [base_id] : []), ...(equipment_type_id ? [equipment_type_id] : []));

  // Transfers Out details
  let toBaseFilter = base_id ? ' AND t.from_base_id = ?' : '';
  let toEquipFilter = equipment_type_id ? ' AND t.equipment_type_id = ?' : '';
  const transfersOut = db.prepare(
    `SELECT t.id, t.quantity, t.transfer_date, t.status, t.notes,
            et.name as equipment_name, et.category,
            fb.name as from_base, tb.name as to_base
     FROM transfers t
     JOIN equipment_types et ON t.equipment_type_id = et.id
     JOIN bases fb ON t.from_base_id = fb.id
     JOIN bases tb ON t.to_base_id = tb.id
     WHERE t.transfer_date >= ? AND t.transfer_date <= ? AND t.status = 'completed'${toBaseFilter}${toEquipFilter}
     ORDER BY t.transfer_date DESC`
  ).all(startDt, endDt, ...(base_id ? [base_id] : []), ...(equipment_type_id ? [equipment_type_id] : []));

  return { purchases, transfers_in: transfersIn, transfers_out: transfersOut };
}

module.exports = { getSummary, getMovementDetails };
