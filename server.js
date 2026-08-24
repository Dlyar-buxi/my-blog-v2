const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// 模拟数据库（文章列表）
let articles = [
  {
    id: 1,
    title: '我的第一篇博客',
    content: '这是我的第一篇博客，记录学习Web开发的历程...',
    author: 'CAU通信',
    date: '2026-08-25'
  },
  {
    id: 2,
    title: 'HTML学习笔记',
    content: 'HTML是网页的基础，通过标签来构建页面结构...',
    author: 'CAU通信',
    date: '2026-08-24'
  }
];

// 获取所有文章
app.get('/api/articles', (req, res) => {
  res.json({
    success: true,
    data: articles
  });
});

// 获取单篇文章
app.get('/api/articles/:id', (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (article) {
    res.json({ success: true, data: article });
  } else {
    res.json({ success: false, message: '文章不存在' });
  }
});

// 发布新文章
app.post('/api/articles', (req, res) => {
  const { title, content } = req.body;
  const newArticle = {
    id: articles.length + 1,
    title,
    content,
    author: 'CAU通信',
    date: new Date().toISOString().split('T')[0]
  };
  articles.push(newArticle);
  res.json({ success: true, data: newArticle });
});

// 更新文章
app.put('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const index = articles.findIndex(a => a.id === id);
  
  if (index > -1) {
    articles[index] = {
      ...articles[index],
      title,
      content,
      date: new Date().toISOString().split('T')[0]
    };
    res.json({ success: true, data: articles[index] });
  } else {
    res.json({ success: false, message: '文章不存在' });
  }
});

// 删除文章
app.delete('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = articles.findIndex(a => a.id === id);
  if (index > -1) {
    articles.splice(index, 1);
    res.json({ success: true, message: '删除成功' });
  } else {
    res.json({ success: false, message: '文章不存在' });
  }
});

// 启动服务器 - 允许局域网/热点访问
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 API地址: http://localhost:${PORT}/api/articles`);
  console.log(`📱 手机访问: http://192.168.101.89:${PORT}`);
});
