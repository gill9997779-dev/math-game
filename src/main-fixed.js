// 修复版本的 main.js - 使用简化的场景
console.log('开始加载 main-fixed.js...');

// 首先只导入最基本的场景
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene-simple.js';

console.log('基本场景导入成功');

// 游戏配置 - 简化版本
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [
        BootScene,
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
        return;
    }

    try {
        console.log('准备创建 Phaser 游戏...');
        
        // 全局游戏数据
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
        game = new Phaser.Game(config);
        console.log('✓ Phaser 游戏实例创建成功');
        
        // 监听游戏就绪事件
        game.events.once('ready', function() {
            console.log('✓ 游戏已准备就绪');
            
            setTimeout(function() {
                try {
                    game.scene.start('BootScene');
                    console.log('✓ BootScene 启动成功');
                } catch (err) {
                    console.error('启动 BootScene 失败:', err);
                }
            }, 300);
        });
        
    } catch (error) {
        console.error('✗ 创建游戏失败:', error);
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
        }
    }, 10000);
}

export { game };