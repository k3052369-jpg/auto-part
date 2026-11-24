const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Add category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'ناوی جۆر پێویستە' });

    const [result] = await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    const [newCat] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'جۆر زیادکرا', data: newCat[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
    res.json({ success: true, message: 'جۆر نوێکرایەوە' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE products SET category_id = NULL WHERE category_id = ?', [req.params.id]);
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'جۆر سڕایەوە' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

module.exports = router;
