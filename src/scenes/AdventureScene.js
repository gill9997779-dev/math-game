// Phaser 从全局对象获取
import { DynamicBackground } from '../core/DynamicBackground.js';
import { Logger } from '../core/Logger.js';

const { Scene } = Phaser;

/**
 * 冒险场景 - 整合所有副本和挑战
 * 提供统一的入口选择不同的冒险模式
 */
export class AdventureScene extends Scene {
    constructor() {
        super({ key: 'AdventureScene' });
    }
    
    create() {
        Logger.info('AdventureScene 创建中...');
        const { width, height } = this.cameras.main;
        
        // 创建动态背景
        this.dynamicBg = new DynamicBackground(this);
        this.dynamicBg.create();
        
        // 标题
        const title = this.add.text(width / 2, height * 0.15, '冒险秘境', {
            fontSize: '64px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#FFA500',
            strokeThickness: 6,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#FFD700',
                blur: 20,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(100);
        
        // 副标题
        const subtitle = this.add.text(width / 2, height * 0.15 + 80, '选择你的冒险方式', {
            fontSize: '24px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(100);
        
        const player = window.gameData.player;
        const centerY = height * 0.5;
        const buttonSpacing = 120;
        const startY = centerY - 60;
        
        // 1. 弹幕战斗（数学之灵挑战）
        this.createAdventureButton(
            width / 2, 
            startY, 
            '弹幕战斗',
            '与数学之灵战斗，躲避错误答案，收集正确答案',
            '#4a90e2',
            () => this.startMathCombat()
        );
        
        // 2. 限时挑战
        this.createAdventureButton(
            width / 2, 
            startY + buttonSpacing, 
            '限时挑战',
            '在限定时间内解答尽可能多的题目',
            '#50e3c2',
            () => this.startTimeChallenge()
        );
        
        // 3. 数学挑战（传统答题）
        this.createAdventureButton(
            width / 2, 
            startY + buttonSpacing * 2, 
            '数学挑战',
            '传统的数学答题挑战模式',
            '#ffa500',
            () => this.startMathChallenge()
        );
        
        // 返回按钮
        const backBtn = this.add.text(width / 2, height - 80, '返回', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#666666',
            padding: { x: 30, y: 12 },
            stroke: '#FFD700',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(100);
        backBtn.setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerover', () => {
            backBtn.setTint(0xcccccc);
            backBtn.setScale(1.05);
        });
        backBtn.on('pointerout', () => {
            backBtn.clearTint();
            backBtn.setScale(1.0);
        });
        backBtn.on('pointerdown', () => {
            this.scene.stop();
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                gameScene.scene.resume();
            }
        });
    }
    
    /**
     * 创建冒险按钮
     */
    createAdventureButton(x, y, title, description, color, callback) {
        const { width } = this.cameras.main;
        
        // 按钮背景
        const buttonBg = this.add.rectangle(x, y, width * 0.6, 100, 0x1a1a1a, 0.9);
        buttonBg.setStrokeStyle(3, color);
        buttonBg.setDepth(100);
        buttonBg.setInteractive({ useHandCursor: true });
        
        // 标题
        const titleText = this.add.text(x - width * 0.25, y - 20, title, {
            fontSize: '28px',
            fill: color,
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(101);
        
        // 描述
        const descText = this.add.text(x - width * 0.25, y + 20, description, {
            fontSize: '16px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            wordWrap: { width: width * 0.5 }
        }).setOrigin(0, 0.5).setDepth(101);
        
        // 悬停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x2a2a2a, 0.95);
            buttonBg.setScale(1.02);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x1a1a1a, 0.9);
            buttonBg.setScale(1.0);
        });
        buttonBg.on('pointerdown', () => {
            callback();
        });
        
        // 点击标题和描述也触发
        titleText.setInteractive({ useHandCursor: true });
        descText.setInteractive({ useHandCursor: true });
        titleText.on('pointerdown', callback);
        descText.on('pointerdown', callback);
    }
    
    /**
     * 开始弹幕战斗
     */
    startMathCombat() {
        Logger.info('开始弹幕战斗');
        const player = window.gameData.player;
        
        // 获取当前区域的数学之灵
        const zoneManager = window.gameData.zoneManager;
        const currentZone = zoneManager.getZone(player.currentZone) || zoneManager.getZone('青石村');
        const spirits = currentZone.spirits || [];
        
        if (spirits.length === 0) {
            this.showMessage('当前区域没有可挑战的数学之灵', '#ff6b6b');
            return;
        }
        
        // 选择第一个数学之灵（或可以扩展为选择界面）
        const spirit = spirits[0];
        window.gameData.currentSpirit = spirit;
        
        // 暂停当前场景并启动战斗场景
        this.scene.pause();
        this.scene.launch('MathCombatScene');
    }
    
    /**
     * 开始限时挑战
     */
    startTimeChallenge() {
        Logger.info('开始限时挑战');
        const challengeSystem = window.gameData.challengeSystem;
        
        if (!challengeSystem) {
            this.showMessage('挑战系统未初始化', '#ff6b6b');
            return;
        }
        
        // 检查是否已有进行中的挑战
        if (challengeSystem.activeChallenge) {
            this.showMessage('已有进行中的挑战，请先完成或取消', '#ffa500');
            return;
        }
        
        // 显示难度选择对话框
        this.showDifficultyDialog((difficulty, timeLimit) => {
            challengeSystem.startChallenge(difficulty, timeLimit);
            window.gameData.isChallengeMode = true;
            
            // 启动数学挑战场景
            this.scene.pause();
            this.scene.launch('MathChallengeScene');
        });
    }
    
    /**
     * 开始数学挑战（传统模式）
     */
    startMathChallenge() {
        Logger.info('开始数学挑战');
        const player = window.gameData.player;
        
        // 获取当前区域的数学之灵
        const zoneManager = window.gameData.zoneManager;
        const currentZone = zoneManager.getZone(player.currentZone) || zoneManager.getZone('青石村');
        const spirits = currentZone.spirits || [];
        
        if (spirits.length === 0) {
            this.showMessage('当前区域没有可挑战的数学之灵', '#ff6b6b');
            return;
        }
        
        // 选择第一个数学之灵
        const spirit = spirits[0];
        window.gameData.currentSpirit = spirit;
        
        // 启动数学挑战场景
        this.scene.pause();
        this.scene.launch('MathChallengeScene');
    }
    
    /**
     * 显示难度选择对话框
     */
    showDifficultyDialog(callback) {
        const { width, height } = this.cameras.main;
        
        // 对话框背景
        const dialogBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0x000000, 0.95);
        dialogBg.setStrokeStyle(3, 0xffa500);
        dialogBg.setDepth(200);
        dialogBg.setInteractive({ useHandCursor: false });
        
        // 标题
        const title = this.add.text(width / 2, height / 2 - 150, '选择挑战难度', {
            fontSize: '32px',
            fill: '#ffa500',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(201);
        
        // 难度选项
        const difficulties = [
            { name: '简单', difficulty: 1, timeLimit: 90, color: '#50e3c2' },
            { name: '普通', difficulty: 2, timeLimit: 60, color: '#4a90e2' },
            { name: '困难', difficulty: 3, timeLimit: 45, color: '#ffa500' },
            { name: '极难', difficulty: 4, timeLimit: 30, color: '#ff6b6b' }
        ];
        
        const buttons = [];
        difficulties.forEach((diff, index) => {
            const btnY = height / 2 - 50 + index * 60;
            const btn = this.add.text(width / 2, btnY, `${diff.name} (${diff.timeLimit}秒)`, {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                backgroundColor: diff.color,
                padding: { x: 30, y: 12 },
                stroke: '#FFD700',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(201);
            btn.setInteractive({ useHandCursor: true });
            
            btn.on('pointerover', () => {
                btn.setTint(0xcccccc);
                btn.setScale(1.05);
            });
            btn.on('pointerout', () => {
                btn.clearTint();
                btn.setScale(1.0);
            });
            btn.on('pointerdown', () => {
                // 关闭对话框
                dialogBg.destroy();
                title.destroy();
                buttons.forEach(b => b.destroy());
                cancelBtn.destroy();
                
                // 调用回调
                callback(diff.difficulty, diff.timeLimit);
            });
            
            buttons.push(btn);
        });
        
        // 取消按钮
        const cancelBtn = this.add.text(width / 2, height / 2 + 150, '取消', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#666666',
            padding: { x: 30, y: 12 },
            stroke: '#FFD700',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(201);
        cancelBtn.setInteractive({ useHandCursor: true });
        
        cancelBtn.on('pointerover', () => {
            cancelBtn.setTint(0xcccccc);
            cancelBtn.setScale(1.05);
        });
        cancelBtn.on('pointerout', () => {
            cancelBtn.clearTint();
            cancelBtn.setScale(1.0);
        });
        cancelBtn.on('pointerdown', () => {
            dialogBg.destroy();
            title.destroy();
            buttons.forEach(b => b.destroy());
            cancelBtn.destroy();
        });
    }
    
    /**
     * 显示消息
     */
    showMessage(message, color = '#50e3c2') {
        const { width, height } = this.cameras.main;
        
        const text = this.add.text(width / 2, height / 2, message, {
            fontSize: '20px',
            fill: color,
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: { x: 20, y: 15 },
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(200);
        
        this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 3000,
            onComplete: () => text.destroy()
        });
    }
    
    shutdown() {
        if (this.dynamicBg) {
            this.dynamicBg.destroy();
        }
    }
}

