const pool = require('./database');
require('dotenv').config();

const initSQL = `
-- 启用 pgcrypto 扩展（提供 gen_random_uuid）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(128) UNIQUE,
  nickname VARCHAR(100) DEFAULT '架构师学员',
  avatar_url VARCHAR(500),
  quota_remaining INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 题库表
CREATE TABLE IF NOT EXISTS question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  source_type VARCHAR(20) DEFAULT 'text',
  source_content TEXT,
  source_filename VARCHAR(255),
  question_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('choice', 'case', 'essay')),
  category VARCHAR(50),
  difficulty INT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  case_background TEXT,
  case_questions JSONB,
  essay_requirements TEXT,
  essay_template TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 做题记录表
CREATE TABLE IF NOT EXISTS practice_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  bank_id UUID REFERENCES question_banks(id),
  question_id UUID REFERENCES questions(id),
  answer TEXT,
  is_correct BOOLEAN,
  score INT,
  time_spent INT,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 错题本
CREATE TABLE IF NOT EXISTS wrong_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES questions(id),
  wrong_count INT DEFAULT 1,
  last_wrong_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id)
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES questions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_questions_bank ON questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_records(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_user ON wrong_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
`;

async function initDatabase() {
  try {
    await pool.query(initSQL);
    console.log('✓ 数据库表初始化完成');
  } catch (err) {
    console.error('✗ 数据库初始化失败:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, initSQL };
