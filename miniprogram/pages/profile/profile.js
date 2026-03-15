const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    userInfo: {},
    stats: {},
  },

  onShow() {
    this.loadProfile();
    this.loadStats();
  },

  async loadProfile() {
    try {
      const res = await api.get('/api/user/profile');
      if (res.code === 0) {
        this.setData({ userInfo: res.data });
      }
    } catch (err) {
      // use cached data
      if (app.globalData.userInfo) {
        this.setData({ userInfo: app.globalData.userInfo });
      }
    }
  },

  async loadStats() {
    try {
      const res = await api.get('/api/user/stats');
      if (res.code === 0) {
        this.setData({ stats: res.data });
      }
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  },

  goTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/wrong/wrong?tab=favorites' });
  },
});
