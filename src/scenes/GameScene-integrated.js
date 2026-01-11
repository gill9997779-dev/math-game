// 集成在线时长功能的 GameScene
import { OnlineTimeTracker } from '../core/OnlineTimeTracker.js';
import { OnlineTimeUI } from '../core/OnlineTimeUI.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create(data = {}) {
        console.log('=== GameScene create() 被调用 ===');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 检测移动设备
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 初始化基本玩家数据（如果不存在）
        if (!window.gameData.player) {
            window.gameData.player = {
                realm: '炼气',
                realmLevel: 1,
                exp: 0,
                coins: 0,
                x: width / 2,
                y: height / 2,
                gainExp: function(exp) {
                    this.exp += exp;
                    console.log(`获得经验: ${exp}, 总经验: ${this.exp}`);
                }
            };
        }
        
        // 初始化在线时长追踪系统
        if (!window.gameData.onlineTimeTracker) {
            window.gameData.onlineTimeTracker = new OnlineTimeTracker();
        }
        
        // 创建在线时长UI
        this.onlineTimeUI = new OnlineTimeUI(this, window.gameData.onlineTimeTracker);
        
        // 创建背景
        this.createGradientBackground();
        
        // 显示游戏标题
        this.add.text(width / 2, height / 2 - 150, '数道仙途', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // 显示在线时长功能说明
        this.add.text(width / 2, height / 2 - 80, '✅ 在线时长记录功能已集成', {
            fontSize: '24px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        // 显示功能列表
        const features = [
            '⏰ 实时时长追踪',
            '🏆 里程碑奖励系统',
            '😴 智能AFK检测',
            '💾 数据持久化保存',
            '📊 详细统计面板'
        ];
        
        features.forEach((feature, index) => {
            this.add.text(width / 2, height / 2 - 20 + index * 30, feature, {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5);
        });
        
        // 创建简单的玩家角色
        this.playerSprite = this.add.circle(window.gameData.player.x, window.gameData.player.y, 20, 0x4a90e2)
            .setInteractive({ useHandCursor: true });
        
        // 创建UI按钮
        this.createUI();
        
        // 键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // 返回主菜单按钮
        const returnBtn = this.add.text(50, 30, '返回主页', {
            fontSize: '20px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: '#1a1a1a',
            padding: { x: 15, y: 10 },
            stroke: '#FFD700',
            strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(100).setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerover', () => {
            returnBtn.setTint(0xFFD700);
            returnBtn.setScale(1.05);
        });
        
        returnBtn.on('pointerout', () => {
            returnBtn.clearTint();
            returnBtn.setScale(1.0);
        });
        
        returnBtn.on('pointerdown', () => {
            if (confirm('确定要返回主菜单吗？')) {
                this.scene.start('MainMenuScene');
            }
        });
        
        Logger.info('GameScene 初始化完成 - 在线时长功能已集成');
    }
    
    createGradientBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const graphics = this.add.graphics();
        const steps = 100;
        const color1 = 0x1a1a2e;  // 深蓝色
        const color2 = 0x2d1b4e;  // 深紫色
        
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const r1 = (color1 >> 16) & 0xFF;
            const g1 = (color1 >> 8) & 0xFF;
            const b1 = color1 & 0xFF;
            const r2 = (color2 >> 16) & 0xFF;
            const g2 = (color2 >> 8) & 0xFF;
            const b2 = color2 & 0xFF;
            
            const r = Math.floor(r1 + (r2 - r1) * ratio);
            const g = Math.floor(g1 + (g2 - g1) * ratio);
            const b = Math.floor(b1 + (b2 - b1) * ratio);
            
            const color = (r << 16) | (g << 8) | b;
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, (height / steps) * i, width, height / steps);
        }
        
        graphics.setDepth(0);
    }
    
    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const player = window.gameData.player;
        
        // 玩家信息面板
        const infoPanel = this.add.container(50, height - 100);
        
        // 境界显示
        this.realmText = this.add.text(0, 0, `境界: ${player.realm} ${player.realmLevel}层`, {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        });
        
        // 经验显示
        this.expText = this.add.text(0, 40, `修为: ${player.exp}`, {
            fontSize: '16px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 8 }
        });
        
        infoPanel.add([this.realmText, this.expText]);
        
        // 测试按钮
        const testBtn = this.add.text(width - 100, height - 100, '测试奖励', {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#50e3c2',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        testBtn.on('pointerdown', () => {
            // 测试里程碑奖励
            player.gainExp(50);
            this.updateUI();
            
            // 显示奖励提示
            const rewardText = this.add.text(width / 2, height / 2 + 200, '获得 50 修为！', {
                fontSize: '20px',
                fill: '#FFD700',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5).setDepth(200);
            
            this.tweens.add({
                targets: rewardText,
                alpha: 0,
                y: rewardText.y - 50,
                duration: 2000,
                onComplete: () => rewardText.destroy()
            });
        });
    }
    
    update(time, delta) {
        const player = window.gameData.player;
        if (!player) return;
        
        const speed = 3;
        
        // 移动控制
        if (this.cursors && this.cursors.left.isDown || this.wasd && this.wasd.A.isDown) {
            this.playerSprite.x -= speed;
            player.x = this.playerSprite.x;
        }
        if (this.cursors && this.cursors.right.isDown || this.wasd && this.wasd.D.isDown) {
            this.playerSprite.x += speed;
            player.x = this.playerSprite.x;
        }
        if (this.cursors && this.cursors.up.isDown || this.wasd && this.wasd.W.isDown) {
            this.playerSprite.y -= speed;
            player.y = this.playerSprite.y;
        }
        if (this.cursors && this.cursors.down.isDown || this.wasd && this.wasd.S.isDown) {
            this.playerSprite.y += speed;
            player.y = this.playerSprite.y;
        }
        
        // 定期更新UI（节流）
        if (!this.lastUIUpdate) {
            this.lastUIUpdate = 0;
        }
        if (time - this.lastUIUpdate > 1000) {
            this.lastUIUpdate = time;
            this.updateUI();
        }
    }
    
    updateUI() {
        const player = window.gameData.player;
        if (this.realmText) {
            this.realmText.setText(`境界: ${player.realm} ${player.realmLevel}层`);
        }
        if (this.expText) {
            this.expText.setText(`修为: ${player.exp}`);
        }
    }
    
    /**
     * 场景销毁时的清理工作
     */
    shutdown() {
        // 清理在线时长UI
        if (this.onlineTimeUI) {
            this.onlineTimeUI.destroy();
            this.onlineTimeUI = null;
        }
        
        // 注意：不要销毁全局的onlineTimeTracker，因为它需要在整个游戏生命周期中保持活跃
        Logger.info('GameScene 清理完成');
    }
}