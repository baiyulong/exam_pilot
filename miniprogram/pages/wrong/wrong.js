const api = require('../../utils/api');
const { CATEGORIES } = require('../../utils/util');

Page({
  data: {
    items: [],
    categories: CATEGORIES,
    filter: '',
    loading: true,
  },

  onShow() {
    this.loadWrongAnswers();
  },

  async loadWrongAnswers() {
    try {
      const params = {};
      if (this.data.filter) params.category = this.data.filter;
      const res = await api.get('/api/practice/wrong', params);
      if (res.code === 0) {
        const items = res.data.map(item => ({
          ...item,
          options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
        }));
        this.setData({ items, loading: false });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  setFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.cat, loading: true });
    this.loadWrongAnswers();
  },
});
