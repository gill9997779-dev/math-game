// 游戏初始化脚本 - iOS增强版本
// Game Initialization with iOS Native Bridge Integration

import NativeBridge from './NativeBridge.js';

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    
    // 发送错误到原生应用进行分析
    if (window.NativeBridge) {
        window.NativeBridge.sendMessage('logError', {
            message: event.error.message,
            stack: event.error.stack,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    event.preventDefault();
    
    if (window.NativeBridge) {
        window.NativeBridge.sendMessage('logError', {
            type: 'unhandledRejection',
            reason: event.reason.toString()
        });
    }
});

// 游戏数据初始化
window.gameData = {
    // 基础游戏数据
    username: '',
    level: 1,
    experience: 0,
    coins: 100,
    realm: '炼气',
    currentZone: '青石村',
    
    // iOS特定数据
    isNativeApp: false,
    isIOS: false,
    deviceInfo: null,
    isOnline: navigator.onLine,
    
    // 游戏系统
    playerSystem: null,
    mathConceptSystem: null,
    achievementSystem: null,
    taskSystem: null,
    skillSystem: null,
    shopSystem: null,
    craftingSystem: null,
    treasureSystem: null,
    eventSystem: null,
    dailyCheckInSystem: null,
    challengeSystem: null,
    combatPowerSystem: null,
    dropSystem: null,
    
    // 游戏状态
    gameStarted: false,
    currentScene: null,
    
    // 性能监控
    performanceMetrics: {
        loadTime: 0,
        fps: 0,
        memoryUsage: 0
    }
};

// 性能监控
const performanceMonitor = {
    startTime: performance.now(),
    
    init() {
        // FPS监控
        let fps = 0;
        let lastTime = performance.now();
        let frameCount = 0;
        
        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                window.gameData.performanceMetrics.fps = fps;
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        requestAnimationFrame(updateFPS);
        
        // 内存监控
        if (performance.memory) {
            setInterval(() => {
                window.gameData.performanceMetrics.memoryUsage = 
                    Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }, 5000);
        }
    },
    
    recordLoadTime() {
        window.gameData.performanceMetrics.loadTime = 
            Math.round(performance.now() - this.startTime);
    }
};

// 网络状态监听
window.addEventListener('online', () => {
    window.gameData.isOnline = true;
    console.log('网络已连接');
    
    if (window.NativeBridge) {
        window.NativeBridge.handleNetworkChange(true);
    }
});

window.addEventListener('offline', () => {
    window.gameData.isOnline = false;
    console.log('网络已断开');
    
    if (window.NativeBridge) {
        window.NativeBridge.handleNetworkChange(false);
    }
});

// 移动端优化检测
function detectMobileOptimizations() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency < 4 || window.devicePixelRatio < 2;
    
    return {
        isMobile,
        isLowEnd,
        reducedParticles: isLowEnd,
        reducedAnimations: isLowEnd,
        simplifiedShaders: isLowEnd
    };
}

// 游戏配置优化
function optimizeGameConfig() {
    const optimizations = detectMobileOptimizations();
    
    window.gameConfig = {
        // 基础配置
        width: window.innerWidth,
        height: window.innerHeight,
        
        // 性能优化
        particleCount: optimizations.reducedParticles ? 10 : 20,
        maxParticles: optimizations.reducedParticles ? 50 : 100,
        enableShadows: !optimizations.isLowEnd,
        enableBloom: !optimizations.isLowEnd,
        animationQuality: optimizations.reducedAnimations ? 'low' : 'high',
        
        // iOS特定优化
        enableHapticFeedback: window.gameData.isIOS,
        enableNativeShare: window.gameData.isNativeApp,
        enableApplePencil: window.gameData.isIOS,
        
        // 移动端优化
        touchOptimized: optimizations.isMobile,
        virtualKeyboard: optimizations.isMobile,
        
        // 调试模式
        debug: false
    };
}

// Phaser.js 动态加载
async function loadPhaser() {
    console.log('开始加载 Phaser.js...');
    
    try {
        // 尝试从CDN加载
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js';
        
        return new Promise((resolve, reject) => {
            script.onload = () => {
                console.log('Phaser.js 加载成功 (CDN)');
                resolve();
            };
            
            script.onerror = () => {
                console.warn('CDN加载失败，尝试备用CDN...');
                
                // 备用CDN
                const backupScript = document.createElement('script');
                backupScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js';
                
                backupScript.onload = () => {
                    console.log('Phaser.js 加载成功 (备用CDN)');
                    resolve();
                };
                
                backupScript.onerror = () => {
                    reject(new Error('无法加载 Phaser.js'));
                };
                
                document.head.appendChild(backupScript);
            };
            
            document.head.appendChild(script);
        });
        
    } catch (error) {
        console.error('Phaser.js 加载失败:', error);
        throw error;
    }
}

