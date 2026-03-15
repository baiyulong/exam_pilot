const Question = require('../models/question');
const PracticeRecord = require('../models/practiceRecord');

// 获取选择题
exports.getChoiceQuestions = async (req, res, next) => {
  try {
    const { count = 20, category, bank_id } = req.query;
    let questions;
    if (bank_id) {
      questions = await Question.findByBank(bank_id, 'choice');
    } else {
      questions = await Question.findByType('choice', category, parseInt(count));
    }
    res.json({ code: 0, data: questions });
  } catch (err) {
    next(err);
  }
};

// 获取案例分析题
exports.getCaseQuestions = async (req, res, next) => {
  try {
    const { count = 5, category, bank_id } = req.query;
    let questions;
    if (bank_id) {
      questions = await Question.findByBank(bank_id, 'case');
    } else {
      questions = await Question.findByType('case', category, parseInt(count));
    }
    res.json({ code: 0, data: questions });
  } catch (err) {
    next(err);
  }
};

// 获取论文题目
exports.getEssayQuestions = async (req, res, next) => {
  try {
    const { count = 4, category, bank_id } = req.query;
    let questions;
    if (bank_id) {
      questions = await Question.findByBank(bank_id, 'essay');
    } else {
      questions = await Question.findByType('essay', category, parseInt(count));
    }
    res.json({ code: 0, data: questions });
  } catch (err) {
    next(err);
  }
};

// 提交答案
exports.submit = async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ code: 400, message: '请提交答案数组' });
    }

    const results = [];
    let correctCount = 0;

    for (const item of answers) {
      const question = await Question.findById(item.question_id);
      if (!question) continue;

      let isCorrect = false;
      let score = 0;

      if (question.type === 'choice') {
        isCorrect = item.answer === question.correct_answer;
        score = isCorrect ? 1 : 0;
      } else if (question.type === 'case') {
        score = item.score || 0;
        isCorrect = score >= 15;
      }

      if (isCorrect) correctCount++;

      const record = await PracticeRecord.create(
        req.user.id,
        item.bank_id || null,
        item.question_id,
        item.answer,
        isCorrect,
        score,
        item.time_spent || 0
      );

      results.push({
        question_id: item.question_id,
        is_correct: isCorrect,
        score,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
      });
    }

    res.json({
      code: 0,
      data: {
        total: answers.length,
        correct: correctCount,
        accuracy: answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0,
        results,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 获取错题本
exports.getWrongAnswers = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const items = await PracticeRecord.getWrongAnswers(req.user.id, category, parseInt(page), parseInt(limit));
    res.json({ code: 0, data: items });
  } catch (err) {
    next(err);
  }
};

// 获取收藏
exports.getFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const items = await PracticeRecord.getFavorites(req.user.id, parseInt(page), parseInt(limit));
    res.json({ code: 0, data: items });
  } catch (err) {
    next(err);
  }
};

// 添加收藏
exports.addFavorite = async (req, res, next) => {
  try {
    const { question_id } = req.body;
    await PracticeRecord.addFavorite(req.user.id, question_id);
    res.json({ code: 0, message: '收藏成功' });
  } catch (err) {
    next(err);
  }
};

// 取消收藏
exports.removeFavorite = async (req, res, next) => {
  try {
    await PracticeRecord.removeFavorite(req.user.id, req.params.id);
    res.json({ code: 0, message: '取消收藏' });
  } catch (err) {
    next(err);
  }
};

// 获取考点分类
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Question.getCategories();
    res.json({ code: 0, data: categories });
  } catch (err) {
    next(err);
  }
};
