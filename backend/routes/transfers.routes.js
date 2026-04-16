const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeToBase } = require('../middleware/rbac');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authMiddleware);
router.use(scopeToBase);

router.get('/', transferController.getTransfers);
router.post('/',
  requireRole('admin', 'base_commander', 'logistics_officer'),
  auditLogger('TRANSFER', 'transfer'),
  transferController.createTransfer
);

module.exports = router;