// 游戏系统初始化
async function initializeGameSystems() {
    console.log('初始化游戏系统...');
    
    try {
        // 动态导入游戏系统
        const [
            { Player },
            { MathematicalConcept },
            { Zone },
            { Logger }
        ] = await Promise.all([
            import('./core/Player.js'),
            import('./core/MathematicalConcept.js'),
            import('./core/Zone.js'),
            import('./core/Logger.js')
        ]);
        
        // 初始化核心系统
        window.gameData.playerSystem = new Player();
        window.gameData.mathConceptSystem = new MathematicalConcept();
        window.gameData.logger = new Logger();
        
        console.log('核心游戏系统初始化完成');
        
        // 触发成功的触觉反馈
        if (window.NativeBridge) {
            window.NativeBridge.triggerHaptic('success');
        }
        
    } catch (error) {
        console.error('游戏系统初始化失败:', error);
        
        // 触发错误的触觉反馈
        if (window.NativeBridge) {
            window.NativeBridge.triggerHaptic('error');
        }
        
        throw error;
    }
}

// 游戏场景加载
async function loadGameScenes() {
    console.log('加载游戏场景...');
    
    try {
        // 动态导入场景
        const scenes = await Promise.all([
            import('./scenes/BootScene.js'),
            import('./scenes/PreloadScene.js'),
            import('./scenes/LoadingScene.js'),
            import('./scenes/LoginScene.js'),
            import('./scenes/MainMenuScene.js'),
            import('./scenes/GameScene.js')
        ]);
        
        console.log('游戏场景加载完成');
        return scenes.map(module => module.default);
        
    } catch (error) {
        console.error('游戏场景加载失败:', error);
        throw error;
    }
}

// 主游戏初始化
async function initializeGame() {
    try {
        console.log('🎮 开始初始化数道仙途...');
        
        // 1. 初始化性能监控
        performanceMonitor.init();
        
        // 2. 初始化原生桥接
        if (window.NativeBridge) {
            window.gameData.isNativeApp = window.NativeBridge.isNativeApp;
            window.gameData.isIOS = window.NativeBridge.isIOS;
            window.gameData.deviceInfo = window.NativeBridge.getDeviceInfo();
            
            console.log('原生桥接初始化完成', {
                isNativeApp: window.gameData.isNativeApp,
                isIOS: window.gameData.isIOS
            });
        }
        
        // 3. 优化游戏配置
        optimizeGameConfig();
        
        // 4. 加载 Phaser.js
        await loadPhaser();
        
        // 5. 初始化游戏系统
        await initializeGameSystems();
        
        // 6. 加载游戏场景
        const scenes = await loadGameScenes();
        
        // 7. 创建 Phaser 游戏实例
        const config = {
            type: Phaser.AUTO,
            width: window.gameConfig.width,
            height: window.gameConfig.height,
            parent: 'game-container',
            backgroundColor: '#0f0f23',
            
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            
            render: {
                antialias: !window.gameConfig.isLowEnd,
                pixelArt: false,
                roundPixels: true,
                transparent: false,
                clearBeforeRender: true,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false,
                powerPreference: window.gameData.isNativeApp ? 'high-performance' : 'default'
            },
            
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: window.gameConfig.debug
                }
            },
            
            audio: {
                disableWebAudio: false,
                context: false
            },
            
            scene: scenes
        };
        
        // 创建游戏实例
        window.game = new Phaser.Game(config);
        
        // 记录加载时间
        performanceMonitor.recordLoadTime();
        
        // 设置游戏状态
        window.gameData.gameStarted = true;
        
        console.log('🎉 数道仙途初始化完成！');
        console.log(`📊 加载时间: ${window.gameData.performanceMetrics.loadTime}ms`);
        
        // 发送初始化完成事件到原生应用
        if (window.NativeBridge) {
            window.NativeBridge.sendMessage('gameInitialized', {
                loadTime: window.gameData.performanceMetrics.loadTime,
                config: window.gameConfig
            });
        }
        
        // 隐藏加载屏幕
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        
        // 显示错误信息
        const loadingText = document.getElementById('loading-text');
        const loadingTips = document.getElementById('loading-tips');
        
        if (loadingText) {
            loadingText.textContent = '游戏初始化失败';
            loadingText.style.color = '#ff6b6b';
        }
        
        if (loadingTips) {
            loadingTips.textContent = `错误: ${error.message}`;
            loadingTips.style.color = '#ff6b6b';
        }
        
        // 发送错误到原生应用
        if (window.NativeBridge) {
            window.NativeBridge.sendMessage('gameInitializationFailed', {
                error: error.message,
                stack: error.stack
            });
            
            window.NativeBridge.triggerHaptic('error');
        }
    }
}

// 窗口大小变化处理
window.addEventListener('resize', () => {
    if (window.game && window.game.scale) {
        window.game.scale.resize(window.innerWidth, window.innerHeight);
    }
    
    // 通知原生应用屏幕尺寸变化
    if (window.NativeBridge) {
        window.NativeBridge.sendMessage('screenSizeChanged', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (window.game && window.game.scene) {
        if (document.hidden) {
            // 页面隐藏时暂停游戏
            window.game.scene.pause();
            console.log('游戏已暂停');
        } else {
            // 页面显示时恢复游戏
            window.game.scene.resume();
            console.log('游戏已恢复');
        }
    }
});

// 启动游戏
console.log('🚀 启动数道仙途 iOS版本...');
initializeGame();