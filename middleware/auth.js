const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'auto_part_default_jwt_secret_key_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'دەسەڵاتی چوونەژوورەوەت نییە، تکایە سەرەتا بچۆ ژوورەوە'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'تۆکنی بەسەرچوو یان نادروستە، تکایە دووبارە بچۆ ژوورەوە'
    });
  }
}

module.exports = authMiddleware;
