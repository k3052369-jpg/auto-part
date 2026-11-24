const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Get all products with filtering, searching, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category_id = '',
      brand = '',
      min_price = '',
      max_price = '',
      stock_status = '',
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];
    const countParams = [];

    // Search filter
    if (search) {
      const searchClause = ` AND (p.name LIKE ? OR p.part_number LIKE ? OR p.barcode LIKE ? OR p.brand LIKE ? OR p.model LIKE ?)`;
      query += searchClause;
      countQuery += searchClause;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Category filter
    if (category_id) {
      query += ` AND p.category_id = ?`;
      countQuery += ` AND p.category_id = ?`;
      params.push(category_id);
      countParams.push(category_id);
    }

    // Brand filter
    if (brand) {
      query += ` AND p.brand = ?`;
      countQuery += ` AND p.brand = ?`;
      params.push(brand);
      countParams.push(brand);
    }

    // Price range filter (IQD)
    if (min_price) {
      query += ` AND p.sell_price_iqd >= ?`;
      countQuery += ` AND p.sell_price_iqd >= ?`;
      params.push(min_price);
      countParams.push(min_price);
    }
    if (max_price) {
      query += ` AND p.sell_price_iqd <= ?`;
      countQuery += ` AND p.sell_price_iqd <= ?`;
      params.push(max_price);
      countParams.push(max_price);
    }

    // Stock status filter
    if (stock_status === 'in_stock') {
      query += ` AND p.quantity > p.min_stock`;
      countQuery += ` AND p.quantity > p.min_stock`;
    } else if (stock_status === 'low_stock') {
      query += ` AND p.quantity > 0 AND p.quantity <= p.min_stock`;
      countQuery += ` AND p.quantity > 0 AND p.quantity <= p.min_stock`;
    } else if (stock_status === 'out_of_stock') {
      query += ` AND p.quantity = 0`;
      countQuery += ` AND p.quantity = 0`;
    }

    // Sorting
    const allowedSorts = ['name', 'sell_price_iqd', 'sell_price_usd', 'quantity', 'created_at', 'brand', 'part_number'];
    const sortField = allowedSorts.includes(sort_by) ? `p.${sort_by}` : 'p.created_at';
    const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortDir}`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا لە هێنانی بەرهەمەکان' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'بەرهەم نەدۆزرایەوە' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

// Add new product
router.post('/', async (req, res) => {
  try {
    const {
      name, category_id, brand, model, part_number, barcode,
      quantity, buy_price_iqd, sell_price_iqd, buy_price_usd, sell_price_usd,
      min_stock, location, description
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'ناوی بەرهەم پێویستە' });
    }

    const [result] = await db.query(
      `INSERT INTO products (name, category_id, brand, model, part_number, barcode,
        quantity, buy_price_iqd, sell_price_iqd, buy_price_usd, sell_price_usd,
        min_stock, location, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id || null, brand, model, part_number, barcode,
       quantity || 0, buy_price_iqd || 0, sell_price_iqd || 0,
       buy_price_usd || 0, sell_price_usd || 0,
       min_stock || 5, location, description]
    );

    const [newProduct] = await db.query(
      `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'بەرهەم زیادکرا بە سەرکەوتوویی', data: newProduct[0] });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا لە زیادکردنی بەرهەم' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const {
      name, category_id, brand, model, part_number, barcode,
      quantity, buy_price_iqd, sell_price_iqd, buy_price_usd, sell_price_usd,
      min_stock, location, description
    } = req.body;

    await db.query(
      `UPDATE products SET
        name = ?, category_id = ?, brand = ?, model = ?, part_number = ?, barcode = ?,
        quantity = ?, buy_price_iqd = ?, sell_price_iqd = ?, buy_price_usd = ?, sell_price_usd = ?,
        min_stock = ?, location = ?, description = ?
       WHERE id = ?`,
      [name, category_id || null, brand, model, part_number, barcode,
       quantity || 0, buy_price_iqd || 0, sell_price_iqd || 0,
       buy_price_usd || 0, sell_price_usd || 0,
       min_stock || 5, location, description, req.params.id]
    );

    const [updated] = await db.query(
      `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [req.params.id]
    );

    res.json({ success: true, message: 'بەرهەم نوێکرایەوە', data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا لە نوێکردنەوەی بەرهەم' });
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'بەرهەم سڕایەوە' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا لە سڕینەوەی بەرهەم' });
  }
});

// Get all brands (for filter dropdown)
router.get('/meta/brands', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != "" AND is_active = 1 ORDER BY brand');
    res.json({ success: true, data: rows.map(r => r.brand) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'هەڵەیەک ڕوویدا' });
  }
});

module.exports = router;
