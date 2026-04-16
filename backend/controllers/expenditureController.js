const expenditureService = require('../services/expenditureService');

function getExpenditures(req, res) {
  try {
    const filters = {
      base_id: req.scopedBaseId || req.query.base_id || null,
      equipment_type_id: req.query.equipment_type_id || null,
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null,
    };
    const expenditures = expenditureService.getExpenditures(filters);
    res.json(expenditures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createExpenditure(req, res) {
  try {
    const { base_id, equipment_type_id, quantity, expenditure_date, reason, notes } = req.body;

    if (!base_id || !equipment_type_id || !quantity || !expenditure_date) {
      return res.status(400).json({ error: 'base_id, equipment_type_id, quantity, and expenditure_date are required.' });
    }

    // For non-admin users, enforce base scoping
    if (req.user.role !== 'admin' && base_id !== req.user.base_id) {
      return res.status(403).json({ error: 'You can only record expenditures for your assigned base.' });
    }

    const expenditure = expenditureService.createExpenditure({
      base_id, equipment_type_id, quantity, expenditure_date, reason, notes,
      created_by: req.user.id,
    });

    res.status(201).json(expenditure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getExpenditures, createExpenditure };
