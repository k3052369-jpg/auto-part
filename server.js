const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./database/connection');
const initUsersTable = require('./database/init-users');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const dashboardRoutes = require('./routes/dashboard');
const exchangeRoutes = require('./routes/exchange');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exchange', exchangeRoutes);

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚗 Auto Part System is running on http://localhost:${PORT}\n`);
  await initUsersTable();
});

module.exports = app;
