const QuestionBank = require('../models/questionBank');
const Question = require('../models/question');

// 获取用户题库列表
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await QuestionBank.findByUser(req.user.id, parseInt(page), parseInt(limit));
    res.json({ code: 0, data: result });
  } catch (err) {
    next(err);
  }
};

// 获取题库详情（含题目）
exports.detail = async (req, res, next) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) {
      return res.status(404).json({ code: 404, message: '题库不存在' });
    }
    const questions = await Question.findByBank(bank.id, req.query.type);
    res.json({ code: 0, data: { ...bank, questions } });
  } catch (err) {
    next(err);
  }
};

// 创建空题库
exports.create = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, message: '请输入题库名称' });
    }
    const bank = await QuestionBank.create(req.user.id, title, 'manual');
    res.json({ code: 0, data: bank });
  } catch (err) {
    next(err);
  }
};

// 删除题库
exports.remove = async (req, res, next) => {
  try {
    const deleted = await QuestionBank.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: '题库不存在或无权操作' });
    }
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    next(err);
  }
};
