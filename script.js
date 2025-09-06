                                                                              // 全局变量和配置
let selectedFiles = [];
let cameraStream = null;
let currentPage = 1;
let itemsPerPage = 6;
let totalPages = 1;
let filteredResources = [];
let searchSuggestions = [];
let notificationQueue = [];
let confirmationCallback = null;
let currentLanguage = localStorage.getItem('language') || 'zh';
let currentForumTab = 'upload';

// 双语文本数据
const translations = {
    zh: {
        'home': '首页',
        'browse': '浏览资源',
        'forum': '学生论坛',
        'about': '关于我们',
        'login': '登录',
        'register': '注册',
        'search_placeholder': '搜索课程、专业、论文...',
        'search_button': '搜索',
        'photo_search': '拍照搜索',
        'beginner': '入门',
        'intermediate': '进阶',
        'advanced': '高级',
        'expert': '专家',
        'download': '下载',
        'like': '点赞',
        'comment': '评论',
        'edit': '编辑',
        'delete': '删除'
    },
    en: {
        'home': 'Home',
        'browse': 'Browse Resources',
        'forum': 'Student Forum',
        'about': 'About Us',
        'login': 'Login',
        'register': 'Register',
        'search_placeholder': 'Search courses, majors, papers...',
        'search_button': 'Search',
        'photo_search': 'Photo Search',
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
        'expert': 'Expert',
        'download': 'Download',
        'like': 'Like',
        'comment': 'Comment',
        'edit': 'Edit',
        'delete': 'Delete'
    }
};

// 应用配置
const APP_CONFIG = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
    searchDelay: 300, // 搜索延迟（毫秒）
    notificationDuration: 5000, // 通知显示时间
    animationDuration: 300, // 动画持续时间
};

// 性能监控
const performanceMonitor = {
    startTime: Date.now(),
    marks: {},
    
    mark(name) {
        this.marks[name] = Date.now();
    },
    
    measure(name, startMark) {
        const duration = Date.now() - (this.marks[startMark] || this.startTime);
        console.log(`${name}: ${duration}ms`);
        return duration;
    }
};

// 示例数据
const sampleResources = [
    {
        id: 1,
        title: "计算机科学导论 - 期末复习资料",
        type: "复习资料",
        college: "工程学院",
        major: "计算机科学",
        courseCode: "CS1234",
        year: "2024",
        level: "1000",
        description: "包含所有重要概念和练习题的综合复习资料",
        tags: ["算法", "数据结构", "编程基础"],
        downloadCount: 156,
        uploadDate: "2024-03-15"
    },
    {
        id: 2,
        title: "商业统计学 - 案例分析报告",
        type: "案例研究",
        college: "商学院",
        major: "工商管理",
        courseCode: "BUS2345",
        year: "2023",
        level: "2000",
        description: "详细的统计分析方法和实际商业案例应用",
        tags: ["统计学", "数据分析", "商业案例"],
        downloadCount: 89,
        uploadDate: "2024-02-20"
    },
    {
        id: 3,
        title: "高等数学 - 微积分习题集",
        type: "习题集",
        college: "理学院",
        major: "数学",
        courseCode: "MATH3456",
        year: "2024",
        level: "3000",
        description: "涵盖微积分所有重要概念的练习题集",
        tags: ["微积分", "数学", "习题"],
        downloadCount: 234,
        uploadDate: "2024-01-10"
    },
    {
        id: 4,
        title: "创意写作 - 优秀作品集",
        type: "作品集",
        college: "人文社会科学院",
        major: "中文",
        courseCode: "CHI4567",
        year: "2023",
        level: "4000",
        description: "学生优秀创意写作作品合集",
        tags: ["创意写作", "文学", "作品集"],
        downloadCount: 67,
        uploadDate: "2024-03-01"
    },
    {
        id: 5,
        title: "数字媒体制作 - 项目案例",
        type: "项目案例",
        college: "创意媒体学院",
        major: "数字媒体",
        courseCode: "DM5678",
        year: "2024",
        level: "5000",
        description: "数字媒体制作的完整项目流程和案例分析",
        tags: ["数字媒体", "项目管理", "创意设计"],
        downloadCount: 123,
        uploadDate: "2024-02-28"
    },
    {
        id: 6,
        title: "国际法 - 判例分析",
        type: "判例分析",
        college: "法学院",
        major: "法学",
        courseCode: "LAW6789",
        year: "2023",
        level: "6000",
        description: "重要国际法判例的深入分析和讨论",
        tags: ["国际法", "判例", "法律分析"],
        downloadCount: 45,
        uploadDate: "2024-01-25"
    }
];

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    setupEventListeners();
    renderResources(sampleResources);
    setupFileUpload();
    setupCameraSearch();
}

