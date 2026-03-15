const pool = require('../config/database');

const User = {
  async findByOpenid(openid) {
    const { rows } = await pool.query('SELECT * FROM users WHERE openid = $1', [openid]);
    return rows[0] || null;
  },

  async create(openid, nickname, avatarUrl) {
    const { rows } = await pool.query(
      'INSERT INTO users (openid, nickname, avatar_url) VALUES ($1, $2, $3) RETURNING *',
      [openid, nickname || '架构师学员', avatarUrl]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (['nickname', 'avatar_url', 'quota_remaining'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  },

  async getStats(userId) {
    const totalPractice = await pool.query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN is_correct THEN 1 END) as correct FROM practice_records WHERE user_id = $1',
      [userId]
    );
    const wrongCount = await pool.query(
      'SELECT COUNT(*) as total FROM wrong_answers WHERE user_id = $1',
      [userId]
    );
    const bankCount = await pool.query(
      'SELECT COUNT(*) as total FROM question_banks WHERE user_id = $1',
      [userId]
    );
    const categoryStats = await pool.query(
      `SELECT q.category, COUNT(*) as total, COUNT(CASE WHEN pr.is_correct THEN 1 END) as correct
       FROM practice_records pr JOIN questions q ON pr.question_id = q.id
       WHERE pr.user_id = $1 GROUP BY q.category`,
      [userId]
    );
    const stats = totalPractice.rows[0];
    return {
      total_practiced: parseInt(stats.total),
      total_correct: parseInt(stats.correct),
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      wrong_count: parseInt(wrongCount.rows[0].total),
      bank_count: parseInt(bankCount.rows[0].total),
      category_stats: categoryStats.rows,
    };
  },
};

module.exports = User;
