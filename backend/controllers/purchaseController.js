const purchaseService = require('../services/purchaseService');

function getPurchases(req, res) {
  try {
    const filters = {
      base_id: req.scopedBaseId || req.query.base_id || null,
      equipment_type_id: req.query.equipment_type_id || null,
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null,
    };
    const purchases = purchaseService.getPurchases(filters);
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createPurchase(req, res) {
  try {
    const { base_id, equipment_type_id, quantity, unit_price, supplier, purchase_date, notes } = req.body;

    if (!base_id || !equipment_type_id || !quantity || !purchase_date) {
      return res.status(400).json({ error: 'base_id, equipment_type_id, quantity, and purchase_date are required.' });
    }

    // For non-admin users, enforce base scoping
    if (req.user.role !== 'admin' && base_id !== req.user.base_id) {
      return res.status(403).json({ error: 'You can only create purchases for your assigned base.' });
    }

    const purchase = purchaseService.createPurchase({
      base_id, equipment_type_id, quantity, unit_price, supplier, purchase_date, notes,
      created_by: req.user.id,
    });

    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPurchases, createPurchase };
