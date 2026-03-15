const api = require('../../../utils/api');
const { formatCountdown } = require('../../../utils/util');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: {},
    userAnswers: {},
    answeredCount: 0,
    showAnswerCard: false,
    submitted: false,
    loading: true,
    countdown: 150 * 60,
    countdownText: '150:00',
    bankId: null,
  },

  onLoad(options) {
    this.loadQuestions(options.bank_id, options.category);
    if (options.bank_id) {
      this.setData({ bankId: options.bank_id });
    }
  },

  async loadQuestions(bankId, category) {
    try {
      const params = { count: 75 };
      if (bankId) params.bank_id = bankId;
      if (category) params.category = category;

      const res = await api.get('/api/practice/choice', params);
      if (res.code === 0 && res.data.length > 0) {
        this.setData({
          questions: res.data,
          currentQuestion: res.data[0],
          loading: false,
        });
        this.startCountdown();
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '暂无题目', icon: 'none' });
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  startCountdown() {
    this._countdownTimer = setInterval(() => {
      let cd = this.data.countdown - 1;
      if (cd <= 0) {
        clearInterval(this._countdownTimer);
        this.submitAll();
        return;
      }
      this.setData({
        countdown: cd,
        countdownText: formatCountdown(cd),
      });
    }, 1000);
  },

  selectOption(e) {
    if (this.data.submitted) return;
    const label = e.currentTarget.dataset.label;
    const idx = this.data.currentIndex;
    const answers = { ...this.data.userAnswers };
    answers[idx] = label;
    const answeredCount = Object.keys(answers).length;
    this.setData({ userAnswers: answers, answeredCount });
  },

  prevQuestion() {
    if (this.data.currentIndex > 0) {
      const idx = this.data.currentIndex - 1;
      this.setData({
        currentIndex: idx,
        currentQuestion: this.data.questions[idx],
      });
    }
  },

  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      const idx = this.data.currentIndex + 1;
      this.setData({
        currentIndex: idx,
        currentQuestion: this.data.questions[idx],
      });
    }
  },

  jumpTo(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: idx,
      currentQuestion: this.data.questions[idx],
      showAnswerCard: false,
    });
  },

  toggleAnswerCard() {
    this.setData({ showAnswerCard: !this.data.showAnswerCard });
  },

  async submitAll() {
    clearInterval(this._countdownTimer);

    const answers = this.data.questions.map((q, idx) => ({
      question_id: q.id,
      answer: this.data.userAnswers[idx] || '',
      bank_id: this.data.bankId,
      time_spent: 150 * 60 - this.data.countdown,
    }));

    try {
      const res = await api.post('/api/practice/submit', { answers });
      if (res.code === 0) {
        this.setData({ submitted: true });
        wx.showModal({
          title: '答题结果',
          content: `总题数: ${res.data.total}\n正确: ${res.data.correct}\n正确率: ${res.data.accuracy}%`,
          showCancel: false,
        });
      }
    } catch (err) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  onUnload() {
    clearInterval(this._countdownTimer);
  },
});
