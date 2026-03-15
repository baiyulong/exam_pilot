const api = require('../../utils/api');

Page({
  data: {
    banks: [],
    loading: true,
  },

  onShow() {
    this.loadBanks();
  },

  async loadBanks() {
    try {
      const res = await api.get('/api/banks');
      if (res.code === 0) {
        this.setData({ banks: res.data.banks, loading: false });
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/bank/detail/detail?id=${id}` });
  },

  goToGenerate() {
    wx.switchTab({ url: '/pages/generate/generate' });
  },
});
