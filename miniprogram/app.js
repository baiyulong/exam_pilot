const api = require('./utils/api');

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:3000',
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.getUserInfo();
    }
  },

  async login() {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        });
      });

      const loginRes = await api.post('/api/auth/login', { code: res.code });
      if (loginRes.code === 0) {
        this.globalData.token = loginRes.data.token;
        this.globalData.userInfo = loginRes.data.user;
        wx.setStorageSync('token', loginRes.data.token);
        return loginRes.data;
      }
      throw new Error(loginRes.message);
    } catch (err) {
      console.error('登录失败:', err);
      throw err;
    }
  },

  async getUserInfo() {
    try {
      const res = await api.get('/api/user/profile');
      if (res.code === 0) {
        this.globalData.userInfo = res.data;
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
  },

  checkLogin() {
    if (!this.globalData.token) {
      return this.login();
    }
    return Promise.resolve({ token: this.globalData.token, user: this.globalData.userInfo });
  },
});
