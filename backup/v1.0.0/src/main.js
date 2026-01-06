// Phaser 从 CDN 加载，不需要 import
// import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene.js';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { LoginScene } from './scenes/LoginScene.js';
import { LoadingScene } from './scenes/LoadingScene.js';
import { GameScene } from './scenes/GameScene.js';
import { AdventureScene } from './scenes/AdventureScene.js';
import { MathChallengeScene } from './scenes/MathChallengeScene.js';
import { InventoryScene } from './scenes/InventoryScene.js';
import { CraftingScene } from './scenes/CraftingScene.js';
import { SkillScene } from './scenes/SkillScene.js';
import { MathCombatScene } from './scenes/MathCombatScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { PerkSelectionScene } from './scenes/PerkSelectionScene.js';
import { GuideScene } from './scenes/GuideScene.js';

// 游戏配置
// 检测移动设备，调整性能设置
// iPad检测：iPadOS 13+的User-Agent可能包含"Macintosh"和"Mobile"，需要特殊处理
function detectMobileDevice() {
    const ua = navigator.userAgent;
    
    // 1. 直接检测移动设备标识
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        return true;
    }
    
    // 2. 检测iPadOS 13+（User-Agent包含"Macintosh"和"Mobile"）
    if (/Macintosh/i.test(ua) && /Mobile/i.test(ua)) {
        return true;  // iPadOS 13+
    }
    
    // 3. 检测触摸支持（iPad有触摸屏）
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // 进一步验证：检查屏幕尺寸（移动设备通常较小）
        // iPad的屏幕通常小于桌面显示器
        const isSmallScreen = window.screen.width <= 1366 || window.screen.height <= 1024;
        if (isSmallScreen) {
            return true;
        }
    }
    
    return false;
}

const isMobile = detectMobileDevice();

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    // 移动端性能优化
    fps: {
        target: isMobile ? 30 : 60,  // 移动端降低帧率
        forceSetTimeOut: isMobile  // 移动端使用setTimeout而非requestAnimationFrame
    },
    render: {
        antialias: !isMobile,  // 移动端禁用抗锯齿
        pixelArt: false,
        roundPixels: isMobile  // 移动端像素对齐，提高性能
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // 主场景无重力，战斗场景中掉落物有速度
            debug: false
        }
    },
    scene: [
        PreloadScene,  // 资源预加载场景（放在最前面）
        BootScene,
        MainMenuScene,
        LoginScene,  // 登录/用户名选择场景
        LoadingScene,  // 加载动画场景
        GameScene,
        AdventureScene,  // 冒险场景（整合所有副本）
        MathChallengeScene,  // 保留旧场景（可选）
        MathCombatScene,  // 新的弹幕战斗场景
        BattleScene,  // 回合制对战场景
        PerkSelectionScene,  // 词条选择场景
        InventoryScene,
        CraftingScene,
        SkillScene,
        GuideScene  // 攻略场景
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 确保 Phaser 已加载
let game = null;

// 初始化游戏函数
function initializeGame() {
    if (typeof Phaser === 'undefined') {
        console.error('错误：Phaser 未加载！请检查 CDN 连接。');
        if (typeof document !== 'undefined') {
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.textContent = '错误：游戏引擎未加载';
                loadingEl.style.color = '#ff6b6b';
            }
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
        game.events.once('ready', () => {
            console.log('✓ 游戏已准备就绪');
            console.log('场景管理器:', game.scene);
            
            // 检查场景是否已注册
            const scenes = game.scene.scenes;
            console.log('已注册的场景数量:', scenes.length);
            scenes.forEach((scene, index) => {
                console.log(`场景 ${index}:`, scene.scene ? scene.scene.key : '未知');
            });
            
            // 确保第一个场景启动（Phaser 3 应该自动启动第一个场景）
            // 但为了确保，我们手动检查并启动
            setTimeout(() => {
                const bootScene = game.scene.getScene('BootScene');
                if (bootScene) {
                    const sceneManager = bootScene.scene;
                    if (sceneManager && sceneManager.isActive()) {
                        console.log('✓ BootScene 场景已激活');
                    } else {
                        console.log('⚠ BootScene 存在但未激活，手动启动...');
                        try {
                            game.scene.start('BootScene');
                            console.log('✓ 已手动启动 BootScene');
                        } catch (err) {
                            console.error('启动 BootScene 失败:', err);
                        }
                    }
                } else {
                    console.warn('⚠ BootScene 不存在，尝试启动...');
                    try {
                        game.scene.start('BootScene');
                    } catch (err) {
                        console.error('启动 BootScene 失败:', err);
                    }
                }
            }, 300);
            
            // 隐藏加载提示
            if (typeof document !== 'undefined') {
                const loadingEl = document.getElementById('loading');
                if (loadingEl) {
                    setTimeout(() => {
                        loadingEl.style.display = 'none';
                    }, 1500);
                }
            }
        });
        
        // 监听场景启动事件（需要等待场景管理器初始化）
        if (game.scene && game.scene.events) {
            game.scene.events.on('start', (key) => {
                console.log('✓ 场景启动事件:', key);
            });
            
            game.scene.events.on('create', (key) => {
                console.log('✓ 场景创建事件:', key);
            });
        }
        
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
    const checkPhaser = setInterval(() => {
        if (typeof Phaser !== 'undefined') {
            clearInterval(checkPhaser);
            initializeGame();
        }
    }, 100);
    
    // 10秒超时
    setTimeout(() => {
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

export { game };

