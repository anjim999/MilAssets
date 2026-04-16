const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/bases', (req, res) => {
  try {
    const bases = db.prepare('SELECT id, name, location FROM bases ORDER BY name').all();
    res.json(bases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/equipment-types', (req, res) => {
  try {
    const types = db.prepare('SELECT id, name, category, unit FROM equipment_types ORDER BY category, name').all();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