// 设置事件监听器
function setupEventListeners() {
    // 导航链接平滑滚动
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // 更新活动链接
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // 搜索功能
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 筛选器
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', applyQuickFilters);
    });

    // 高级筛选
    const applyFiltersBtn = document.querySelector('.apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyAdvancedFilters);
    }

    // 拍照搜索
    const cameraSearchBtn = document.getElementById('cameraSearch');
    if (cameraSearchBtn) {
        cameraSearchBtn.addEventListener('click', openCameraModal);
    }
}

// 执行搜索
function performSearch() {
    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    
    if (!searchTerm.trim()) {
        renderResources(sampleResources);
        return;
    }

    const filteredResources = sampleResources.filter(resource => {
        return resource.title.toLowerCase().includes(searchTerm) ||
               resource.description.toLowerCase().includes(searchTerm) ||
               resource.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
               resource.major.toLowerCase().includes(searchTerm) ||
               resource.courseCode.toLowerCase().includes(searchTerm);
    });

    renderResources(filteredResources);
    
    // 滚动到结果区域
    document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
}

// 应用快速筛选
function applyQuickFilters() {
    const degreeFilter = document.getElementById('degreeFilter').value;
    const majorFilter = document.getElementById('majorFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;

    let filteredResources = sampleResources;

    if (degreeFilter) {
        filteredResources = filteredResources.filter(resource => {
            const level = parseInt(resource.level);
            switch(degreeFilter) {
                case 'bachelor': return level >= 1000 && level < 5000;
                case 'master': return level >= 5000 && level < 7000;
                case 'phd': return level >= 7000;
                default: return true;
            }
        });
    }

    if (majorFilter) {
        const majorMap = {
            'engineering': '工程学院',
            'business': '商学院',
            'science': '理学院',
            'arts': '人文社会科学院',
            'law': '法学院'
        };
        const collegeName = majorMap[majorFilter];
        if (collegeName) {
            filteredResources = filteredResources.filter(resource => 
                resource.college === collegeName
            );
        }
    }

    if (yearFilter) {
        filteredResources = filteredResources.filter(resource => 
            resource.year === yearFilter
        );
    }

    renderResources(filteredResources);
}

// 应用高级筛选
function applyAdvancedFilters() {
    const collegeFilter = document.getElementById('collegeFilter').value;
    const courseTypeFilter = document.getElementById('courseTypeFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;

    let filteredResources = sampleResources;

    if (collegeFilter) {
        const collegeMap = {
            'engineering': '工程学院',
            'business': '商学院',
            'science': '理学院',
            'liberal-arts': '人文社会科学院',
            'creative-media': '创意媒体学院',
            'law': '法学院'
        };
        const collegeName = collegeMap[collegeFilter];
        if (collegeName) {
            filteredResources = filteredResources.filter(resource => 
                resource.college === collegeName
            );
        }
    }

    if (courseTypeFilter) {
        const typeMap = {
            'core': ['复习资料', '习题集'],
            'elective': ['案例研究', '作品集'],
            'research': ['项目案例'],
            'thesis': ['判例分析']
        };
        const types = typeMap[courseTypeFilter];
        if (types) {
            filteredResources = filteredResources.filter(resource => 
                types.includes(resource.type)
            );
        }
    }

    if (levelFilter) {
        filteredResources = filteredResources.filter(resource => 
            resource.level === levelFilter
        );
    }

    renderResources(filteredResources);
    showMessage('筛选已应用', 'success');
}

// 渲染资源卡片
function renderResources(resources) {
    const resourcesGrid = document.getElementById('resourcesGrid');
    
    if (resources.length === 0) {
        resourcesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #d1d5db; margin-bottom: 20px;"></i>
                <h3 style="color: #6b7280; margin-bottom: 10px;">未找到相关资源</h3>
                <p style="color: #9ca3af;">请尝试调整搜索条件或筛选器</p>
            </div>
        `;
        return;
    }

    resourcesGrid.innerHTML = resources.map(resource => `
        <div class="resource-card">
            <div class="resource-header">
                <div>
                    <h3 class="resource-title">${resource.title}</h3>
                    <div class="resource-meta">
                        <span><i class="fas fa-university"></i> ${resource.college}</span>
                        <span><i class="fas fa-book"></i> ${resource.courseCode}</span>
                        <span><i class="fas fa-calendar"></i> ${resource.year}</span>
                    </div>
                </div>
                <span class="resource-type">${resource.type}</span>
            </div>
            
            <p class="resource-description">${resource.description}</p>
            
            <div class="resource-tags">
                ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <div class="resource-actions">
                <button class="btn-small btn-download" onclick="downloadResource(${resource.id})">
                    <i class="fas fa-download"></i> 下载 (${resource.downloadCount})
                </button>
                <button class="btn-small btn-view" onclick="previewResource(${resource.id})">
                    <i class="fas fa-eye"></i> 预览
                </button>
            </div>
        </div>
    `).join('');
}

// 下载资源
function downloadResource(resourceId) {
    const resource = sampleResources.find(r => r.id === resourceId);
    if (resource) {
        // 模拟下载
        showMessage(`正在下载: ${resource.title}`, 'success');
        
        // 增加下载计数
        resource.downloadCount++;
        
        // 重新渲染以更新计数
        setTimeout(() => {
            renderResources(getCurrentFilteredResources());
        }, 1000);
    }
}

// 预览资源
function previewResource(resourceId) {
    const resource = sampleResources.find(r => r.id === resourceId);
    if (resource) {
        showMessage(`正在加载预览: ${resource.title}`, 'success');
        // 这里可以实现预览功能
    }
}

// 获取当前筛选的资源
function getCurrentFilteredResources() {
    // 这里应该返回当前显示的资源列表
    // 为简化，直接返回所有资源
    return sampleResources;
}

// 设置文件上传
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const uploadForm = document.getElementById('uploadForm');

    // 点击上传按钮
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 点击上传区域
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // 表单提交
    uploadForm.addEventListener('submit', handleFormSubmit);
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// 处理文件
function handleFiles(files) {
    selectedFiles = Array.from(files);
    displaySelectedFiles();
}

// 显示选中的文件
function displaySelectedFiles() {
    const uploadContent = document.querySelector('.upload-content');
    
    if (selectedFiles.length === 0) {
        return;
    }

    // 创建文件预览区域
    let previewArea = document.querySelector('.file-previews');
    if (!previewArea) {
        previewArea = document.createElement('div');
        previewArea.className = 'file-previews';
        uploadContent.appendChild(previewArea);
    }

    previewArea.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-preview">
            <div class="file-icon">
                <i class="fas fa-file-${getFileIcon(file.type)}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// 获取文件图标
function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('word')) return 'word';
    if (fileType.includes('powerpoint')) return 'powerpoint';
    if (fileType.includes('text')) return 'alt';
    return 'file';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 移除文件
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
    
    if (selectedFiles.length === 0) {
        const previewArea = document.querySelector('.file-previews');
        if (previewArea) {
            previewArea.remove();
        }
    }
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
        showMessage('请先选择要上传的文件', 'error');
        return;
    }

    const formData = new FormData();
    const fileTitle = document.getElementById('fileTitle').value;
    const fileCollege = document.getElementById('fileCollege').value;
    const fileMajor = document.getElementById('fileMajor').value;
    const fileCourseCode = document.getElementById('fileCourseCode').value;
    const fileYear = document.getElementById('fileYear').value;
    const fileDescription = document.getElementById('fileDescription').value;
    const fileTags = document.getElementById('fileTags').value;

    // 验证必填字段
    if (!fileTitle || !fileCollege || !fileMajor || !fileYear) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }

    // 添加文件到FormData
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });

    // 添加其他字段
    formData.append('title', fileTitle);
    formData.append('college', fileCollege);
    formData.append('major', fileMajor);
    formData.append('courseCode', fileCourseCode);
    formData.append('year', fileYear);
    formData.append('description', fileDescription);
    formData.append('tags', fileTags);

    // 模拟上传
    simulateUpload(formData);
}

// 模拟文件上传
function simulateUpload(formData) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.innerHTML = '<span class="loading"></span> 上传中...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showMessage('文件上传成功！', 'success');
        
        // 重置表单
        document.getElementById('uploadForm').reset();
        selectedFiles = [];
        const previewArea = document.querySelector('.file-previews');
        if (previewArea) {
            previewArea.remove();
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // 添加到示例数据（模拟）
        const newResource = {
            id: sampleResources.length + 1,
            title: formData.get('title'),
            type: '用户上传',
            college: getCollegeName(formData.get('college')),
            major: formData.get('major'),
            courseCode: formData.get('courseCode') || 'N/A',
            year: formData.get('year'),
            level: '1000',
            description: formData.get('description') || '用户上传的学术资源',
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            downloadCount: 0,
            uploadDate: new Date().toISOString().split('T')[0]
        };
        
        sampleResources.unshift(newResource);
        renderResources(sampleResources);
        
    }, 2000);
}

// 获取学院名称
function getCollegeName(collegeCode) {
    const collegeMap = {
        'engineering': '工程学院',
        'business': '商学院',
        'science': '理学院',
        'liberal-arts': '人文社会科学院',
        'creative-media': '创意媒体学院',
        'law': '法学院'
    };
    return collegeMap[collegeCode] || collegeCode;
}

// 设置拍照搜索
function setupCameraSearch() {
    const modal = document.getElementById('cameraModal');
    const closeBtn = modal.querySelector('.close');
    const captureBtn = document.getElementById('captureBtn');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imageInput = document.getElementById('imageInput');

    closeBtn.addEventListener('click', closeCameraModal);
    captureBtn.addEventListener('click', capturePhoto);
    uploadImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);

    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCameraModal();
        }
    });
}

// 打开拍照模态框
function openCameraModal() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    
    modal.style.display = 'block';
    
    // 请求摄像头权限
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('无法访问摄像头:', err);
            showMessage('无法访问摄像头，请检查权限设置', 'error');
        });
}

// 关闭拍照模态框
function closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    
    modal.style.display = 'none';
    
    // 停止摄像头流
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    video.srcObject = null;
}

// 拍照
function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    // 将canvas转换为blob
    canvas.toBlob(blob => {
        processImage(blob);
    }, 'image/jpeg', 0.8);
}

// 处理图片上传
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
}

// 处理图片
function processImage(imageBlob) {
    showMessage('正在分析图片...', 'success');
    
    // 模拟图片识别
    setTimeout(() => {
        const mockResults = [
            '计算机科学',
            '数据结构',
            '算法分析',
            '编程基础'
        ];
        
        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
        
        // 关闭模态框
        closeCameraModal();
        
        // 设置搜索词并执行搜索
        document.querySelector('.search-input').value = randomResult;
        performSearch();
        
        showMessage(`图片识别完成，搜索关键词: ${randomResult}`, 'success');
    }, 2000);
}

// 显示消息
function showMessage(message, type = 'success') {
    // 移除现有消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 插入到页面顶部
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 滚动时导航栏效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// 平滑滚动到顶部
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 初始化搜索建议功能
function initializeSearchSuggestions() {
    const searchInput = document.querySelector('.search-input');
    const suggestionsContainer = document.querySelector('.search-suggestions');
    
    if (!searchInput || !suggestionsContainer) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        // 模拟搜索建议
        const suggestions = [
            { text: '计算机科学', category: '专业', icon: 'fas fa-laptop-code' },
            { text: '商业管理', category: '专业', icon: 'fas fa-briefcase' },
            { text: '数据结构', category: '课程', icon: 'fas fa-database' },
            { text: '机器学习', category: '课程', icon: 'fas fa-robot' },
            { text: '2024年', category: '年份', icon: 'fas fa-calendar' }
        ].filter(item => item.text.toLowerCase().includes(query));
        
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(item => `
                <div class="suggestion-item" data-value="${item.text}">
                    <i class="${item.icon}"></i>
                    <span class="suggestion-text">${item.text}</span>
                    <span class="suggestion-category">${item.category}</span>
                </div>
            `).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // 点击建议项
    suggestionsContainer.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
            const value = suggestionItem.dataset.value;
            searchInput.value = value;
            suggestionsContainer.style.display = 'none';
            performSearch();
        }
    });
}

// 初始化主题切换
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) return;
    
    // 检查本地存储的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.toggle('dark-theme', savedTheme === 'dark');
    updateThemeIcon(savedTheme === 'dark');
    
    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    });
}

// 更新主题图标
function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// 初始化上传区域
function initializeUploadArea() {
    setupFileUpload();
}

// 初始化键盘快捷键
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K 聚焦搜索框
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // ESC 关闭模态框
        if (e.key === 'Escape') {
            closeCameraModal();
            const suggestionsContainer = document.querySelector('.search-suggestions');
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        }
    });
}

// 语言切换功能
function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (langToggle && langDropdown) {
        // 初始化语言显示
        updateLanguageDisplay();
        
        // 切换下拉菜单
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('show');
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            langDropdown.classList.remove('show');
        });
        
        // 语言选择
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = option.dataset.lang;
                if (selectedLang !== currentLanguage) {
                    currentLanguage = selectedLang;
                    localStorage.setItem('language', currentLanguage);
                    updateLanguageDisplay();
                    translatePage();
                }
                langDropdown.classList.remove('show');
            });
        });
    }
}

// 更新语言显示
function updateLanguageDisplay() {
    const langCurrent = document.querySelector('.lang-current');
    if (langCurrent) {
        langCurrent.textContent = currentLanguage === 'zh' ? '中' : 'EN';
    }
}

// 翻译页面
function translatePage() {
    const elements = document.querySelectorAll('[data-en][data-zh]');
    elements.forEach(element => {
        const key = currentLanguage === 'zh' ? 'data-zh' : 'data-en';
        const text = element.getAttribute(key);
        if (text) {
            element.textContent = text;
        }
    });
    
    // 更新placeholder
    const placeholderElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-zh]');
    placeholderElements.forEach(element => {
        const key = currentLanguage === 'zh' ? 'data-placeholder-zh' : 'data-placeholder-en';
        const placeholder = element.getAttribute(key);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
    
    // 更新aria-label
    const ariaElements = document.querySelectorAll('[data-label-en][data-label-zh]');
    ariaElements.forEach(element => {
        const key = currentLanguage === 'zh' ? 'data-label-zh' : 'data-label-en';
        const label = element.getAttribute(key);
        if (label) {
            element.setAttribute('aria-label', label);
        }
    });
    
    // 更新title
    const titleElements = document.querySelectorAll('[data-title-en][data-title-zh]');
    titleElements.forEach(element => {
        const key = currentLanguage === 'zh' ? 'data-title-zh' : 'data-title-en';
        const title = element.getAttribute(key);
        if (title) {
            element.title = title;
        }
    });
}

// 论坛功能
function initForumTabs() {
    const forumTabs = document.querySelectorAll('.forum-tab');
    const forumContents = document.querySelectorAll('.forum-content');
    
    forumTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // 更新标签状态
            forumTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新内容显示
            forumContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }
            
            currentForumTab = targetTab;
        });
    });
}

// 论坛帖子交互
function initForumInteractions() {
    // 点赞功能
    document.addEventListener('click', (e) => {
        if (e.target.closest('.post-btn.like')) {
            const btn = e.target.closest('.post-btn.like');
            const countSpan = btn.querySelector('span') || btn.childNodes[btn.childNodes.length - 1];
            let count = parseInt(countSpan.textContent.trim()) || 0;
            
            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                count--;
                btn.style.background = '';
                btn.style.color = '#ef4444';
            } else {
                btn.classList.add('liked');
                count++;
                btn.style.background = '#ef4444';
                btn.style.color = 'white';
            }
            
            countSpan.textContent = ` ${count}`;
            showNotification(currentLanguage === 'zh' ? '操作成功' : 'Success', 'success');
        }
        
        // 下载功能
        if (e.target.closest('.post-btn.download')) {
            showNotification(currentLanguage === 'zh' ? '开始下载...' : 'Download started...', 'info');
        }
        
        // 评论功能
        if (e.target.closest('.post-btn.comment')) {
            showNotification(currentLanguage === 'zh' ? '评论功能开发中' : 'Comment feature coming soon', 'info');
        }
        
        // 编辑功能
        if (e.target.closest('.edit-btn')) {
            showNotification(currentLanguage === 'zh' ? '编辑功能开发中' : 'Edit feature coming soon', 'info');
        }
        
        // 删除功能
        if (e.target.closest('.delete-btn')) {
            if (confirm(currentLanguage === 'zh' ? '确定要删除这个资源吗？' : 'Are you sure you want to delete this resource?')) {
                const postItem = e.target.closest('.my-post-item');
                if (postItem) {
                    postItem.remove();
                    showNotification(currentLanguage === 'zh' ? '删除成功' : 'Deleted successfully', 'success');
                }
            }
        }
    });
}

// 通知系统
function showNotification(message, type = 'info') {
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// 更新初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('CityU Academic Hub 初始化开始...');
    
    // 原有初始化
    setupEventListeners();
    initializeSearchSuggestions();
    renderResources(sampleResources);
    initializeThemeToggle();
    initializeUploadArea();
    initializeKeyboardShortcuts();
    
    // 新增初始化
    initLanguageToggle();
    initForumTabs();
    initForumInteractions();
    translatePage(); // 初始翻译
    
    console.log('CityU Academic Hub 初始化完成');
});

// 添加返回顶部按钮
window.addEventListener('scroll', () => {
    let backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'backToTop';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: none;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
        `;
        backToTopBtn.addEventListener('click', scrollToTop);
        document.body.appendChild(backToTopBtn);
    }
    
    if (window.scrollY > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

// 背景图片滑块功能
function initBackgroundSlider() {
    const slides = document.querySelectorAll('.hero-background-slider .slide');
    let currentSlide = 0;
    
    if (slides.length <= 1) return; // 如果只有一张图片或没有图片，不需要滑块
    
    function nextSlide() {
        // 移除当前活动状态
        slides[currentSlide].classList.remove('active');
        
        // 切换到下一张
        currentSlide = (currentSlide + 1) % slides.length;
        
        // 添加活动状态
        slides[currentSlide].classList.add('active');
    }
    
    // 每5秒自动切换
    setInterval(nextSlide, 5000);
    
    console.log('背景滑块初始化完成，共', slides.length, '张图片');
}

// 在DOM加载完成后初始化背景滑块
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化背景滑块，确保图片加载完成
    setTimeout(initBackgroundSlider, 1000);
});