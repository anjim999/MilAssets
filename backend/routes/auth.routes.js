const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');

// Public routes
router.post('/login', auditLogger('LOGIN', 'auth'), authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
