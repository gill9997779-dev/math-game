// 初始化脚本 - 从内联脚本移出以符合 CSP
console.log('初始化脚本开始...');

// 加载进度管理
const LoadingManager = {
    progress: 0,
    steps: [
        { name: '检测网络状态', weight: 10 },
        { name: '加载游戏引擎', weight: 30 },
        { name: '初始化系统', weight: 20 },
        { name: '加载游戏模块', weight: 40 }
    ],
    
    updateProgress(stepIndex, stepProgress = 1) {
        let totalProgress = 0;
        for (let i = 0; i < this.steps.length; i++) {
            if (i < stepIndex) {
                totalProgress += this.steps[i].weight;
            } else if (i === stepIndex) {
                totalProgress += this.steps[i].weight * stepProgress;
            }
        }
        
        this.progress = Math.min(totalProgress, 100);
        this.updateUI();
    },
    
    updateUI() {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading');
        const networkStatus = document.getElementById('network-status');
        
        if (loadingBar) {
            loadingBar.style.width = this.progress + '%';
        }
        
        // 更新当前步骤文本
        const currentStep = this.steps.find(function(step, index) {
            let stepStart = 0;
            for (let i = 0; i < index; i++) {
                stepStart += this.steps[i].weight;
            }
            return this.progress >= stepStart && this.progress < stepStart + step.weight;
        }.bind(this));
        
        if (currentStep && loadingText) {
            loadingText.querySelector('div').textContent = currentStep.name + '...';
        }
    },
    
    setNetworkStatus(status) {
        const networkStatus = document.getElementById('network-status');
        if (networkStatus) {
            networkStatus.textContent = status;
        }
    }
};

// 网络状态检测
function checkNetworkStatus() {
    LoadingManager.updateProgress(0, 0.5);
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let networkInfo = '网络状态: ';
    
    if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        switch (effectiveType) {
            case 'slow-2g':
                networkInfo += '2G (慢速)';
                break;
            case '2g':
                networkInfo += '2G';
                break;
            case '3g':
                networkInfo += '3G';
                break;
            case '4g':
                networkInfo += '4G';
                break;
            default:
                networkInfo += '未知';
        }
        
        if (downlink) {
            networkInfo += ` (${downlink.toFixed(1)} Mbps)`;
        }
    } else {
        networkInfo += '无法检测';
    }
    
    LoadingManager.setNetworkStatus(networkInfo);
    LoadingManager.updateProgress(0, 1);
    
    // 网络质量警告
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        setTimeout(function() {
            LoadingManager.setNetworkStatus(networkInfo + ' - 网络较慢，加载可能需要更长时间');
        }, 1000);
    }
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e);
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div style="color: #ff6b6b;">加载错误: ${e.message}</div>
            <div style="font-size: 14px; margin-top: 10px;">请检查网络连接或刷新页面重试</div>
        `;
    }
});

// 等待页面加载
window.addEventListener('load', function() {
    console.log('页面加载完成');
    checkNetworkStatus();
    
    // 检查 Phaser
    setTimeout(function() {
        LoadingManager.updateProgress(1, 0.5);
        
        if (typeof Phaser !== 'undefined') {
            console.log('✓ Phaser 已加载，版本:', Phaser.VERSION);
            LoadingManager.updateProgress(1, 1);
        } else {
            console.error('✗ Phaser 未加载！');
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div style="color: #ff6b6b;">错误：游戏引擎未加载</div>
                    <div style="font-size: 14px; margin-top: 10px;">请检查网络连接并刷新页面</div>
                `;
            }
        }
    }, 1000);
});

// 检查 Phaser 并加载主模块
function initGame() {
    console.log('开始加载游戏模块...');
    LoadingManager.updateProgress(2, 0);
    
    // 检查 Phaser
    console.log('检查 Phaser...', typeof Phaser);
    if (typeof Phaser === 'undefined') {
        console.error('Phaser 未加载！');
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div style="color: #ff6b6b;">Phaser 未加载</div>
                <div style="font-size: 14px; margin-top: 10px;">请检查网络连接</div>
            `;
        }
        return;
    }
    
    console.log('Phaser 版本:', Phaser.VERSION);
    LoadingManager.updateProgress(2, 0.5);
    
    // 加载主模块
    console.log('开始导入 main.js...');
    LoadingManager.updateProgress(3, 0);
    
    import('./main.js?v=19').then(function(module) {
        console.log('main.js 加载成功');
        LoadingManager.updateProgress(3, 1);
        
        // 延迟隐藏加载界面，让用户看到100%完成
        setTimeout(function() {
            const loadingEl = document.getElementById('loading');
            const networkStatus = document.getElementById('network-status');
            if (loadingEl) {
                loadingEl.style.opacity = '0';
                loadingEl.style.transition = 'opacity 0.5s ease';
                setTimeout(function() {
                    loadingEl.style.display = 'none';
                }, 500);
            }
            if (networkStatus) {
                networkStatus.style.display = 'none';
            }
        }, 1000);
        
    }).catch(function(err) {
        console.error('模块加载失败:', err);
        console.error('错误详情:', err.stack);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div style="color: #ff6b6b;">模块加载失败</div>
                <div style="font-size: 14px; margin-top: 10px;">${err.message}</div>
                <div style="font-size: 12px; margin-top: 5px;">请刷新页面重试</div>
            `;
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
        const checkPhaser = setInterval(function() {
            if (typeof Phaser !== 'undefined') {
                clearInterval(checkPhaser);
                console.log('Phaser 已加载，开始初始化游戏');
                initGame();
            }
        }, 100);
        
        // 10秒后超时
        setTimeout(function() {
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

