const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeToBase } = require('../middleware/rbac');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authMiddleware);
router.use(scopeToBase);

router.get('/', assignmentController.getAssignments);
router.post('/',
  requireRole('admin', 'base_commander'),
  auditLogger('ASSIGN', 'assignment'),
  assignmentController.createAssignment
);
router.put('/:id/return',
  requireRole('admin', 'base_commander'),
  auditLogger('RETURN_ASSIGNMENT', 'assignment'),
  assignmentController.returnAssignment
);

module.exports = router;
