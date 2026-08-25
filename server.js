const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // 增加限制以支持图片
app.use(express.static(__dirname));

// 读取数据文件
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取数据失败:', error);
  }
  return [];
}

// 保存数据到文件
function saveData(articles) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

// 模拟数据库（文章列表）- 支持分类和图片
let articles = loadData();

// 如果没有数据，初始化默认文章
if (articles.length === 0) {
  articles = [
    {
      id: 1,
      title: '我的第一篇博客',
      content: '这是我的第一篇博客，记录学习Web开发的历程...',
      author: 'CAU通信',
      category: '随笔',
      images: [],
      coverImage: '',
      likes: 0,
      reposts: 0,
      replies: 0,
      date: '2026-08-25'
    },
    {
      id: 2,
      title: 'HTML学习笔记',
      content: 'HTML是网页的基础，通过标签来构建页面结构。常用的标签有：\n\n- div：容器\n- p：段落\n- a：链接\n- img：图片\n\n学习HTML最重要的是理解语义化标签的用法。',
      author: 'CAU通信',
      category: '前端',
      images: [],
      coverImage: '',
      likes: 0,
      reposts: 0,
      replies: 0,
      date: '2026-08-24'
    },
    {
      id: 3,
      title: 'CSS布局技巧',
      content: '深入理解Flexbox和Grid布局...',
      author: 'CAU通信',
      category: '前端',
      images: [],
      coverImage: '',
      likes: 0,
      reposts: 0,
      replies: 0,
      date: '2026-08-23'
    },
    {
      id: 4,
      title: 'Node.js后端开发入门',
      content: 'Node.js是一个基于Chrome V8引擎的JavaScript运行时...',
      author: 'CAU通信',
      category: '后端',
      images: [],
      coverImage: '',
      likes: 0,
      reposts: 0,
      replies: 0,
      date: '2026-08-22'
    }
  ];
  saveData(articles);
}

// 所有分类
const categories = ['随笔', '前端', '后端', '算法', '通信', '项目'];

// 获取所有分类
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: categories
  });
});

// 获取所有文章（支持搜索和分类筛选）
app.get('/api/articles', (req, res) => {
  let result = [...articles];
  
  // 搜索功能
  const search = req.query.search;
  if (search) {
    const keyword = search.toLowerCase();
    result = result.filter(a => 
      a.title.toLowerCase().includes(keyword) || 
      a.content.toLowerCase().includes(keyword)
    );
  }
  
  // 分类筛选
  const category = req.query.category;
  if (category && category !== '全部') {
    result = result.filter(a => a.category === category);
  }
  
  // 按日期排序
  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json({
    success: true,
    data: result
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
  const { title, content, category, images, coverImage, likes, reposts, replies } = req.body;
  
  // 生成新ID
  const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
  
  const newArticle = {
    id: newId,
    title,
    content,
    category: category || '随笔',
    images: images || [],
    coverImage: coverImage || '',
    author: 'CAU通信',
    likes: likes || 0,
    reposts: reposts || 0,
    replies: replies || 0,
    date: new Date().toISOString().split('T')[0]
  };
  
  articles.push(newArticle);
  saveData(articles); // 保存到文件
  res.json({ success: true, data: newArticle });
});

// 更新文章
app.put('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content, category, images, coverImage, likes, reposts, replies } = req.body;
  const index = articles.findIndex(a => a.id === id);
  
  if (index > -1) {
    articles[index] = {
      ...articles[index],
      title: title !== undefined ? title : articles[index].title,
      content: content !== undefined ? content : articles[index].content,
      category: category || articles[index].category,
      images: images || articles[index].images || [],
      coverImage: coverImage !== undefined ? coverImage : articles[index].coverImage || '',
      likes: likes !== undefined ? likes : articles[index].likes || 0,
      reposts: reposts !== undefined ? reposts : articles[index].reposts || 0,
      replies: replies !== undefined ? replies : articles[index].replies || 0,
      date: articles[index].date
    };
    saveData(articles); // 保存到文件
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
    saveData(articles); // 保存到文件
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
  console.log(`📚 分类: ${categories.join(', ')}`);
  console.log(`💾 数据已持久化到: ${DATA_FILE}`);
});