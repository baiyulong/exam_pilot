const api = require('../../../utils/api');
const { formatCountdown, countWords } = require('../../../utils/util');

Page({
  data: {
    topics: [],
    topicIndex: -1,
    selectedTopic: null,
    abstract: '',
    content: '',
    abstractCount: 0,
    contentCount: 0,
    reviewResult: null,
    reviewing: false,
    loading: true,
    countdown: 120 * 60,
    countdownText: '120:00',
    bankId: null,
  },

  onLoad(options) {
    this.loadTopics(options.bank_id);
    if (options.bank_id) this.setData({ bankId: options.bank_id });
  },

  async loadTopics(bankId) {
    try {
      const params = { count: 4 };
      if (bankId) params.bank_id = bankId;
      const res = await api.get('/api/practice/essay', params);
      if (res.code === 0 && res.data.length > 0) {
        this.setData({ topics: res.data, loading: false });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '暂无论文题', icon: 'none' });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  selectTopic(e) {
    this.setData({ topicIndex: e.currentTarget.dataset.index });
  },

  confirmTopic() {
    if (this.data.topicIndex < 0) return;
    this.setData({ selectedTopic: this.data.topics[this.data.topicIndex] });
    this.startCountdown();
  },

  startCountdown() {
    this._timer = setInterval(() => {
      let cd = this.data.countdown - 1;
      if (cd <= 0) {
        clearInterval(this._timer);
        return;
      }
      this.setData({ countdown: cd, countdownText: formatCountdown(cd) });
    }, 1000);
  },

  onAbstractInput(e) {
    const text = e.detail.value;
    this.setData({ abstract: text, abstractCount: countWords(text) });
  },

  onContentInput(e) {
    const text = e.detail.value;
    this.setData({ content: text, contentCount: countWords(text) });
  },

  saveDraft() {
    wx.setStorageSync('essay_draft', {
      topicIndex: this.data.topicIndex,
      abstract: this.data.abstract,
      content: this.data.content,
      savedAt: new Date().toISOString(),
    });
    wx.showToast({ title: '草稿已保存' });
  },

  async aiReview() {
    const { abstract, content, selectedTopic } = this.data;
    if (!content || countWords(content) < 500) {
      return wx.showToast({ title: '正文至少500字才能批改', icon: 'none' });
    }

    this.setData({ reviewing: true });

    try {
      const res = await api.post('/api/generate/review-essay', {
        title: selectedTopic.content,
        abstract,
        content,
      });
      if (res.code === 0) {
        this.setData({ reviewResult: res.data, reviewing: false });
      } else {
        wx.showToast({ title: res.message || '批改失败', icon: 'none' });
        this.setData({ reviewing: false });
      }
    } catch (err) {
      this.setData({ reviewing: false });
      wx.showToast({ title: '批改失败', icon: 'none' });
    }
  },

  onUnload() {
    clearInterval(this._timer);
  },
});
