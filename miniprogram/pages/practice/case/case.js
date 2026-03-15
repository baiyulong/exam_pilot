const api = require('../../../utils/api');
const { formatCountdown } = require('../../../utils/util');

Page({
  data: {
    questions: [],
    selectedQuestions: { 0: true },
    selectedCount: 1,
    examStarted: false,
    activeQuestions: [],
    activeIndex: 0,
    activeQuestion: {},
    caseAnswers: {},
    submitted: false,
    loading: true,
    countdown: 90 * 60,
    countdownText: '90:00',
    bankId: null,
  },

  onLoad(options) {
    this.loadQuestions(options.bank_id);
    if (options.bank_id) this.setData({ bankId: options.bank_id });
  },

  async loadQuestions(bankId) {
    try {
      const params = { count: 5 };
      if (bankId) params.bank_id = bankId;
      const res = await api.get('/api/practice/case', params);
      if (res.code === 0 && res.data.length > 0) {
        // 确保 case_questions 是数组
        const questions = res.data.map(q => ({
          ...q,
          case_questions: typeof q.case_questions === 'string' ? JSON.parse(q.case_questions) : (q.case_questions || []),
        }));
        this.setData({ questions, loading: false });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '暂无案例题', icon: 'none' });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  toggleSelect(e) {
    const idx = e.currentTarget.dataset.index;
    if (idx === 0) return; // 第一题必答

    const selected = { ...this.data.selectedQuestions };
    if (selected[idx]) {
      delete selected[idx];
    } else {
      const count = Object.keys(selected).length;
      if (count >= 3) {
        return wx.showToast({ title: '最多选3题', icon: 'none' });
      }
      selected[idx] = true;
    }
    this.setData({
      selectedQuestions: selected,
      selectedCount: Object.keys(selected).length,
    });
  },

  startExam() {
    if (this.data.selectedCount !== 3) {
      return wx.showToast({ title: '请选择3道题', icon: 'none' });
    }
    const activeQuestions = Object.keys(this.data.selectedQuestions)
      .sort((a, b) => a - b)
      .map(idx => ({ ...this.data.questions[idx], originalIndex: parseInt(idx) }));

    this.setData({
      examStarted: true,
      activeQuestions,
      activeIndex: 0,
      activeQuestion: activeQuestions[0],
    });
    this.startCountdown();
  },

  startCountdown() {
    this._timer = setInterval(() => {
      let cd = this.data.countdown - 1;
      if (cd <= 0) {
        clearInterval(this._timer);
        this.submitCase();
        return;
      }
      this.setData({ countdown: cd, countdownText: formatCountdown(cd) });
    }, 1000);
  },

  switchQuestion(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({
      activeIndex: idx,
      activeQuestion: this.data.activeQuestions[idx],
    });
  },

  prevActive() {
    if (this.data.activeIndex > 0) {
      const idx = this.data.activeIndex - 1;
      this.setData({ activeIndex: idx, activeQuestion: this.data.activeQuestions[idx] });
    }
  },

  nextActive() {
    if (this.data.activeIndex < this.data.activeQuestions.length - 1) {
      const idx = this.data.activeIndex + 1;
      this.setData({ activeIndex: idx, activeQuestion: this.data.activeQuestions[idx] });
    }
  },

  onCaseAnswerInput(e) {
    const { qi, pi } = e.currentTarget.dataset;
    const key = `caseAnswers.${qi}_${pi}`;
    this.setData({ [key]: e.detail.value });
  },

  async submitCase() {
    clearInterval(this._timer);
    const answers = this.data.activeQuestions.map(q => ({
      question_id: q.id,
      answer: JSON.stringify(this.data.caseAnswers),
      bank_id: this.data.bankId,
      score: 0,
    }));

    try {
      await api.post('/api/practice/submit', { answers });
      this.setData({ submitted: true });
      wx.showToast({ title: '已交卷' });
    } catch (err) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  onUnload() {
    clearInterval(this._timer);
  },
});
