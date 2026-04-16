const dashboardService = require('../services/dashboardService');

function getSummary(req, res) {
  try {
    const filters = {
      base_id: req.scopedBaseId || req.query.base_id || null,
      equipment_type_id: req.query.equipment_type_id || null,
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null,
    };
    const summary = dashboardService.getSummary(filters);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getMovementDetails(req, res) {
  try {
    const filters = {
      base_id: req.scopedBaseId || req.query.base_id || null,
      equipment_type_id: req.query.equipment_type_id || null,
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null,
    };
    const details = dashboardService.getMovementDetails(filters);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getSummary, getMovementDetails };
