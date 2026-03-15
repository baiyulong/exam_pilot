const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // 测试数据库连接
    await pool.query('SELECT 1');
    console.log('✓ 数据库连接成功');

    // 自动初始化表
    const { initSQL } = require('./config/initDb');
    await pool.query(initSQL);
    console.log('✓ 数据库表就绪');

    app.listen(PORT, () => {
      console.log(`✓ 服务已启动: http://localhost:${PORT}`);
      console.log(`  环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('✗ 启动失败:', err.message);
    process.exit(1);
  }
}

start();
