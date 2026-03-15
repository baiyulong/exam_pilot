# 软考高级·系统架构设计师备考系统

## 项目结构

```
exam_pilot/
├── server/                    # 后端服务 (Node.js + Express)
│   ├── src/
│   │   ├── config/            # 配置 (数据库/上传/初始化脚本)
│   │   ├── controllers/       # 控制器 (auth/bank/generate/practice/user)
│   │   ├── middlewares/       # 中间件 (JWT认证/错误处理)
│   │   ├── models/            # 数据模型 (user/questionBank/question/practiceRecord)
│   │   ├── routes/            # API路由
│   │   ├── services/          # 业务服务 (AI服务/题目生成/文件处理)
│   │   ├── utils/             # 工具 (promptBuilder/pdfParser)
│   │   ├── app.js             # Express应用
│   │   └── server.js          # 启动入口
│   ├── uploads/               # 文件上传目录
│   ├── .env                   # 环境变量配置
│   └── package.json
│
└── miniprogram/               # 微信小程序前端
    ├── pages/
    │   ├── index/             # 首页 (学习概况/科目入口)
    │   ├── bank/              # 题库列表
    │   ├── bank/detail/       # 题库详情
    │   ├── generate/          # AI生成题库
    │   ├── practice/choice/   # 选择题练习 (答题卡/倒计时)
    │   ├── practice/case/     # 案例分析 (5选3/答题)
    │   ├── practice/essay/    # 论文写作 (4选1/AI批改)
    │   ├── wrong/             # 错题本
    │   └── profile/           # 个人中心
    ├── utils/                 # 工具 (API封装/通用函数)
    ├── app.js                 # 小程序入口
    ├── app.json               # 小程序配置
    ├── app.wxss               # 全局样式 (工程蓝图风格)
    └── project.config.json    # 项目配置
```

## 快速开始

### 1. 后端启动

```bash
# 安装依赖
cd server
npm install

# 配置环境变量
cp .env .env.local
# 编辑 .env 中的数据库连接、JWT密钥、AI API Key

# 创建PostgreSQL数据库
createdb arch_exam

# 初始化数据库表
npm run db:init

# 启动服务
npm run dev
```

### 2. 小程序开发

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `miniprogram/` 目录
3. 在 `project.config.json` 中替换 `appid`
4. 在 `utils/api.js` 中修改 `BASE_URL` 为实际后端地址

## 核心功能

### AI题库生成
- 上传 PDF/DOCX/TXT 文档或粘贴文本
- AI自动生成选择题/案例分析/论文题目
- 支持选择考点方向和题目数量

### 三种考试模式
- **综合知识**: 75道选择题, 150分钟倒计时, 答题卡
- **案例分析**: 5选3模式, 90分钟, 问答式
- **论文写作**: 4选1命题, 摘要+正文, AI批改评分

### 学习辅助
- 错题本 (自动收集, 按考点筛选)
- 学习统计 (正确率, 考点掌握度)
- 收藏夹

## UI设计
- **工程蓝图风格**: 极简线条, 无阴影/渐变/圆角
- 色板: 白底(#FFF) + 黑线(#000) + 工程蓝(#2563EB) + 错误红(#DC2626)
- 等宽字体, 直角矩形按钮, 1px边框卡片

## API接口

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 认证 | POST | /api/auth/login | 微信登录 |
| 题库 | GET | /api/banks | 题库列表 |
| 题库 | GET | /api/banks/:id | 题库详情 |
| 题库 | POST | /api/banks | 创建题库 |
| 题库 | DELETE | /api/banks/:id | 删除题库 |
| AI生成 | POST | /api/generate/text | 文本生成题目 |
| AI生成 | POST | /api/generate/file | 文件上传生成 |
| AI生成 | POST | /api/generate/review-essay | 论文AI批改 |
| 练习 | GET | /api/practice/choice | 获取选择题 |
| 练习 | GET | /api/practice/case | 获取案例题 |
| 练习 | GET | /api/practice/essay | 获取论文题 |
| 练习 | POST | /api/practice/submit | 提交答案 |
| 练习 | GET | /api/practice/wrong | 错题本 |
| 练习 | GET/POST/DELETE | /api/practice/favorites | 收藏管理 |
| 用户 | GET | /api/user/profile | 用户信息 |
| 用户 | PUT | /api/user/profile | 更新信息 |
| 用户 | GET | /api/user/stats | 学习统计 |

## 环境要求

- Node.js >= 16
- PostgreSQL >= 14
- 微信开发者工具 (最新版)
- AI API Key (OpenAI/兼容接口)
