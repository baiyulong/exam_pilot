const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/user');

// 微信登录
exports.login = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ code: 400, message: '缺少登录code' });
    }

    let openid;

    // 开发模式：使用code作为openid
    if (process.env.NODE_ENV === 'development') {
      openid = `dev_${code}`;
    } else {
      // 生产模式：调用微信接口
      const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: process.env.WX_APPID,
          secret: process.env.WX_SECRET,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });
      if (wxRes.data.errcode) {
        return res.status(400).json({ code: 400, message: '微信登录失败: ' + wxRes.data.errmsg });
      }
      openid = wxRes.data.openid;
    }

    // 查找或创建用户
    let user = await User.findByOpenid(openid);
    if (!user) {
      user = await User.create(openid, req.body.nickname, req.body.avatar_url);
    }

    // 生成JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          quota_remaining: user.quota_remaining,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
