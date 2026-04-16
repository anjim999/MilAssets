const assignmentService = require('../services/assignmentService');

function getAssignments(req, res) {
  try {
    const filters = {
      base_id: req.scopedBaseId || req.query.base_id || null,
      equipment_type_id: req.query.equipment_type_id || null,
      status: req.query.status || null,
    };
    const assignments = assignmentService.getAssignments(filters);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createAssignment(req, res) {
  try {
    const { base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes } = req.body;

    if (!base_id || !equipment_type_id || !assigned_to || !quantity || !assignment_date) {
      return res.status(400).json({ error: 'base_id, equipment_type_id, assigned_to, quantity, and assignment_date are required.' });
    }

    // For non-admin users, enforce base scoping
    if (req.user.role !== 'admin' && base_id !== req.user.base_id) {
      return res.status(403).json({ error: 'You can only create assignments for your assigned base.' });
    }

    const assignment = assignmentService.createAssignment({
      base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes,
      created_by: req.user.id,
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function returnAssignment(req, res) {
  try {
    const result = assignmentService.returnAssignment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAssignments, createAssignment, returnAssignment };
