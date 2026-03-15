const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query('SELECT id, openid, nickname, avatar_url, quota_remaining FROM users WHERE id = $1', [decoded.userId]);

    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'token已过期' });
    }
    return res.status(401).json({ code: 401, message: '认证失败' });
  }
};

module.exports = auth;
