// script.js
// 主交互逻辑

document.addEventListener('DOMContentLoaded', function() {
    // 全局变量
    let currentPath = ['textbook'];
    let currentFolder = window.textbookStructure;
    let historyStack = [];
    let darkMode = false;

    // DOM 元素
    const fileTree = document.getElementById('file-tree');
    const contentView = document.getElementById('content-view');
    const pathDisplay = document.getElementById('path-display');
    const backButton = document.getElementById('back-button');
    const upButton = document.getElementById('up-button');
    const themeToggle = document.getElementById('theme-toggle');

    // 初始化
    renderFileTree();
    renderContent();
    updatePathDisplay();

    // 渲染文件树
    function renderFileTree() {
        fileTree.innerHTML = '';
        const rootItem = createFolderItem(window.textbookStructure, []);
        fileTree.appendChild(rootItem);
    }

    // 创建文件夹项
    function createFolderItem(item, path) {
        const li = document.createElement('li');
        const isFolder = item.type === 'folder';
        const isCurrentPath = path.join('/') === currentPath.join('/');

        li.className = `py-1 px-2 rounded cursor-pointer transition-colors ${isCurrentPath ? 'folder-item-active' : 'hover:bg-gray-100'}`;

        if (isFolder) {
            const folderIcon = document.createElement('i');
            folderIcon.className = 'fa fa-folder text-yellow-500 mr-2';
            li.appendChild(folderIcon);

            const span = document.createElement('span');
            span.textContent = item.name;
            li.appendChild(span);

            if (item.children && item.children.length > 0) {
                const toggleIcon = document.createElement('i');
                toggleIcon.className = 'fa fa-chevron-right ml-2 text-xs text-gray-400 transition-transform';
                li.appendChild(toggleIcon);

                const ul = document.createElement('ul');
                ul.className = 'ml-6 mt-1 space-y-1 hidden';
                li.appendChild(ul);

                // 检查是否需要展开
                if (isCurrentPath || currentPath.join('/').startsWith(path.join('/') + '/')) {
                    ul.classList.remove('hidden');
                    toggleIcon.classList.add('rotate-90');
                }

                // 切换展开/折叠
                li.addEventListener('click', function(e) {
                    if (e.target !== toggleIcon && e.target !== span && e.target !== folderIcon) {
                        return;
                    }
                    ul.classList.toggle('hidden');
                    toggleIcon.classList.toggle('rotate-90');
                    e.stopPropagation();
                });

                // 递归添加子项
                item.children.forEach(child => {
                    const childPath = [...path, child.name];
                    const childItem = createFolderItem(child, childPath);
                    ul.appendChild(childItem);
                });
            }

            // 点击文件夹导航
            li.addEventListener('click', function() {
                if (!isCurrentPath) {
                    historyStack.push({ path: [...currentPath], folder: currentFolder });
                    currentPath = [...path];
                    currentFolder = item;
                    renderFileTree();
                    renderContent();
                    updatePathDisplay();
                    backButton.disabled = false;
                }
            });
        } else {
            // 文件项
            const fileIcon = document.createElement('i');
            fileIcon.className = 'fa fa-file-text-o text-blue-500 mr-2';
            li.appendChild(fileIcon);

            const span = document.createElement('span');
            span.textContent = item.name;
            li.appendChild(span);

            // 文件下载功能
            li.addEventListener('click', function() {
                const filePath = path.join('/') + '/' + item.name;
                // 构建本地文件路径
                const localFilePath = `/textbook/${filePath}`;
                alert(`文件下载功能: ${localFilePath}\n(在实际部署中，这里将触发文件下载)`);
                // 实际项目中，这里应该是一个下载链接
                const link = document.createElement('a');
                link.href = localFilePath;
                link.download = item.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }

        return li;
    }

    // 渲染内容区域
    function renderContent() {
        contentView.innerHTML = '';

        if (!currentFolder.children || currentFolder.children.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'col-span-full flex flex-col items-center justify-center py-12 text-center text-gray-500';
            emptyState.innerHTML = `
                <i class="fa fa-folder-open-o text-6xl mb-4"></i>
                <h3 class="text-lg font-medium">此文件夹为空</h3>
                <p class="mt-1">没有找到任何文件或子文件夹</p>
            `;
            contentView.appendChild(emptyState);
            return;
        }

        // 先显示文件夹，再显示文件
        const folders = currentFolder.children.filter(item => item.type === 'folder');
        const files = currentFolder.children.filter(item => item.type === 'file');

        [...folders, ...files].forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col';

            if (item.type === 'folder') {
                itemCard.innerHTML = `
                    <div class="w-12 h-12 bg-yellow-100 rounded-md flex items-center justify-center mb-3">
                        <i class="fa fa-folder text-yellow-500 text-xl"></i>
                    </div>
                    <h3 class="font-medium text-gray-900 truncate">${item.name}</h3>
                    <p class="text-sm text-gray-500 mt-1">文件夹</p>
                `;

                // 点击文件夹
                itemCard.addEventListener('click', function() {
                    historyStack.push({ path: [...currentPath], folder: currentFolder });
                    currentPath.push(item.name);
                    currentFolder = item;
                    renderFileTree();
                    renderContent();
                    updatePathDisplay();
                    backButton.disabled = false;
                });
            } else {
                // 文件
                const fileExtension = item.name.split('.').pop().toLowerCase();
                let fileIconClass = 'fa-file-text-o';
                let fileColorClass = 'text-blue-500';
                let fileTypeText = '文件';

                // 根据扩展名设置不同的图标和颜色
                switch (fileExtension) {
                    case 'pdf':
                        fileIconClass = 'fa-file-pdf-o';
                        fileColorClass = 'text-red-500';
                        fileTypeText = 'PDF文档';
                        break;
                    case 'doc':
                    case 'docx':
                        fileIconClass = 'fa-file-word-o';
                        fileColorClass = 'text-blue-600';
                        fileTypeText = 'Word文档';
                        break;
                    case 'xls':
                    case 'xlsx':
                        fileIconClass = 'fa-file-excel-o';
                        fileColorClass = 'text-green-500';
                        fileTypeText = 'Excel文档';
                        break;
                    case 'ppt':
                    case 'pptx':
                        fileIconClass = 'fa-file-powerpoint-o';
                        fileColorClass = 'text-orange-500';
                        fileTypeText = 'PowerPoint文档';
                        break;
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                        fileIconClass = 'fa-file-image-o';
                        fileColorClass = 'text-purple-500';
                        fileTypeText = '图片文件';
                        break;
                }

                itemCard.innerHTML = `
                    <div class="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mb-3">
                        <i class="fa ${fileIconClass} ${fileColorClass} text-xl"></i>
                    </div>
                    <h3 class="font-medium text-gray-900 truncate">${item.name}</h3>
                    <p class="text-sm text-gray-500 mt-1">${fileTypeText}</p>
                `;

                // 文件下载功能
                itemCard.addEventListener('click', function() {
                    const fullPath = currentPath.join('/') + '/' + item.name;
                    // 构建本地文件路径
                    const localFilePath = `/textbook/${fullPath}`;
                    alert(`文件下载功能: ${localFilePath}\n(在实际部署中，这里将触发文件下载)`);
                    // 实际项目中，这里应该是一个下载链接
                    const link = document.createElement('a');
                    link.href = localFilePath;
                    link.download = item.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            }

            contentView.appendChild(itemCard);
        });
    }

    // 更新路径显示
    function updatePathDisplay() {
        pathDisplay.innerHTML = `
            <i class="fa fa-folder-open text-primary mr-2"></i>
            <span>${currentPath.join(' / ')}</span>
        `;

        // 上级目录按钮状态
        upButton.disabled = currentPath.length <= 1;
    }

    // 返回按钮事件
    backButton.addEventListener('click', function() {
        if (historyStack.length > 0) {
            const prevState = historyStack.pop();
            currentPath = prevState.path;
            currentFolder = prevState.folder;
            renderFileTree();
            renderContent();
            updatePathDisplay();
            backButton.disabled = historyStack.length === 0;
        }
    });

    // 上级目录按钮事件
    upButton.addEventListener('click', function() {
        if (currentPath.length > 1) {
            historyStack.push({ path: [...currentPath], folder: currentFolder });
            currentPath.pop();
            // 找到上级文件夹
            let parentFolder = window.textbookStructure;
            for (let i = 1; i < currentPath.length; i++) {
                const folderName = currentPath[i];
                parentFolder = parentFolder.children.find(item => item.name === folderName && item.type === 'folder');
                if (!parentFolder) break;
            }
            currentFolder = parentFolder || window.textbookStructure;
            renderFileTree();
            renderContent();
            updatePathDisplay();
            backButton.disabled = false;
        }
    });

    // 主题切换
    themeToggle.addEventListener('click', function() {
        darkMode = !darkMode;
        document.body.classList.toggle('bg-gray-900', darkMode);
        document.body.classList.toggle('bg-light', !darkMode);

        // 更新文本颜色
        const textElements = document.querySelectorAll('.text-dark, .text-gray-900');
        textElements.forEach(el => {
            el.classList.toggle('text-dark', !darkMode);
            el.classList.toggle('text-gray-900', !darkMode);
            el.classList.toggle('text-white', darkMode);
        });

        // 更新卡片背景
        const cards = document.querySelectorAll('.bg-white');
        cards.forEach(card => {
            card.classList.toggle('bg-white', !darkMode);
            card.classList.toggle('bg-gray-800', darkMode);
            card.classList.toggle('border-gray-200', !darkMode);
            card.classList.toggle('border-gray-700', darkMode);
        });

        // 更新图标
        const icon = themeToggle.querySelector('i');
        if (darkMode) {
            icon.classList.remove('fa-moon-o');
            icon.classList.add('fa-sun-o');
        } else {
            icon.classList.remove('fa-sun-o');
            icon.classList.add('fa-moon-o');
        }
    });
});
