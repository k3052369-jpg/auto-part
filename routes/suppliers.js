const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Add supplier
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'ناوی کۆمپانیا پێویستە' });

    const [result] = await db.query(
      'INSERT INTO suppliers (name, phone, address, notes) VALUES (?, ?, ?, ?)',
      [name, phone, address, notes]
    );
    const [newSup] = await db.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'کۆمپانیا زیادکرا', data: newSup[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;
    await db.query(
      'UPDATE suppliers SET name = ?, phone = ?, address = ?, notes = ? WHERE id = ?',
      [name, phone, address, notes, req.params.id]
    );
    res.json({ success: true, message: 'کۆمپانیا نوێکرایەوە' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'کۆمپانیا سڕایەوە' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

module.exports = router;
