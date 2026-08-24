const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    // 数据
    const articles = ref([]);
    const currentTime = ref('');
    const newArticle = ref({
      title: '',
      content: ''
    });

    // 自动判断API地址（电脑用localhost，手机用电脑IP）
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:3000/api' 
      : `http://192.168.101.89:3000/api`;

    // 加载文章
    const loadArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/articles`);
        const result = await response.json();
        if (result.success) {
          articles.value = result.data;
        }
      } catch (error) {
        console.error('加载文章失败:', error);
      }
    };

    // 更新时间
    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 发布文章
    const publishArticle = async () => {
      if (!newArticle.value.title || !newArticle.value.content) {
        alert('请填写标题和内容');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newArticle.value)
        });

        const result = await response.json();

        if (result.success) {
          alert('发布成功！');
          newArticle.value = { title: '', content: '' };
          await loadArticles();
        }
      } catch (error) {
        console.error('发布失败:', error);
        alert('发布失败');
      }
    };

    // 删除文章
    const deleteArticle = async (id) => {
      if (!confirm('确定要删除这篇文章吗？')) return;

      try {
        const response = await fetch(`${API_URL}/articles/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
          await loadArticles();
        }
      } catch (error) {
        console.error('删除失败:', error);
      }
    };

    // 页面加载时执行
    onMounted(() => {
      loadArticles();
      updateTime();
      setInterval(updateTime, 60000);
    });
    // 在 return { ... } 之前添加这些

// 文章详情相关
    const selectedArticle = ref(null);
    const showDetail = ref(false);

    const viewArticle = (article) => {
      selectedArticle.value = article;
      showDetail.value = true;
    };

    const closeDetail = () => {
      showDetail.value = false;
      selectedArticle.value = null;
    };

// 文章编辑相关
    const editingArticle = ref(null);

    const editArticle = (article) => {
      editingArticle.value = { ...article };
    };

    const saveEdit = async () => {
      try {
        const response = await fetch(`${API_URL}/articles/${editingArticle.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingArticle.value.title,
            content: editingArticle.value.content
          })
        });

        const result = await response.json();

        if (result.success) {
          alert('保存成功！');
          editingArticle.value = null;
          await loadArticles();
        }
      } catch (error) {
        console.error('保存失败:', error);
      }
    };

    const cancelEdit = () => {
      editingArticle.value = null;
    };

    return {
      articles,
      currentTime,
      newArticle,
      publishArticle,
      deleteArticle,
      viewArticle,
      closeDetail,
      selectedArticle,
      showDetail,
      editingArticle,
      editArticle,
      saveEdit,
      cancelEdit
    };
  }
}).mount('#app');
