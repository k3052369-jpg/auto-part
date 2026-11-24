const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    const [totalCategories] = await db.query('SELECT COUNT(*) as count FROM categories');
    const [totalQuantity] = await db.query('SELECT SUM(quantity) as total FROM products WHERE is_active = 1');
    const [lowStock] = await db.query('SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock AND quantity > 0 AND is_active = 1');
    const [outOfStock] = await db.query('SELECT COUNT(*) as count FROM products WHERE quantity = 0 AND is_active = 1');
    const [totalValueIQD] = await db.query('SELECT SUM(quantity * sell_price_iqd) as total FROM products WHERE is_active = 1');
    const [totalValueUSD] = await db.query('SELECT SUM(quantity * sell_price_usd) as total FROM products WHERE is_active = 1');

    const lowStockCount = lowStock[0].count;
    const outOfStockCount = outOfStock[0].count;

    res.json({
      success: true,
      data: {
        totalProducts: totalProducts[0].count,
        totalCategories: totalCategories[0].count,
        totalQuantity: totalQuantity[0].total || 0,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalAlerts: lowStockCount + outOfStockCount,
        totalValueIQD: totalValueIQD[0].total || 0,
        totalValueUSD: totalValueUSD[0].total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Get products that are low in stock or out of stock for report
router.get('/stock-alerts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.quantity <= p.min_stock
      ORDER BY p.quantity ASC, p.name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا لە هێنانی ڕاپۆرتی ئاگادارییەکان' });
  }
});

module.exports = router;
