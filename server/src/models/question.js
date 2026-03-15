const pool = require('../config/database');

const Question = {
  async bulkCreate(bankId, questions) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const created = [];
      for (const q of questions) {
        const { rows } = await client.query(
          `INSERT INTO questions (bank_id, type, category, difficulty, content, options, correct_answer, explanation, case_background, case_questions, essay_requirements, essay_template)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
          [
            bankId,
            q.type,
            q.category || '综合知识',
            q.difficulty || 3,
            q.content,
            JSON.stringify(q.options || null),
            q.correct_answer || null,
            q.explanation || null,
            q.case_background || null,
            JSON.stringify(q.case_questions || null),
            q.essay_requirements || null,
            q.essay_template || null,
          ]
        );
        created.push(rows[0]);
      }
      // 更新题库题目数
      await client.query(
        `UPDATE question_banks SET question_count = (SELECT COUNT(*) FROM questions WHERE bank_id = $1) WHERE id = $1`,
        [bankId]
      );
      await client.query('COMMIT');
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findByBank(bankId, type) {
    let query = 'SELECT * FROM questions WHERE bank_id = $1';
    const params = [bankId];
    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }
    query += ' ORDER BY created_at ASC';
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByType(type, category, limit = 20, offset = 0) {
    let query = 'SELECT * FROM questions WHERE type = $1';
    const params = [type];
    let idx = 2;
    if (category) {
      query += ` AND category = $${idx}`;
      params.push(category);
      idx++;
    }
    query += ` ORDER BY RANDOM() LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async getCategories() {
    const { rows } = await pool.query(
      'SELECT category, COUNT(*) as count FROM questions GROUP BY category ORDER BY count DESC'
    );
    return rows;
  },
};

module.exports = Question;
