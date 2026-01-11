// 集成在线时长功能的完整版本
console.log('开始加载 main-integrated.js...');

// 导入基本场景
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { LoginScene } from './scenes/LoginScene.js';
import { GameScene } from './scenes/GameScene-integrated.js';

console.log('基本场景导入成功');

// 游戏配置
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    fps: {
        target: isMobile ? 30 : 60,
        forceSetTimeOut: isMobile
    },
    render: {
        antialias: !isMobile,
        pixelArt: false,
        roundPixels: isMobile
    },
    scene: [
        BootScene,
        MainMenuScene,
        LoginScene,
        GameScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 确保 Phaser 已加载
let game = null;

function initializeGame() {
    if (typeof Phaser === 'undefined') {
        console.error('错误：Phaser 未加载！');
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.textContent = '错误：游戏引擎未加载';
            loadingEl.style.color = '#ff6b6b';
        }
        return;
    }

    try {
        console.log('准备创建 Phaser 游戏...');
        console.log('配置:', config);
        
        // 全局游戏数据（在创建游戏前初始化）
        if (!window.gameData) {
            window.gameData = {
                player: null,
                currentZone: null,
                inventory: [],
                settings: {
                    soundEnabled: true,
                    musicEnabled: true
                }
            };
        }
        
        // 初始化游戏
        console.log('开始创建 Phaser.Game...');
        game = new Phaser.Game(config);
        console.log('✓ Phaser 游戏实例创建成功');
        console.log('游戏对象:', game);
        
        // 监听游戏就绪事件
        game.events.once('ready', function() {
            console.log('✓ 游戏已准备就绪');
            console.log('场景管理器:', game.scene);
            
            // 检查场景是否已注册
            const scenes = game.scene.scenes;
            console.log('已注册的场景数量:', scenes.length);
            scenes.forEach(function(scene, index) {
                console.log(`场景 ${index}:`, scene.scene ? scene.scene.key : '未知');
            });
            
            // 启动第一个场景
            setTimeout(function() {
                try {
                    game.scene.start('BootScene');
                    console.log('✓ BootScene 启动成功');
                } catch (err) {
                    console.error('启动 BootScene 失败:', err);
                }
            }, 300);
            
            // 隐藏加载提示
            if (typeof document !== 'undefined') {
                const loadingEl = document.getElementById('loading');
                if (loadingEl) {
                    setTimeout(function() {
                        loadingEl.style.display = 'none';
                    }, 1500);
                }
            }
        });
        
    } catch (error) {
        console.error('✗ 创建游戏失败:', error);
        console.error('错误堆栈:', error.stack);
        if (typeof document !== 'undefined') {
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.innerHTML = '创建游戏失败: ' + error.message + '<br>请查看控制台获取详细信息';
                loadingEl.style.color = '#ff6b6b';
            }
        }
    }
}

// 如果 Phaser 已加载，立即初始化
if (typeof Phaser !== 'undefined') {
    initializeGame();
} else {
    // 等待 Phaser 加载
    const checkPhaser = setInterval(function() {
        if (typeof Phaser !== 'undefined') {
            clearInterval(checkPhaser);
            initializeGame();
        }
    }, 100);
    
    // 10秒超时
    setTimeout(function() {
        clearInterval(checkPhaser);
        if (typeof Phaser === 'undefined') {
            console.error('Phaser 加载超时');
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.innerHTML = 'Phaser 加载超时，请刷新页面';
                loadingEl.style.color = '#ff6b6b';
            }
        }
    }, 10000);
}

// 添加页面卸载时的清理逻辑
window.addEventListener('beforeunload', function() {
    console.log('页面即将卸载，清理在线时长追踪器...');
    
    // 清理在线时长追踪器
    if (window.gameData && window.gameData.onlineTimeTracker) {
        window.gameData.onlineTimeTracker.destroy();
        window.gameData.onlineTimeTracker = null;
    }
    
    // 销毁游戏实例
    if (game) {
        try {
            game.destroy(true);
        } catch (error) {
            console.error('销毁游戏实例时出错:', error);
        }
    }
});

// 添加页面可见性变化监听
document.addEventListener('visibilitychange', function() {
    if (window.gameData && window.gameData.onlineTimeTracker) {
        if (document.hidden) {
            console.log('页面隐藏，暂停时长追踪');
        } else {
            console.log('页面显示，恢复时长追踪');
        }
    }
});

export { game };