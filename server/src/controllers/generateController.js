const questionService = require('../services/questionService');

// 文本生成题目
exports.fromText = async (req, res, next) => {
  try {
    const { text, title, choice_count, include_case, include_essay, category } = req.body;
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ code: 400, message: '文本内容至少需要50个字符' });
    }

    // 检查配额
    if (req.user.quota_remaining <= 0) {
      return res.status(403).json({ code: 403, message: 'AI生成配额已用完' });
    }

    const result = await questionService.generateFromText(req.user.id, text, {
      title,
      choiceCount: parseInt(choice_count) || 10,
      includeCase: include_case === true || include_case === 'true',
      includeEssay: include_essay === true || include_essay === 'true',
      category: category || '综合知识',
    });

    // 扣减配额
    const pool = require('../config/database');
    await pool.query('UPDATE users SET quota_remaining = quota_remaining - 1 WHERE id = $1', [req.user.id]);

    res.json({ code: 0, data: result });
  } catch (err) {
    next(err);
  }
};

// 文件上传生成题目
exports.fromFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请上传文件' });
    }

    if (req.user.quota_remaining <= 0) {
      return res.status(403).json({ code: 403, message: 'AI生成配额已用完' });
    }

    const { title, choice_count, include_case, include_essay, category } = req.body;

    const result = await questionService.generateFromFile(
      req.user.id,
      req.file.path,
      req.file.originalname,
      {
        title,
        choiceCount: parseInt(choice_count) || 10,
        includeCase: include_case === true || include_case === 'true',
        includeEssay: include_essay === true || include_essay === 'true',
        category: category || '综合知识',
      }
    );

    // 扣减配额
    const pool = require('../config/database');
    await pool.query('UPDATE users SET quota_remaining = quota_remaining - 1 WHERE id = $1', [req.user.id]);

    res.json({ code: 0, data: result });
  } catch (err) {
    next(err);
  }
};

// 论文AI批改
exports.reviewEssay = async (req, res, next) => {
  try {
    const { title, abstract, content } = req.body;
    if (!content || content.length < 500) {
      return res.status(400).json({ code: 400, message: '论文正文至少需要500字' });
    }

    const result = await questionService.reviewEssay(title, abstract, content);
    res.json({ code: 0, data: result });
  } catch (err) {
    next(err);
  }
};
