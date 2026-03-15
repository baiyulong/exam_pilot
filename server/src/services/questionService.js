const { parseFile } = require('../utils/pdfParser');
const aiService = require('./aiService');
const promptBuilder = require('../utils/promptBuilder');
const Question = require('../models/question');
const QuestionBank = require('../models/questionBank');

class QuestionService {
  async generateFromText(userId, text, options = {}) {
    const {
      title = 'AI生成题库',
      choiceCount = 10,
      includeCase = false,
      includeEssay = false,
      category = '综合知识',
    } = options;

    // 创建题库
    const bank = await QuestionBank.create(userId, title, 'text', text.slice(0, 500));

    const allQuestions = [];

    // 生成选择题
    if (choiceCount > 0) {
      const prompt = promptBuilder.buildChoicePrompt(text, choiceCount, category);
      const result = await aiService.callLLM(prompt);
      const choices = Array.isArray(result) ? result : [result];
      allQuestions.push(...choices.map((q) => ({ ...q, type: 'choice' })));
    }

    // 生成案例分析题
    if (includeCase) {
      const prompt = promptBuilder.buildCasePrompt(text, category);
      const result = await aiService.callLLM(prompt);
      allQuestions.push({ ...result, type: 'case' });
    }

    // 生成论文题
    if (includeEssay) {
      const prompt = promptBuilder.buildEssayPrompt(text, category);
      const result = await aiService.callLLM(prompt);
      allQuestions.push({ ...result, type: 'essay' });
    }

    // 批量写入数据库
    const created = await Question.bulkCreate(bank.id, allQuestions);

    return {
      bank_id: bank.id,
      title,
      question_count: created.length,
      questions: created,
    };
  }

  async generateFromFile(userId, filePath, filename, options = {}) {
    const text = await parseFile(filePath);
    if (!text || text.length < 50) {
      throw new Error('文档内容过少，无法生成题目');
    }
    return this.generateFromText(userId, text, {
      ...options,
      title: options.title || `来自 ${filename}`,
    });
  }

  async reviewEssay(title, abstract, content) {
    const prompt = promptBuilder.buildEssayReviewPrompt(title, abstract, content);
    return aiService.callLLM(prompt);
  }
}

module.exports = new QuestionService();
