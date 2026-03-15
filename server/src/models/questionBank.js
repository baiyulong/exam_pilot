const pool = require('../config/database');

const QuestionBank = {
  async create(userId, title, sourceType, sourceContent, sourceFilename) {
    const { rows } = await pool.query(
      `INSERT INTO question_banks (user_id, title, source_type, source_content, source_filename)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, sourceType, sourceContent, sourceFilename]
    );
    return rows[0];
  },

  async findByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT * FROM question_banks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*) as total FROM question_banks WHERE user_id = $1',
      [userId]
    );
    return { banks: rows, total: parseInt(countRows[0].total) };
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM question_banks WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async delete(id, userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM question_banks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },

  async updateQuestionCount(id) {
    await pool.query(
      `UPDATE question_banks SET question_count = (SELECT COUNT(*) FROM questions WHERE bank_id = $1) WHERE id = $1`,
      [id]
    );
  },
};

module.exports = QuestionBank;
