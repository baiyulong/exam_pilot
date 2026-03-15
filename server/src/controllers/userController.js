const User = require('../models/user');

// 获取用户信息
exports.getProfile = async (req, res, next) => {
  try {
    res.json({
      code: 0,
      data: {
        id: req.user.id,
        nickname: req.user.nickname,
        avatar_url: req.user.avatar_url,
        quota_remaining: req.user.quota_remaining,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 更新用户信息
exports.updateProfile = async (req, res, next) => {
  try {
    const { nickname, avatar_url } = req.body;
    const user = await User.update(req.user.id, { nickname, avatar_url });
    res.json({ code: 0, data: user });
  } catch (err) {
    next(err);
  }
};

// 获取学习统计
exports.getStats = async (req, res, next) => {
  try {
    const stats = await User.getStats(req.user.id);
    res.json({ code: 0, data: stats });
  } catch (err) {
    next(err);
  }
};
