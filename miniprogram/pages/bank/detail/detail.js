const api = require('../../../utils/api');

Page({
  data: {
    bank: {},
    questions: [],
    filteredQuestions: [],
    filter: '',
    loading: true,
  },

  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    try {
      const res = await api.get(`/api/banks/${id}`);
      if (res.code === 0) {
        this.setData({
          bank: res.data,
          questions: res.data.questions || [],
          filteredQuestions: res.data.questions || [],
          loading: false,
        });
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  setFilter(e) {
    const type = e.currentTarget.dataset.type;
    const filtered = type ? this.data.questions.filter(q => q.type === type) : this.data.questions;
    this.setData({ filter: type, filteredQuestions: filtered });
  },

  startPractice() {
    const bank = this.data.bank;
    const hasChoice = this.data.questions.some(q => q.type === 'choice');
    const hasCase = this.data.questions.some(q => q.type === 'case');
    const hasEssay = this.data.questions.some(q => q.type === 'essay');

    if (hasChoice) {
      wx.navigateTo({ url: `/pages/practice/choice/choice?bank_id=${bank.id}` });
    } else if (hasCase) {
      wx.navigateTo({ url: `/pages/practice/case/case?bank_id=${bank.id}` });
    } else if (hasEssay) {
      wx.navigateTo({ url: `/pages/practice/essay/essay?bank_id=${bank.id}` });
    }
  },

  async deleteBank() {
    const res = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '删除后题库及所有题目将不可恢复',
        success: resolve,
      });
    });
    if (res.confirm) {
      try {
        await api.del(`/api/banks/${this.data.bank.id}`);
        wx.showToast({ title: '已删除' });
        wx.navigateBack();
      } catch (err) {
        wx.showToast({ title: '删除失败', icon: 'none' });
      }
    }
  },
});
