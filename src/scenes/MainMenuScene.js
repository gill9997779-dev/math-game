// Phaser 从全局对象获取
const { Scene } = Phaser;
import { Player } from '../core/Player.js';

export class MainMenuScene extends Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    create() {
        console.log('MainMenuScene 创建中...');
        const { width, height } = this.cameras.main;
        
        // 优先使用主菜单背景图片，否则使用游戏背景图片，最后使用渐变背景
        let bgCreated = false;
        if (this.textures.exists('menu_background')) {
            const bg = this.add.image(width / 2, height / 2, 'menu_background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            bg.setScale(Math.max(scaleX, scaleY));
            bg.setDepth(-1);
            bgCreated = true;
            console.log('✓ 主菜单背景图片已加载');
        } else if (this.textures.exists('game_background')) {
            const bg = this.add.image(width / 2, height / 2, 'game_background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            bg.setScale(Math.max(scaleX, scaleY));
            bg.setDepth(-1);
            bgCreated = true;
            console.log('✓ 使用游戏背景图片作为主菜单背景');
        }
        
        if (!bgCreated) {
            this.createGradientBackground();
            console.log('⚠ 使用渐变背景');
        }
        
        // 创建UI元素（深度100，确保在最上层）
        // 标题 - 金色发光效果，位置在中央上方
        const title = this.add.text(width / 2, height * 0.25, '数道仙途', {
            fontSize: '72px',
            fill: '#FFD700',  // 金色
            fontFamily: 'Microsoft YaHei, Arial, sans-serif',
            stroke: '#FFA500',  // 橙色描边
            strokeThickness: 8,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#FFD700',
                blur: 20,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        title.setDepth(100);
        
        // 添加发光动画效果
        this.tweens.add({
            targets: title,
            alpha: { from: 0.8, to: 1 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // 副标题 - 金色，位置在标题下方
        const subtitle = this.add.text(width / 2, height * 0.25 + 90, '在数学的世界中修仙问道', {
            fontSize: '28px',
            fill: '#FFD700',  // 金色
            fontFamily: 'Microsoft YaHei, Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#FFD700',
                blur: 15,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        subtitle.setDepth(100);
        
        // 按钮位置：中央右侧（根据图片布局）
        const buttonX = width * 0.65;  // 右侧
        const buttonY = height * 0.5;  // 中央
        
        // 创建按钮背景（深色半透明，金色边框，符合图片风格）
        const buttonBg1 = this.add.rectangle(buttonX, buttonY, 280, 70, 0x000000, 0.85);
        buttonBg1.setDepth(99);
        buttonBg1.setStrokeStyle(4, 0xFFD700);  // 金色边框
        buttonBg1.setInteractive({ useHandCursor: true });
        
        const buttonBg2 = this.add.rectangle(buttonX, buttonY + 90, 280, 70, 0x000000, 0.85);
        buttonBg2.setDepth(99);
        buttonBg2.setStrokeStyle(4, 0xFFD700);  // 金色边框
        buttonBg2.setInteractive({ useHandCursor: true });
        
        // 按钮文字样式（白色，金色描边）
        const buttonTextStyle = {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif',
            stroke: '#FFD700',  // 金色描边
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 8,
                stroke: true,
                fill: true
            }
        };
        
        // 开始游戏按钮文字
        const startButton = this.add.text(buttonX, buttonY, '开始游戏', buttonTextStyle)
            .setOrigin(0.5)
            .setDepth(100);
        
        // 设置按钮背景的交互（点击背景也能触发）
        const startButtonHandler = () => {
            console.log('开始游戏按钮被点击');
            if (!window.gameData.player) {
                window.gameData.player = new Player();
            }
            this.scene.start('GameScene');
        };
        
        buttonBg1.on('pointerdown', startButtonHandler);
        
        startButton.setInteractive({ useHandCursor: true });
        startButton.on('pointerdown', startButtonHandler);
        
        startButton.on('pointerover', () => {
            startButton.setScale(1.15);
            startButton.setTint(0xFFD700);  // 金色高亮
            buttonBg1.setFillStyle(0x333333, 0.95);
            buttonBg1.setStrokeStyle(5, 0xFFA500);  // 更亮的金色边框
        });
        
        startButton.on('pointerout', () => {
            startButton.setScale(1.0);
            startButton.clearTint();
            buttonBg1.setFillStyle(0x000000, 0.85);
            buttonBg1.setStrokeStyle(4, 0xFFD700);
        });
        
        buttonBg1.on('pointerover', () => {
            startButton.setScale(1.15);
            startButton.setTint(0xFFD700);
            buttonBg1.setFillStyle(0x333333, 0.95);
            buttonBg1.setStrokeStyle(5, 0xFFA500);
        });
        
        buttonBg1.on('pointerout', () => {
            startButton.setScale(1.0);
            startButton.clearTint();
            buttonBg1.setFillStyle(0x000000, 0.85);
            buttonBg1.setStrokeStyle(4, 0xFFD700);
        });
        
        // 继续游戏按钮文字
        const continueButton = this.add.text(buttonX, buttonY + 90, '继续游戏', buttonTextStyle)
            .setOrigin(0.5)
            .setDepth(100);
        
        // 设置按钮背景的交互
        const continueButtonHandler = async () => {
            console.log('继续游戏按钮被点击');
            await this.loadGame();
            if (window.gameData.player) {
                this.scene.start('GameScene');
            }
        };
        
        buttonBg2.on('pointerdown', continueButtonHandler);
        
        continueButton.setInteractive({ useHandCursor: true });
        continueButton.on('pointerdown', continueButtonHandler);
        
        continueButton.on('pointerover', () => {
            continueButton.setScale(1.15);
            continueButton.setTint(0xFFD700);  // 金色高亮
            buttonBg2.setFillStyle(0x333333, 0.95);
            buttonBg2.setStrokeStyle(5, 0xFFA500);  // 更亮的金色边框
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setScale(1.0);
            continueButton.clearTint();
            buttonBg2.setFillStyle(0x000000, 0.85);
            buttonBg2.setStrokeStyle(4, 0xFFD700);
        });
        
        buttonBg2.on('pointerover', () => {
            continueButton.setScale(1.15);
            continueButton.setTint(0xFFD700);
            buttonBg2.setFillStyle(0x333333, 0.95);
            buttonBg2.setStrokeStyle(5, 0xFFA500);
        });
        
        buttonBg2.on('pointerout', () => {
            continueButton.setScale(1.0);
            continueButton.clearTint();
            buttonBg2.setFillStyle(0x000000, 0.85);
            buttonBg2.setStrokeStyle(4, 0xFFD700);
        });
        
        console.log('✓ 按钮已创建');
        console.log('✓ 开始游戏按钮位置:', startButton.x, startButton.y, '深度:', startButton.depth);
        console.log('✓ 继续游戏按钮位置:', continueButton.x, continueButton.y, '深度:', continueButton.depth);
        console.log('✓ 按钮背景1位置:', buttonBg1.x, buttonBg1.y, '深度:', buttonBg1.depth);
        console.log('✓ 按钮背景2位置:', buttonBg2.x, buttonBg2.y, '深度:', buttonBg2.depth);
        
        // 说明文字 - 底部中央，白色文字
        const description = this.add.text(width / 2, height - 80, '探索世界，发现数学之灵，通过解答数学题目提升修为境界', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif',
            align: 'center',
            wordWrap: { width: 900 },
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 6
            }
        }).setOrigin(0.5);
        description.setDepth(100);
        
        console.log('✓ MainMenuScene 所有UI元素已创建，深度层级已设置');
    }
    
    createGradientBackground() {
        const { width, height } = this.cameras.main;
        // 创建渐变背景（深蓝到深紫）
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
        
        graphics.setDepth(-1);  // 设置为-1，确保在最底层
        console.log('✓ MainMenuScene 渐变背景已创建');
    }
    
    async loadGame() {
        try {
            const response = await fetch('/api/load');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.playerData) {
                    window.gameData.player = Player.fromJSON(data.playerData);
                }
            }
        } catch (error) {
            console.error('加载游戏失败:', error);
        }
    }
}

