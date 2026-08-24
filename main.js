// API基础地址
const API_URL = 'http://localhost:3000/api';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
  console.log('页面加载中...');
  await loadArticles();
  updateTime();
});

// 加载文章列表
async function loadArticles() {
  try {
    const response = await fetch(`${API_URL}/articles`);
    const result = await response.json();

    if (result.success) {
      renderArticles(result.data);
    }
  } catch (error) {
    console.error('加载文章失败:', error);
  }
}

// 渲染文章列表
function renderArticles(articles) {
  const container = document.getElementById('articles-container');
  if (!container) return;

  container.innerHTML = articles.map(article => `
    <article class="card">
      <h2>${article.title}</h2>
      <p class="article-meta">📅 ${article.date} | 👤 ${article.author}</p>
      <p>${article.content}</p>
    </article>
  `).join('');
}

// 显示当前时间
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = timeString;
  }

  setInterval(updateTime, 60000);
}
// 发布文章
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('publish-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('article-title').value;
      const content = document.getElementById('article-content').value;

      if (!title || !content) {
        alert('请填写标题和内容');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, content })
        });

        const result = await response.json();

        if (result.success) {
          alert('文章发布成功！');
          form.reset();
          // 刷新文章列表
          await loadArticles();
        } else {
          alert('发布失败：' + result.message);
        }
      } catch (error) {
        console.error('发布文章失败:', error);
        alert('发布失败，请稍后重试');
      }
    });
  }
});
