// 初始化脚本 - 从内联脚本移出以符合 CSP
console.log('初始化脚本开始...');

// 错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e);
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.innerHTML = '加载错误: ' + e.message + '<br>请检查控制台';
        loadingEl.style.color = '#ff6b6b';
    }
});

// 等待页面加载
window.addEventListener('load', () => {
    console.log('页面加载完成');
    
    // 检查 Phaser
    setTimeout(() => {
        if (typeof Phaser !== 'undefined') {
            console.log('✓ Phaser 已加载，版本:', Phaser.VERSION);
        } else {
            console.error('✗ Phaser 未加载！');
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.innerHTML = '错误：Phaser 库未加载<br>请检查网络连接';
                loadingEl.style.color = '#ff6b6b';
            }
        }
    }, 1000);
});

// 检查 Phaser 并加载主模块
function initGame() {
    console.log('开始加载游戏模块...');
    
    // 检查 Phaser
    console.log('检查 Phaser...', typeof Phaser);
    if (typeof Phaser === 'undefined') {
        console.error('Phaser 未加载！');
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = 'Phaser 未加载，请检查网络连接';
            loadingEl.style.color = '#ff6b6b';
        }
        return;
    }
    
    console.log('Phaser 版本:', Phaser.VERSION);
    
    // 加载主模块
    console.log('开始导入 main.js...');
    import('./main.js').then((module) => {
        console.log('main.js 加载成功');
        // main.js 会自动初始化游戏
    }).catch(err => {
        console.error('模块加载失败:', err);
        console.error('错误详情:', err.stack);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = '模块加载失败: ' + err.message + '<br>请检查控制台获取详细信息';
            loadingEl.style.color = '#ff6b6b';
        }
    });
}

// 等待页面和 Phaser 脚本加载完成
function waitForPhaser() {
    if (typeof Phaser !== 'undefined') {
        console.log('Phaser 已加载，开始初始化游戏');
        initGame();
    } else {
        // 监听 Phaser 加载
        const checkPhaser = setInterval(() => {
            if (typeof Phaser !== 'undefined') {
                clearInterval(checkPhaser);
                console.log('Phaser 已加载，开始初始化游戏');
                initGame();
            }
        }, 100);
        
        // 10秒后超时
        setTimeout(() => {
            clearInterval(checkPhaser);
            if (typeof Phaser === 'undefined') {
                console.error('Phaser 加载超时');
                const loadingEl = document.getElementById('loading');
                if (loadingEl) {
                    loadingEl.innerHTML = 'Phaser 加载超时，请刷新页面<br>请检查网络连接或使用本地 Phaser';
                    loadingEl.style.color = '#ff6b6b';
                }
            }
        }, 10000);
    }
}

// 等待页面加载完成后再检查 Phaser
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForPhaser);
} else {
    // 页面已加载，直接检查
    waitForPhaser();
}

