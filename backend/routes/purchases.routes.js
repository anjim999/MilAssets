const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeToBase } = require('../middleware/rbac');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authMiddleware);
router.use(scopeToBase);

router.get('/', purchaseController.getPurchases);
router.post('/',
  requireRole('admin', 'base_commander', 'logistics_officer'),
  auditLogger('PURCHASE', 'purchase'),
  purchaseController.createPurchase
);

module.exports = router;
