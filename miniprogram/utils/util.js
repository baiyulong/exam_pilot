// 格式化时间
function formatTime(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

// 倒计时格式化
function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 计算字数（中文按1字，英文按词）
function countWords(text) {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
}

// 考点分类
const CATEGORIES = [
  '计算机基础', '操作系统', '数据库', '计算机网络', '信息安全',
  '软件工程', '需求工程', '架构设计', '微服务架构', 'DDD领域驱动',
  '分布式系统', '云原生', '性能设计', '可靠性设计', '专业英语',
];

module.exports = { formatTime, formatCountdown, countWords, CATEGORIES };
