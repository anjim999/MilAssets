const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const { scopeToBase } = require('../middleware/rbac');

router.use(authMiddleware);
router.use(scopeToBase);

router.get('/summary', dashboardController.getSummary);
router.get('/movement-details', dashboardController.getMovementDetails);

module.exports = router;
