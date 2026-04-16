const express = require('express');
const router = express.Router();
const expenditureController = require('../controllers/expenditureController');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeToBase } = require('../middleware/rbac');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authMiddleware);
router.use(scopeToBase);

router.get('/', expenditureController.getExpenditures);
router.post('/',
  requireRole('admin', 'base_commander'),
  auditLogger('EXPEND', 'expenditure'),
  expenditureController.createExpenditure
);

module.exports = router;
