const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    stats: {},
    loading: true,
  },

  onLoad() {
    this.init();
  },

  onShow() {
    this.loadStats();
  },

  async init() {
    try {
      await app.checkLogin();
      await this.loadStats();
    } catch (err) {
      console.error('初始化失败:', err);
    }
  },

  async loadStats() {
    try {
      const res = await api.get('/api/user/stats');
      if (res.code === 0) {
        this.setData({ stats: res.data, loading: false });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  goToPractice(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: `/pages/practice/${type}/${type}` });
  },

  goToGenerate() {
    wx.switchTab({ url: '/pages/generate/generate' });
  },

  goToWrong() {
    wx.navigateTo({ url: '/pages/wrong/wrong' });
  },

  goToBank() {
    wx.switchTab({ url: '/pages/bank/bank' });
  },
});
