const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

createApp({
  setup() {
    // ============ 页面状态 ============
    const currentTab = ref('home');
    const pageTitle = computed(() => {
      const titles = {
        home: '首页',
        search: '搜索',
        compose: '发布',
        notify: '通知',
        profile: '我的'
      };
      return titles[currentTab.value] || '博客';
    });

    // ============ 用户数据 ============
    const userProfile = ref({
      username: 'CAU通信专业',
      userid: '@cau_student',
      bio: '中国农业大学 大三学生\n正在学习Web开发 🚀',
      avatar: 'U',
      banner: '',
      email: 'cau@example.com'
    });

    // ============ 数据 ============
    const articles = ref([]);
    const currentTime = ref('');
    
    // 搜索和分类
    const searchKeyword = ref('');
    const selectedCategory = ref('全部');
    const categories = ref(['全部', '随笔', '前端', '后端', '算法', '通信', '项目']);
    
    // 新文章
    const newArticle = ref({
      content: '',
      coverImages: [],
      language: 'zh-CN',
      attachment: null
    });
    const charCount = ref(0);
    const MAX_CHARS = 100000;
    
    // 文章详情
    const selectedArticle = ref(null);
    const showDetail = ref(false);
    
    // 编辑
    const editingArticle = ref(null);
    
    // 回复
    const replyingTo = ref(null);
    const replyContent = ref('');
    
    // 通知
    const notifyTab = ref('all');
    const notifications = ref([
      { icon: '❤️', text: '有人赞了你的文章', time: '2分钟前', type: 'like' },
      { icon: '💬', text: '有人回复了你', time: '10分钟前', type: 'reply' },
      { icon: '🔄', text: '你的文章被分享了', time: '1小时前', type: 'repost' },
      { icon: '👤', text: '新用户关注了你', time: '3小时前', type: 'follow' }
    ]);

    // 用户互动记录
    const likedArticles = ref(new Set());
    const bookmarkedArticles = ref(new Set());

    // 设置弹窗
    const showSettings = ref(false);

    // ============ API地址 ============
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:3000/api' 
      : `http://192.168.101.89:3000/api`;

    // ============ 计算属性 ============
    const filteredArticles = computed(() => {
      let result = articles.value;
      
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(a => 
          a.content.toLowerCase().includes(keyword) ||
          (a.title && a.title.toLowerCase().includes(keyword))
        );
      }
      
      if (selectedCategory.value && selectedCategory.value !== '全部') {
        result = result.filter(a => a.category === selectedCategory.value);
      }
      
      return result;
    });

    // ============ 方法 ============
    
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

    // 搜索
    const handleSearch = () => {
      // 搜索在计算属性中自动处理
    };

    // 分类筛选
    const filterByCategory = (category) => {
      selectedCategory.value = category;
    };

    // 返回顶部
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 更新字符计数
    const updateCounter = () => {
      charCount.value = newArticle.value.content.length;
    };

    // 触发图片上传
    const triggerImageUpload = () => {
      const input = document.querySelector('input[type="file"]');
      if (input) input.click();
    };

    // 处理图片上传（支持多张）
    const handleImageUpload = (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          alert('请选择图片文件');
          continue;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          newArticle.value.coverImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    // 移除已上传图片
    const removeImage = (index) => {
      newArticle.value.coverImages.splice(index, 1);
    };

    // 触发附件上传
    const triggerAttachmentUpload = () => {
      const input = document.querySelector('input[name="attachment"]');
      if (input) input.click();
    };

    // 处理附件上传
    const handleAttachmentUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      newArticle.value.attachment = file.name;
      alert('已选择附件: ' + file.name);
    };

    // 发布文章
    const publishArticle = async () => {
      if (!newArticle.value.content) {
        alert('请输入内容');
        return;
      }
      
      if (newArticle.value.content.length > MAX_CHARS) {
        alert('内容不能超过' + MAX_CHARS + '字');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newArticle.value.content.substring(0, 30),
            content: newArticle.value.content,
            category: selectedCategory.value === '全部' ? '随笔' : selectedCategory.value,
            coverImage: newArticle.value.coverImages[0] || '',
            language: newArticle.value.language
          })
        });

        const result = await response.json();

        if (result.success) {
          alert('发布成功！');
          newArticle.value = { content: '', coverImages: [], language: 'zh-CN', attachment: null };
          charCount.value = 0;
          currentTab.value = 'home';
          await loadArticles();
        }
      } catch (error) {
        console.error('发布失败:', error);
        alert('发布失败');
      }
    };

    // 互动功能
    const replyArticle = (article) => {
      replyingTo.value = article;
      replyContent.value = '';
    };

    // 发送回复
    const sendReply = async () => {
      if (!replyContent.value.trim()) {
        alert('请输入回复内容');
        return;
      }
      
      // 添加回复到文章
      if (!replyingTo.value.replies) {
        replyingTo.value.replies = 0;
      }
      replyingTo.value.replies++;
      
      // 保存到后端
      try {
        await fetch(`${API_URL}/articles/${replyingTo.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            replies: replyingTo.value.replies
          })
        });
      } catch (error) {
        console.error('保存回复失败:', error);
      }
      
      // 添加通知
      notifications.value.unshift({
        icon: '💬',
        text: '你回复了: ' + replyContent.value.substring(0, 20) + '...',
        time: '刚刚',
        type: 'reply'
      });
      
      alert('回复成功！');
      replyingTo.value = null;
      replyContent.value = '';
    };

    // 取消回复
    const cancelReply = () => {
      replyingTo.value = null;
      replyContent.value = '';
    };

    // 转发文章
    const repostArticle = async (article) => {
      article.reposts = (article.reposts || 0) + 1;
      
      try {
        await fetch(`${API_URL}/articles/${article.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reposts: article.reposts
          })
        });
      } catch (error) {
        console.error('保存转发失败:', error);
      }
    };

    // 点赞 Toggle（可切换）
    const likeArticle = async (article) => {
      const isLiked = likedArticles.value.has(article.id);
      
      if (isLiked) {
        // 取消点赞
        article.likes = Math.max(0, (article.likes || 1) - 1);
        likedArticles.value.delete(article.id);
      } else {
        // 点赞
        article.likes = (article.likes || 0) + 1;
        likedArticles.value.add(article.id);
      }
      
      // 触发响应式更新
      likedArticles.value = new Set(likedArticles.value);
      
      try {
        await fetch(`${API_URL}/articles/${article.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            likes: article.likes
          })
        });
      } catch (error) {
        console.error('保存点赞失败:', error);
      }
    };

    // 收藏 Toggle（可切换）
    const bookmarkArticle = async (article) => {
      const isBookmarked = bookmarkedArticles.value.has(article.id);
      
      if (isBookmarked) {
        bookmarkedArticles.value.delete(article.id);
      } else {
        bookmarkedArticles.value.add(article.id);
      }
      
      // 触发响应式更新
      bookmarkedArticles.value = new Set(bookmarkedArticles.value);
    };

    // 查看文章
    const viewArticle = (article) => {
      selectedArticle.value = article;
      showDetail.value = true;
    };

    // 关闭详情
    const closeDetail = () => {
      showDetail.value = false;
      selectedArticle.value = null;
    };

    // 编辑文章
    const editArticle = (article) => {
      editingArticle.value = { ...article };
    };

    // 保存编辑
    const saveEdit = async () => {
      try {
        const response = await fetch(`${API_URL}/articles/${editingArticle.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingArticle.value.title,
            content: editingArticle.value.content,
            category: editingArticle.value.category
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

    // 取消编辑
    const cancelEdit = () => {
      editingArticle.value = null;
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

    // 处理通知点击
    const handleNotifyClick = (notify) => {
      currentTab.value = 'home';
    };

    // ============ 个人页面功能 ============
    
    // 编辑资料
    const editProfile = () => {
      const newName = prompt('请输入新名字:', userProfile.value.username);
      if (newName) userProfile.value.username = newName;
      
      const newBio = prompt('请输入新简介:', userProfile.value.bio);
      if (newBio) userProfile.value.bio = newBio;
      
      const newEmail = prompt('请输入新邮箱:', userProfile.value.email);
      if (newEmail) userProfile.value.email = newEmail;
    };

    // 编辑头像
    const editAvatar = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            userProfile.value.avatar = ev.target.result;
            alert('头像更新成功！');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };

    // 编辑背景图
    const editBanner = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            userProfile.value.banner = ev.target.result;
            alert('背景图更新成功！');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };

    // 菜单点击
    const handleMenuClick = (menu) => {
      if (menu === 'articles') {
        currentTab.value = 'home';
      } else if (menu === 'likes') {
        alert('点赞收藏功能开发中...');
      } else if (menu === 'settings') {
        showSettings.value = true;
      } else if (menu === 'about') {
        alert('博客系统 v1.0\n中国农业大学\n通信工程专业');
      }
    };

    // ============ 生命周期 ============
    let autoRefreshTimer = null;
    
    onMounted(() => {
      loadArticles();
      updateTime();
      
      // 每30秒自动刷新文章
      autoRefreshTimer = setInterval(() => {
        loadArticles();
        console.log('文章已自动刷新');
      }, 30000);
      
      // 每分钟更新时间
      setInterval(updateTime, 60000);
    });
    
    onUnmounted(() => {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
      }
    });

    // ============ 返回 ============
    return {
      // 页面状态
      currentTab,
      pageTitle,
      
      // 用户数据
      userProfile,
      
      // 数据
      articles,
      currentTime,
      searchKeyword,
      selectedCategory,
      categories,
      newArticle,
      charCount,
      MAX_CHARS,
      selectedArticle,
      showDetail,
      editingArticle,
      replyingTo,
      replyContent,
      notifyTab,
      notifications,
      showSettings,
      likedArticles,
      bookmarkedArticles,
      
      // 计算属性
      filteredArticles,
      
      // 方法
      handleSearch,
      filterByCategory,
      scrollToTop,
      updateCounter,
      triggerImageUpload,
      handleImageUpload,
      removeImage,
      triggerAttachmentUpload,
      handleAttachmentUpload,
      publishArticle,
      replyArticle,
      sendReply,
      cancelReply,
      repostArticle,
      likeArticle,
      bookmarkArticle,
      viewArticle,
      closeDetail,
      editArticle,
      saveEdit,
      cancelEdit,
      deleteArticle,
      handleNotifyClick,
      editProfile,
      editAvatar,
      editBanner,
      handleMenuClick
    };
  }
}).mount('#app');