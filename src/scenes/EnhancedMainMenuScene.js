// Phaser 从全局对象获取
import { UIComponents } from '../core/UIComponents.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 增强版主菜单场景
 * 现代化UI设计，流畅动画，丰富交互
 */
export class EnhancedMainMenuScene extends Scene {
    constructor() {
        super({ key: 'EnhancedMainMenuScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.width = width;
        this.height = height;
        
        // UI组件
        this.ui = new UIComponents(this);
        
        // 创建动态背景
        this.createAnimatedBackground();
        
        // 创建标题
        this.createTitle();
        
        // 创建菜单按钮
        this.createMenuButtons();
        
        // 创建装饰元素
        this.createDecorations();
        
        // 创建版本信息
        this.createVersionInfo();
        
        // 播放入场动画
        this.playEntranceAnimation();
        
        Logger.info('EnhancedMainMenuScene 创建完成');
    }
    
    createAnimatedBackground() {
        // 渐变背景
        const graphics = this.add.graphics();
        this.drawGradientBackground(graphics, 0x0f0c29, 0x302b63, 0x24243e);
        graphics.setDepth(0);
        
        // 星空粒子
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.width),
                Phaser.Math.Between(0, this.height),
                Phaser.Math.Between(1, 3),
                0xFFFFFF,
                Phaser.Math.FloatBetween(0.3, 0.8)
            );
            star.setDepth(1);
            
            // 闪烁动画
            this.tweens.add({
                targets: star,
                alpha: { from: star.alpha, to: Phaser.Math.FloatBetween(0.1, 0.5) },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
            
            this.stars.push(star);
        }
        
        // 流动的光线
        this.createFlowingLights();
    }
    
    drawGradientBackground(graphics, color1, color2, color3) {
        const steps = 100;
        
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            let color;
            
            if (ratio < 0.5) {
                // 从 color1 到 color2
                const r = ratio * 2;
                color = this.lerpColor(color1, color2, r);
            } else {
                // 从 color2 到 color3
                const r = (ratio - 0.5) * 2;
                color = this.lerpColor(color2, color3, r);
            }
            
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, (this.height / steps) * i, this.width, this.height / steps + 1);
        }
    }
    
    lerpColor(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;
        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;
        
        const r = Math.floor(r1 + (r2 - r1) * ratio);
        const g = Math.floor(g1 + (g2 - g1) * ratio);
        const b = Math.floor(b1 + (b2 - b1) * ratio);
        
        return (r << 16) | (g << 8) | b;
    }
    
    createFlowingLights() {
        // 创建几条流动的光线
        for (let i = 0; i < 3; i++) {
            const light = this.add.graphics();
            light.setDepth(2);
            
            const startY = Phaser.Math.Between(100, this.height - 100);
            const color = [0x667EEA, 0x764BA2, 0x50E3C2][i];
            
            // 绘制光线
            light.lineStyle(2, color, 0.3);
            light.beginPath();
            light.moveTo(-100, startY);
            
            // 波浪形路径
            for (let x = 0; x <= this.width + 200; x += 50) {
                const y = startY + Math.sin(x * 0.01) * 50;
                light.lineTo(x, y);
            }
            light.strokePath();
            
            // 移动动画
            light.x = -200;
            this.tweens.add({
                targets: light,
                x: 200,
                duration: 10000 + i * 2000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }
    
    createTitle() {
        // 标题容器
        this.titleContainer = this.add.container(this.width / 2, 150);
        this.titleContainer.setDepth(10);
        
        // 主标题
        const mainTitle = this.add.text(0, 0, '数道仙途', {
            fontSize: '72px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            fontWeight: 'bold',
            stroke: '#667EEA',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // 副标题
        const subTitle = this.add.text(0, 60, '— 数学修仙之旅 —', {
            fontSize: '24px',
            fill: '#B8B8D1',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5);
        
        // 光晕效果
        const glow = this.add.graphics();
        glow.fillStyle(0x667EEA, 0.1);
        glow.fillCircle(0, 30, 150);
        
        this.titleContainer.add([glow, mainTitle, subTitle]);
        
        // 标题浮动动画
        this.tweens.add({
            targets: this.titleContainer,
            y: 140,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createMenuButtons() {
        // 菜单容器
        this.menuContainer = this.add.container(this.width / 2, 420);
        this.menuContainer.setDepth(20);
        
        const buttons = [
            { text: '开始修炼', icon: '⚔️', action: () => this.startGame() },
            { text: '继续修炼', icon: '📜', action: () => this.continueGame() },
            { text: '修炼指南', icon: '📖', action: () => this.showGuide() },
            { text: '设置', icon: '⚙️', action: () => this.showSettings() }
        ];
        
        buttons.forEach((btn, index) => {
            const button = this.createMenuButton(0, index * 80, btn.text, btn.icon, btn.action);
            this.menuContainer.add(button);
        });
    }
    
    createMenuButton(x, y, text, icon, onClick) {
        const container = this.add.container(x, y);
        
        // 按钮背景
        const bg = this.add.graphics();
        this.drawButtonGradient(bg, -150, -30, 300, 60);
        
        // 边框
        bg.lineStyle(2, 0xFFFFFF, 0.3);
        bg.strokeRoundedRect(-150, -30, 300, 60, 10);
        
        // 图标
        const iconText = this.add.text(-120, 0, icon, {
            fontSize: '28px'
        }).setOrigin(0.5);
        
        // 文字
        const buttonText = this.add.text(10, 0, text, {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 箭头
        const arrow = this.add.text(130, 0, '→', {
            fontSize: '24px',
            fill: '#667EEA'
        }).setOrigin(0.5);
        arrow.setAlpha(0);
        
        container.add([bg, iconText, buttonText, arrow]);
        
        // 交互区域
        const hitArea = this.add.rectangle(0, 0, 300, 60, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);
        
        // 悬停效果
        hitArea.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                x: x + 10,
                scale: 1.05,
                duration: 150
            });
            this.tweens.add({
                targets: arrow,
                alpha: 1,
                x: 140,
                duration: 150
            });
            bg.clear();
            this.drawButtonGradient(bg, -150, -30, 300, 60, true);
            bg.lineStyle(2, 0xFFD700, 0.8);
            bg.strokeRoundedRect(-150, -30, 300, 60, 10);
        });
        
        hitArea.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                x: x,
                scale: 1,
                duration: 150
            });
            this.tweens.add({
                targets: arrow,
                alpha: 0,
                x: 130,
                duration: 150
            });
            bg.clear();
            this.drawButtonGradient(bg, -150, -30, 300, 60);
            bg.lineStyle(2, 0xFFFFFF, 0.3);
            bg.strokeRoundedRect(-150, -30, 300, 60, 10);
        });
        
        hitArea.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: onClick
            });
        });
        
        return container;
    }
    
    drawButtonGradient(graphics, x, y, width, height, hover = false) {
        const color1 = hover ? 0x764BA2 : 0x667EEA;
        const color2 = hover ? 0x667EEA : 0x764BA2;
        const steps = 10;
        
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const color = this.lerpColor(color1, color2, ratio);
            graphics.fillStyle(color, hover ? 0.9 : 0.7);
            graphics.fillRoundedRect(x, y + (height / steps) * i, width, height / steps + 1, 10);
        }
    }
    
    createDecorations() {
        // 左侧装饰
        const leftDeco = this.add.text(50, this.height / 2, '☯', {
            fontSize: '120px',
            fill: '#667EEA'
        }).setOrigin(0.5).setAlpha(0.1).setDepth(3);
        
        this.tweens.add({
            targets: leftDeco,
            rotation: Math.PI * 2,
            duration: 20000,
            repeat: -1
        });
        
        // 右侧装饰
        const rightDeco = this.add.text(this.width - 50, this.height / 2, '☯', {
            fontSize: '120px',
            fill: '#764BA2'
        }).setOrigin(0.5).setAlpha(0.1).setDepth(3);
        
        this.tweens.add({
            targets: rightDeco,
            rotation: -Math.PI * 2,
            duration: 20000,
            repeat: -1
        });
        
        // 底部装饰线
        const bottomLine = this.add.graphics();
        bottomLine.lineStyle(2, 0x667EEA, 0.5);
        bottomLine.beginPath();
        bottomLine.moveTo(100, this.height - 80);
        bottomLine.lineTo(this.width - 100, this.height - 80);
        bottomLine.strokePath();
        bottomLine.setDepth(5);
    }
    
    createVersionInfo() {
        // 版本信息
        this.add.text(this.width - 20, this.height - 20, 'v2.0.0', {
            fontSize: '14px',
            fill: '#666666',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(1, 1).setDepth(10);
        
        // 提示信息
        this.add.text(this.width / 2, this.height - 40, '按 ESC 退出 | 方向键/WASD 移动 | 数字键快速选择', {
            fontSize: '14px',
            fill: '#666666',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5).setDepth(10);
    }
    
    playEntranceAnimation() {
        // 标题入场
        this.titleContainer.setY(-100);
        this.titleContainer.setAlpha(0);
        this.tweens.add({
            targets: this.titleContainer,
            y: 150,
            alpha: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });
        
        // 菜单入场
        this.menuContainer.setX(this.width + 200);
        this.tweens.add({
            targets: this.menuContainer,
            x: this.width / 2,
            duration: 600,
            delay: 300,
            ease: 'Power2'
        });
    }
    
    startGame() {
        Logger.info('开始新游戏');
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('LoginScene', { isNewGame: true });
        });
    }
    
    continueGame() {
        Logger.info('继续游戏');
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('LoginScene', { isNewGame: false });
        });
    }
    
    showGuide() {
        Logger.info('显示指南');
        this.scene.start('GuideScene');
    }
    
    showSettings() {
        Logger.info('显示设置');
        // 创建设置面板
        this.createSettingsPanel();
    }
    
    createSettingsPanel() {
        const overlay = this.add.rectangle(this.width/2, this.height/2, 
            this.width, this.height, 0x000000, 0.7);
        overlay.setDepth(100);
        overlay.setInteractive();
        
        const panel = this.add.container(this.width/2, this.height/2);
        panel.setDepth(101);
        
        // 面板背景
        const bg = this.add.rectangle(0, 0, 500, 400, 0x1a1a2e, 0.98);
        bg.setStrokeStyle(3, 0x667eea);
        
        // 标题
        const title = this.add.text(0, -160, '⚙️ 设置', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 音效开关
        const soundLabel = this.add.text(-150, -80, '音效', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0, 0.5);
        
        const soundToggle = this.createToggle(100, -80, window.gameData?.settings?.soundEnabled ?? true, (value) => {
            if (window.gameData?.settings) {
                window.gameData.settings.soundEnabled = value;
            }
        });
        
        // 音乐开关
        const musicLabel = this.add.text(-150, -20, '音乐', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0, 0.5);
        
        const musicToggle = this.createToggle(100, -20, window.gameData?.settings?.musicEnabled ?? true, (value) => {
            if (window.gameData?.settings) {
                window.gameData.settings.musicEnabled = value;
            }
        });
        
        // 关闭按钮
        const closeBtn = this.add.text(0, 150, '关闭', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: '#667eea',
            padding: { x: 40, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => closeBtn.setTint(0x764ba2));
        closeBtn.on('pointerout', () => closeBtn.clearTint());
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
        });
        
        panel.add([bg, title, soundLabel, soundToggle, musicLabel, musicToggle, closeBtn]);
        
        // 入场动画
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }
    
    createToggle(x, y, initialValue, onChange) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 60, 30, initialValue ? 0x50E3C2 : 0x666666, 1);
        bg.setStrokeStyle(2, 0xFFFFFF, 0.3);
        
        const knob = this.add.circle(initialValue ? 15 : -15, 0, 12, 0xFFFFFF, 1);
        
        container.add([bg, knob]);
        
        let isOn = initialValue;
        
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
            isOn = !isOn;
            
            this.tweens.add({
                targets: knob,
                x: isOn ? 15 : -15,
                duration: 150
            });
            
            bg.setFillStyle(isOn ? 0x50E3C2 : 0x666666, 1);
            
            onChange(isOn);
        });
        
        return container;
    }
}

export default EnhancedMainMenuScene;
