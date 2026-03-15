const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ code: 413, message: '文件大小超过限制(10MB)' });
  }

  if (err.message && err.message.includes('不支持的文件格式')) {
    return res.status(400).json({ code: 400, message: err.message });
  }

  if (err.code === '23505') {
    return res.status(409).json({ code: 409, message: '数据已存在' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ code: 400, message: '关联数据不存在' });
  }

  const status = err.status || 500;
  res.status(status).json({
    code: status,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
  });
};

module.exports = errorHandler;
