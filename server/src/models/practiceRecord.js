const pool = require('../config/database');

const PracticeRecord = {
  async create(userId, bankId, questionId, answer, isCorrect, score, timeSpent) {
    const { rows } = await pool.query(
      `INSERT INTO practice_records (user_id, bank_id, question_id, answer, is_correct, score, time_spent)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, bankId, questionId, answer, isCorrect, score, timeSpent]
    );

    // 如果答错，加入错题本
    if (!isCorrect) {
      await pool.query(
        `INSERT INTO wrong_answers (user_id, question_id, wrong_count, last_wrong_at)
         VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, question_id)
         DO UPDATE SET wrong_count = wrong_answers.wrong_count + 1, last_wrong_at = CURRENT_TIMESTAMP`,
        [userId, questionId]
      );
    }

    return rows[0];
  },

  async getWrongAnswers(userId, category, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT wa.*, q.type, q.category, q.content, q.options, q.correct_answer, q.explanation,
             q.case_background, q.case_questions
      FROM wrong_answers wa
      JOIN questions q ON wa.question_id = q.id
      WHERE wa.user_id = $1`;
    const params = [userId];
    let idx = 2;
    if (category) {
      query += ` AND q.category = $${idx}`;
      params.push(category);
      idx++;
    }
    query += ` ORDER BY wa.last_wrong_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async removeFromWrong(userId, questionId) {
    await pool.query(
      'DELETE FROM wrong_answers WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );
  },

  async addFavorite(userId, questionId) {
    const { rows } = await pool.query(
      `INSERT INTO favorites (user_id, question_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, question_id) DO NOTHING
       RETURNING *`,
      [userId, questionId]
    );
    return rows[0];
  },

  async removeFavorite(userId, questionId) {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );
  },

  async getFavorites(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT f.created_at as favorited_at, q.*
       FROM favorites f JOIN questions q ON f.question_id = q.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },
};

module.exports = PracticeRecord;
