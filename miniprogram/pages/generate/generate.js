const api = require('../../utils/api');
const { CATEGORIES } = require('../../utils/util');

Page({
  data: {
    inputMode: 'text',
    text: '',
    selectedFile: null,
    filePath: '',
    title: '',
    choiceCount: 10,
    includeCase: false,
    includeEssay: false,
    categories: CATEGORIES,
    selectedCategory: '架构设计',
    generating: false,
    progress: 0,
  },

  switchMode(e) {
    this.setData({ inputMode: e.currentTarget.dataset.mode });
  },

  onTextInput(e) {
    this.setData({ text: e.detail.value });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  setChoiceCount(e) {
    this.setData({ choiceCount: e.currentTarget.dataset.count });
  },

  toggleCase() {
    this.setData({ includeCase: !this.data.includeCase });
  },

  toggleEssay() {
    this.setData({ includeEssay: !this.data.includeEssay });
  },

  setCategory(e) {
    this.setData({ selectedCategory: e.currentTarget.dataset.cat });
  },

  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'docx', 'txt'],
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          selectedFile: file,
          filePath: file.path,
        });
      },
    });
  },

  async generate() {
    const { inputMode, text, filePath, title, choiceCount, includeCase, includeEssay, selectedCategory } = this.data;

    if (inputMode === 'text' && (!text || text.trim().length < 50)) {
      return wx.showToast({ title: '文本至少50个字符', icon: 'none' });
    }
    if (inputMode === 'file' && !filePath) {
      return wx.showToast({ title: '请先选择文件', icon: 'none' });
    }

    this.setData({ generating: true, progress: 10 });
    this.startProgressAnimation();

    try {
      let res;
      if (inputMode === 'text') {
        res = await api.post('/api/generate/text', {
          text,
          title: title || `AI题库-${selectedCategory}`,
          choice_count: choiceCount,
          include_case: includeCase,
          include_essay: includeEssay,
          category: selectedCategory,
        });
      } else {
        res = await api.uploadFile('/api/generate/file', filePath, {
          title: title || `AI题库-${selectedCategory}`,
          choice_count: choiceCount,
          include_case: includeCase,
          include_essay: includeEssay,
          category: selectedCategory,
        });
      }

      this.setData({ generating: false, progress: 100 });

      if (res.code === 0) {
        wx.showToast({ title: `生成${res.data.question_count}道题` });
        setTimeout(() => {
          wx.navigateTo({ url: `/pages/bank/detail/detail?id=${res.data.bank_id}` });
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '生成失败', icon: 'none' });
      }
    } catch (err) {
      this.setData({ generating: false, progress: 0 });
      wx.showToast({ title: '生成失败，请重试', icon: 'none' });
    }
  },

  startProgressAnimation() {
    let progress = 10;
    this._timer = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 10;
        this.setData({ progress: Math.min(progress, 90) });
      }
    }, 2000);
  },

  onUnload() {
    clearInterval(this._timer);
  },
});
