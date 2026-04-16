const transferService = require('../services/transferService');

/**
 * GET /api/transfers
 */
function getTransfers(req, res) {
  try {
    const filters = {
      base_id: req.scopedBaseId || req.query.base_id || null,
      equipment_type_id: req.query.equipment_type_id || null,
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null,
      status: req.query.status || null,
    };
    const transfers = transferService.getTransfers(filters);
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/transfers
 */
function createTransfer(req, res) {
  try {
    const { from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, notes } = req.body;

    if (!from_base_id || !to_base_id || !equipment_type_id || !quantity || !transfer_date) {
      return res.status(400).json({ error: 'from_base_id, to_base_id, equipment_type_id, quantity, and transfer_date are required.' });
    }

    // For non-admin users, enforce that they can only transfer FROM their base
    if (req.user.role !== 'admin' && from_base_id !== req.user.base_id) {
      return res.status(403).json({ error: 'You can only initiate transfers from your assigned base.' });
    }

    const transfer = transferService.createTransfer({
      from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, notes,
      created_by: req.user.id,
    });

    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getTransfers, createTransfer };
