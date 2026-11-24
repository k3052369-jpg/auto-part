const pool = require('./connection');
const bcrypt = require('bcryptjs');

async function initUsersTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, full_name VARCHAR(100) NOT NULL, role VARCHAR(20) DEFAULT 'admin', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB");

    const username = (process.env.ADMIN_USERNAME || '').trim();
    const password = process.env.ADMIN_PASSWORD || '';
    if (!username || !password) {
      console.warn('Set ADMIN_USERNAME and ADMIN_PASSWORD to create or secure the admin account.');
      return;
    }

    const fullName = (process.env.ADMIN_FULL_NAME || username).trim();
    const [rows] = await connection.query('SELECT id, password_hash FROM users WHERE username = ? LIMIT 1', [username]);
    if (rows.length === 0) {
      const passwordHash = await bcrypt.hash(password, 12);
      await connection.query('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)', [username, passwordHash, fullName, 'admin']);
      console.log('Configured admin account created.');
    } else if (!(await bcrypt.compare(password, rows[0].password_hash))) {
      const passwordHash = await bcrypt.hash(password, 12);
      await connection.query('UPDATE users SET password_hash = ?, full_name = ?, role = ? WHERE id = ?', [passwordHash, fullName, 'admin', rows[0].id]);
      console.log('Configured admin account password updated.');
    }
  } catch (error) {
    console.warn('Could not initialize the users table:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = initUsersTable;