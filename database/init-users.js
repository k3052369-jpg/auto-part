const pool = require('./connection');
const bcrypt = require('bcryptjs');

async function initUsersTable() {
  try {
    const connection = await pool.getConnection();

    // 1. Create users table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Check if default admin exists
    const [rows] = await connection.query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      ['admin']
    );

    if (rows.length === 0) {
      // Default password: 1234
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('1234', salt);

      await connection.query(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        ['admin', passwordHash, 'ئەدمینی سەرەکی', 'admin']
      );
      console.log('👤 Default admin user created successfully (username: admin, password: 1234)');
    }

    connection.release();
  } catch (err) {
    // If MySQL is offline, log gracefully
    console.warn('⚠️ Could not initialize users table in MySQL (Database may be offline):', err.message);
  }
}

module.exports = initUsersTable;
