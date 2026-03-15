const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middlewares/error');
const authRoutes = require('./routes/auth');
const bankRoutes = require('./routes/banks');
const generateRoutes = require('./routes/generate');
const practiceRoutes = require('./routes/practice');
const userRoutes = require('./routes/user');

const app = express();

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: '服务运行中', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/user', userRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 错误处理
app.use(errorHandler);

module.exports = app;
