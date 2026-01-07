// Phaser 从全局对象获取
import { ProblemBank } from '../core/MathProblem.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 互动式数学挑战场景
 * 多种答题模式：选择、拖拽、连线、快速输入
 * 丰富的视觉反馈和动画效果
 */
export class InteractiveMathScene extends Scene {
    constructor() {
        super({ key: 'InteractiveMathScene' });
    }
    
    create(data = {}) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.width = width;
        this.height = height;
        
        // 获取玩家数据
        this.playerData = window.gameData.player;
        this.spirit = window.gameData.currentSpirit || { name: '数学之灵', difficulty: 1 };
        
        // 游戏状态
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = 60; // 60秒限时
        this.isGameOver = false;
        this.problemCount = 0;
        this.correctCount = 0;
        
        // 答题模式：'choice', 'drag', 'connect', 'input'
        this.currentMode = 'choice';
        
        // 创建背景
        this.createAnimatedBackground();
        
        // 创建UI
        this.createUI();
        
        // 创建粒子系统
        this.createParticles();
        
        // 开始游戏
        this.startGame();
        
        // 设置键盘控制
        this.setupControls();
        
        Logger.info('InteractiveMathScene 创建完成');
    }
    
    createAnimatedBackground() {
        // 动态渐变背景
        const graphics = this.add.graphics();
        this.bgGraphics = graphics;
        
        // 初始渐变
        this.drawGradientBackground(0x1a1a2e, 0x16213e);
        
        // 添加浮动粒子背景
        this.floatingParticles = [];
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, this.width),
                Phaser.Math.Between(0, this.height),
                Phaser.Math.Between(2, 6),
                0xffffff,
                Phaser.Math.FloatBetween(0.1, 0.3)
            );
            particle.setDepth(1);
            
            // 添加缓慢上升动画
            this.tweens.add({
                targets: particle,
                y: -50,
                duration: Phaser.Math.Between(8000, 15000),
                repeat: -1,
                onRepeat: () => {
                    particle.y = this.height + 50;
                    particle.x = Phaser.Math.Between(0, this.width);
                }
            });
            
            this.floatingParticles.push(particle);
        }
    }
    
    drawGradientBackground(color1, color2) {
        this.bgGraphics.clear();
        const steps = 50;
        
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
            this.bgGraphics.fillStyle(color, 1);
            this.bgGraphics.fillRect(0, (this.height / steps) * i, this.width, this.height / steps + 1);
        }
        this.bgGraphics.setDepth(0);
    }
    
    createUI() {
        // 顶部信息栏
        this.createTopBar();
        
        // 题目区域
        this.createProblemArea();
        
        // 答案区域
        this.createAnswerArea();
        
        // 连击显示
        this.createComboDisplay();
        
        // 返回按钮
        this.createReturnButton();
    }
    
    createTopBar() {
        // 顶部栏背景
        const topBar = this.add.rectangle(this.width / 2, 40, this.width - 40, 60, 0x000000, 0.6);
        topBar.setStrokeStyle(2, 0x667eea);
        topBar.setDepth(10);
        
        // 分数
        this.scoreText = this.add.text(30, 40, '分数: 0', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(11);
        
        // 时间
        this.timeText = this.add.text(this.width / 2, 40, '60', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // 时间图标
        this.add.text(this.width / 2 - 50, 40, '⏱️', {
            fontSize: '24px'
        }).setOrigin(0.5).setDepth(11);
        
        // 正确率
        this.accuracyText = this.add.text(this.width - 30, 40, '正确率: 0%', {
            fontSize: '20px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(1, 0.5).setDepth(11);
        
        // 时间进度条
        this.timeBarBg = this.add.rectangle(this.width / 2, 75, this.width - 100, 8, 0x333333, 1);
        this.timeBarBg.setDepth(10);
        
        this.timeBar = this.add.rectangle(50, 75, this.width - 100, 8, 0x50E3C2, 1);
        this.timeBar.setOrigin(0, 0.5);
        this.timeBar.setDepth(11);
    }
    
    createProblemArea() {
        // 题目卡片背景
        this.problemCard = this.add.container(this.width / 2, 200);
        
        const cardBg = this.add.rectangle(0, 0, 700, 150, 0x1a1a2e, 0.95);
        cardBg.setStrokeStyle(3, 0x667eea);
        
        // 题目类型标签
        this.modeLabel = this.add.text(-320, -60, '选择题', {
            fontSize: '16px',
            fill: '#667eea',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: '#1a1a2e',
            padding: { x: 10, y: 5 }
        }).setOrigin(0, 0.5);
        
        // 题目文本
        this.problemText = this.add.text(0, 10, '', {
            fontSize: '36px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // 难度指示器
        this.difficultyStars = this.add.text(320, -60, '★★★', {
            fontSize: '20px',
            fill: '#FFD700'
        }).setOrigin(1, 0.5);
        
        this.problemCard.add([cardBg, this.modeLabel, this.problemText, this.difficultyStars]);
        this.problemCard.setDepth(20);
    }
    
    createAnswerArea() {
        // 答案区域容器
        this.answerContainer = this.add.container(this.width / 2, 450);
        this.answerContainer.setDepth(20);
        
        // 选项按钮数组
        this.optionButtons = [];
    }
    
    createComboDisplay() {
        // 连击显示容器
        this.comboContainer = this.add.container(this.width - 100, 150);
        this.comboContainer.setDepth(30);
        this.comboContainer.setAlpha(0);
        
        // 连击背景
        const comboBg = this.add.circle(0, 0, 60, 0xFFD700, 0.3);
        comboBg.setStrokeStyle(3, 0xFFD700);
        
        // 连击数字
        this.comboNumber = this.add.text(0, -10, '0', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 连击文字
        const comboLabel = this.add.text(0, 30, 'COMBO', {
            fontSize: '16px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        this.comboContainer.add([comboBg, this.comboNumber, comboLabel]);
    }
    
    createReturnButton() {
        const returnBtn = this.add.text(30, this.height - 40, '← 返回', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0, 0.5).setDepth(100).setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerover', () => returnBtn.setTint(0x667eea));
        returnBtn.on('pointerout', () => returnBtn.clearTint());
        returnBtn.on('pointerdown', () => this.endGame());
    }
    
    createParticles() {
        // 正确答案粒子效果
        this.correctEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 100, max: 300 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            gravityY: 200,
            quantity: 20,
            emitting: false
        });
        
        // 如果没有粒子纹理，创建一个简单的
        if (!this.textures.exists('particle')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.generateTexture('particle', 16, 16);
            graphics.destroy();
        }
        
        this.correctEmitter.setDepth(50);
    }

    
    setupControls() {
        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.endGame();
        });
        
        // 数字键快速选择
        this.input.keyboard.on('keydown-ONE', () => this.selectOptionByIndex(0));
        this.input.keyboard.on('keydown-TWO', () => this.selectOptionByIndex(1));
        this.input.keyboard.on('keydown-THREE', () => this.selectOptionByIndex(2));
        this.input.keyboard.on('keydown-FOUR', () => this.selectOptionByIndex(3));
        
        // A/B/C/D 键选择
        this.input.keyboard.on('keydown-A', () => this.selectOptionByIndex(0));
        this.input.keyboard.on('keydown-B', () => this.selectOptionByIndex(1));
        this.input.keyboard.on('keydown-C', () => this.selectOptionByIndex(2));
        this.input.keyboard.on('keydown-D', () => this.selectOptionByIndex(3));
    }
    
    selectOptionByIndex(index) {
        if (this.isGameOver || !this.currentProblem) return;
        if (index < this.optionButtons.length) {
            const option = this.currentProblem.options[index];
            this.selectAnswer(option);
        }
    }
    
    startGame() {
        // 开始倒计时
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        // 生成第一道题
        this.generateProblem();
        
        // 开场动画
        this.playStartAnimation();
    }
    
    playStartAnimation() {
        // 题目卡片入场动画
        this.problemCard.setScale(0);
        this.tweens.add({
            targets: this.problemCard,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // 答案区域入场
        this.answerContainer.setY(this.height + 100);
        this.tweens.add({
            targets: this.answerContainer,
            y: 450,
            duration: 600,
            ease: 'Power2',
            delay: 200
        });
    }
    
    updateTimer() {
        if (this.isGameOver) return;
        
        this.timeLeft--;
        this.timeText.setText(this.timeLeft.toString());
        
        // 更新时间条
        const ratio = this.timeLeft / 60;
        this.timeBar.setScale(ratio, 1);
        
        // 时间紧迫时变色
        if (this.timeLeft <= 10) {
            this.timeText.setColor('#FF6B6B');
            this.timeBar.setFillStyle(0xFF6B6B);
            
            // 闪烁效果
            this.tweens.add({
                targets: this.timeText,
                scale: 1.2,
                duration: 200,
                yoyo: true
            });
        } else if (this.timeLeft <= 20) {
            this.timeText.setColor('#FFA500');
            this.timeBar.setFillStyle(0xFFA500);
        }
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    generateProblem() {
        if (this.isGameOver) return;
        
        // 随机选择答题模式（根据难度和进度）
        this.selectMode();
        
        // 生成题目
        const problemBank = new ProblemBank();
        this.currentProblem = problemBank.getProblem(
            this.playerData?.currentZone || '青石村',
            this.spirit.difficulty,
            this.spirit.name,
            this.playerData
        );
        
        this.problemCount++;
        
        // 显示题目
        this.displayProblem();
    }
    
    selectMode() {
        // 根据进度和难度选择模式
        const modes = ['choice'];
        
        // 随着进度增加更多模式
        if (this.problemCount > 3) {
            modes.push('drag');
        }
        if (this.problemCount > 6) {
            modes.push('quick');
        }
        
        // 随机选择（目前主要使用选择题，后续扩展）
        this.currentMode = modes[Math.floor(Math.random() * modes.length)];
        
        // 更新模式标签
        const modeNames = {
            'choice': '🎯 选择题',
            'drag': '✋ 拖拽题',
            'quick': '⚡ 快速答题'
        };
        this.modeLabel.setText(modeNames[this.currentMode] || '选择题');
    }
    
    displayProblem() {
        // 清除旧选项
        this.clearOptions();
        
        // 题目入场动画
        this.problemText.setText(this.currentProblem.problem);
        this.problemText.setScale(0);
        this.tweens.add({
            targets: this.problemText,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // 更新难度星星
        const stars = '★'.repeat(Math.min(this.spirit.difficulty, 5)) + 
                     '☆'.repeat(Math.max(0, 5 - this.spirit.difficulty));
        this.difficultyStars.setText(stars);
        
        // 根据模式显示答案选项
        switch (this.currentMode) {
            case 'choice':
                this.displayChoiceOptions();
                break;
            case 'drag':
                this.displayDragOptions();
                break;
            case 'quick':
                this.displayQuickOptions();
                break;
            default:
                this.displayChoiceOptions();
        }
    }
    
    displayChoiceOptions() {
        const options = this.currentProblem.options;
        const colors = [0x667EEA, 0x764BA2, 0x50E3C2, 0xF093FB];
        const labels = ['A', 'B', 'C', 'D'];
        
        // 2x2 网格布局
        options.forEach((option, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = (col - 0.5) * 280;
            const y = row * 100;
            
            // 创建选项按钮
            const button = this.createOptionButton(x, y, option, colors[index], labels[index]);
            this.answerContainer.add(button);
            this.optionButtons.push({ container: button, value: option });
            
            // 入场动画
            button.setScale(0);
            button.setAlpha(0);
            this.tweens.add({
                targets: button,
                scale: 1,
                alpha: 1,
                duration: 300,
                delay: index * 100,
                ease: 'Back.easeOut'
            });
        });
    }
    
    createOptionButton(x, y, text, color, label) {
        const container = this.add.container(x, y);
        
        // 按钮背景
        const bg = this.add.rectangle(0, 0, 250, 70, color, 0.9);
        bg.setStrokeStyle(3, 0xFFFFFF);
        
        // 标签
        const labelText = this.add.text(-100, 0, label, {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 答案文本
        const answerText = this.add.text(20, 0, text.toString(), {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        container.add([bg, labelText, answerText]);
        
        // 交互
        bg.setInteractive({ useHandCursor: true });
        
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 100
            });
            bg.setStrokeStyle(4, 0xFFD700);
        });
        
        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 100
            });
            bg.setStrokeStyle(3, 0xFFFFFF);
        });
        
        bg.on('pointerdown', () => {
            this.selectAnswer(text);
        });
        
        return container;
    }
    
    displayDragOptions() {
        // 拖拽模式 - 将正确答案拖到目标区域
        // 简化实现：显示可拖拽的选项
        this.displayChoiceOptions(); // 暂时使用选择题模式
    }
    
    displayQuickOptions() {
        // 快速答题模式 - 只显示两个选项，需要快速判断
        const options = this.currentProblem.options.slice(0, 2);
        const colors = [0x50E3C2, 0xFF6B6B];
        const labels = ['✓', '✗'];
        
        options.forEach((option, index) => {
            const x = (index - 0.5) * 300;
            const button = this.createOptionButton(x, 0, option, colors[index], labels[index]);
            this.answerContainer.add(button);
            this.optionButtons.push({ container: button, value: option });
            
            button.setScale(0);
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 200,
                delay: index * 100,
                ease: 'Back.easeOut'
            });
        });
    }
    
    clearOptions() {
        this.optionButtons.forEach(btn => {
            if (btn.container) {
                btn.container.destroy();
            }
        });
        this.optionButtons = [];
    }
    
    selectAnswer(answer) {
        if (this.isGameOver || this.isProcessing) return;
        this.isProcessing = true;
        
        const isCorrect = this.currentProblem.checkAnswer(answer);
        
        // 记录答题
        if (this.playerData) {
            this.playerData.recordAnswer(isCorrect);
        }
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer(answer);
        }
        
        // 更新正确率
        if (this.problemCount > 0) {
            const accuracy = Math.round((this.correctCount / this.problemCount) * 100);
            this.accuracyText.setText(`正确率: ${accuracy}%`);
        }
    }

    
    handleCorrectAnswer() {
        this.correctCount++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // 计算分数（连击加成）
        const baseScore = 100 * this.spirit.difficulty;
        const comboBonus = Math.floor(baseScore * (this.combo * 0.1));
        const totalScore = baseScore + comboBonus;
        this.score += totalScore;
        
        // 更新分数显示
        this.scoreText.setText(`分数: ${this.score}`);
        
        // 分数弹出动画
        this.showScorePopup(totalScore, this.combo > 1);
        
        // 连击显示
        this.updateComboDisplay();
        
        // 正确答案特效
        this.playCorrectEffect();
        
        // 奖励时间（连击越高奖励越多）
        const timeBonus = Math.min(this.combo, 5);
        this.timeLeft = Math.min(60, this.timeLeft + timeBonus);
        this.timeText.setText(this.timeLeft.toString());
        
        // 显示时间奖励
        if (timeBonus > 0) {
            this.showTimeBonusPopup(timeBonus);
        }
        
        // 延迟后生成下一题
        this.time.delayedCall(800, () => {
            this.isProcessing = false;
            this.generateProblem();
        });
    }
    
    handleWrongAnswer(answer) {
        this.combo = 0;
        
        // 隐藏连击显示
        this.tweens.add({
            targets: this.comboContainer,
            alpha: 0,
            duration: 200
        });
        
        // 错误答案特效
        this.playWrongEffect(answer);
        
        // 扣除时间
        this.timeLeft = Math.max(0, this.timeLeft - 3);
        this.timeText.setText(this.timeLeft.toString());
        
        // 显示正确答案
        this.showCorrectAnswer();
        
        // 延迟后生成下一题
        this.time.delayedCall(1500, () => {
            this.isProcessing = false;
            this.generateProblem();
        });
    }
    
    showScorePopup(score, hasCombo) {
        const popup = this.add.text(this.width / 2, 300, `+${score}`, {
            fontSize: hasCombo ? '48px' : '36px',
            fill: hasCombo ? '#FFD700' : '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);
        
        this.tweens.add({
            targets: popup,
            y: 200,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => popup.destroy()
        });
    }
    
    showTimeBonusPopup(bonus) {
        const popup = this.add.text(this.width / 2 + 80, 40, `+${bonus}s`, {
            fontSize: '24px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(100);
        
        this.tweens.add({
            targets: popup,
            y: 20,
            alpha: 0,
            duration: 800,
            onComplete: () => popup.destroy()
        });
    }
    
    updateComboDisplay() {
        if (this.combo < 2) return;
        
        // 显示连击
        this.comboContainer.setAlpha(1);
        this.comboNumber.setText(this.combo.toString());
        
        // 连击动画
        this.tweens.add({
            targets: this.comboContainer,
            scale: { from: 1.3, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // 高连击时特殊效果
        if (this.combo >= 5) {
            this.comboNumber.setColor('#FF6B6B');
            this.cameras.main.shake(100, 0.005);
        } else if (this.combo >= 3) {
            this.comboNumber.setColor('#FFA500');
        } else {
            this.comboNumber.setColor('#FFD700');
        }
    }
    
    playCorrectEffect() {
        // 屏幕闪烁
        this.cameras.main.flash(200, 80, 227, 194, false);
        
        // 粒子效果
        if (this.correctEmitter) {
            this.correctEmitter.setPosition(this.width / 2, 300);
            this.correctEmitter.explode(30);
        }
        
        // 选项按钮正确动画
        this.optionButtons.forEach(btn => {
            const isCorrect = btn.value === this.currentProblem.correctAnswer;
            if (isCorrect) {
                this.tweens.add({
                    targets: btn.container,
                    scale: 1.2,
                    duration: 200,
                    yoyo: true
                });
            } else {
                this.tweens.add({
                    targets: btn.container,
                    alpha: 0.3,
                    duration: 200
                });
            }
        });
        
        // 题目卡片动画
        this.tweens.add({
            targets: this.problemCard,
            scale: { from: 1, to: 1.05 },
            duration: 150,
            yoyo: true
        });
    }
    
    playWrongEffect(answer) {
        // 屏幕震动
        this.cameras.main.shake(300, 0.01);
        
        // 屏幕红色闪烁
        this.cameras.main.flash(200, 255, 107, 107, false);
        
        // 错误选项动画
        this.optionButtons.forEach(btn => {
            if (btn.value === answer) {
                this.tweens.add({
                    targets: btn.container,
                    x: btn.container.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 5
                });
            }
        });
    }
    
    showCorrectAnswer() {
        // 高亮正确答案
        this.optionButtons.forEach(btn => {
            const isCorrect = btn.value === this.currentProblem.correctAnswer;
            if (isCorrect) {
                // 正确答案闪烁
                this.tweens.add({
                    targets: btn.container,
                    alpha: { from: 1, to: 0.5 },
                    duration: 200,
                    yoyo: true,
                    repeat: 3
                });
            } else {
                this.tweens.add({
                    targets: btn.container,
                    alpha: 0.2,
                    duration: 200
                });
            }
        });
        
        // 显示正确答案提示
        const hint = this.add.text(this.width / 2, 550, 
            `正确答案: ${this.currentProblem.correctAnswer}`, {
            fontSize: '24px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(100);
        
        this.tweens.add({
            targets: hint,
            alpha: 0,
            duration: 500,
            delay: 1000,
            onComplete: () => hint.destroy()
        });
    }
    
    endGame() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        // 停止计时器
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        
        // 计算最终奖励
        const expGain = Math.floor(this.score * 0.1);
        if (this.playerData) {
            this.playerData.gainExp(expGain);
        }
        
        // 显示结算界面
        this.showResultScreen(expGain);
    }
    
    showResultScreen(expGain) {
        // 遮罩
        const overlay = this.add.rectangle(this.width / 2, this.height / 2, 
            this.width, this.height, 0x000000, 0.8);
        overlay.setDepth(200);
        
        // 结算卡片
        const resultCard = this.add.container(this.width / 2, this.height / 2);
        resultCard.setDepth(201);
        
        const cardBg = this.add.rectangle(0, 0, 500, 450, 0x1a1a2e, 0.98);
        cardBg.setStrokeStyle(4, 0x667eea);
        
        // 标题
        const title = this.add.text(0, -180, '🎉 挑战结束', {
            fontSize: '36px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 统计信息
        const accuracy = this.problemCount > 0 ? 
            Math.round((this.correctCount / this.problemCount) * 100) : 0;
        
        const stats = [
            `总分: ${this.score}`,
            `答题数: ${this.problemCount}`,
            `正确数: ${this.correctCount}`,
            `正确率: ${accuracy}%`,
            `最高连击: ${this.maxCombo}`,
            `获得修为: +${expGain}`
        ];
        
        stats.forEach((stat, index) => {
            const text = this.add.text(0, -100 + index * 45, stat, {
                fontSize: '24px',
                fill: index === stats.length - 1 ? '#50E3C2' : '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5);
            resultCard.add(text);
        });
        
        // 评价
        let grade = 'C';
        let gradeColor = '#FFFFFF';
        if (accuracy >= 90 && this.maxCombo >= 5) {
            grade = 'S';
            gradeColor = '#FFD700';
        } else if (accuracy >= 80) {
            grade = 'A';
            gradeColor = '#50E3C2';
        } else if (accuracy >= 60) {
            grade = 'B';
            gradeColor = '#667EEA';
        }
        
        const gradeText = this.add.text(200, -180, grade, {
            fontSize: '48px',
            fill: gradeColor,
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 返回按钮
        const returnBtn = this.add.text(0, 170, '返回', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: '#667eea',
            padding: { x: 40, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerover', () => returnBtn.setTint(0x764ba2));
        returnBtn.on('pointerout', () => returnBtn.clearTint());
        returnBtn.on('pointerdown', () => this.returnToGame());
        
        resultCard.add([cardBg, title, gradeText, returnBtn]);
        
        // 入场动画
        resultCard.setScale(0);
        this.tweens.add({
            targets: resultCard,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
    }
    
    returnToGame() {
        this.scene.stop();
        
        // 尝试恢复之前的场景
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.scene.isPaused()) {
            gameScene.scene.resume();
            return;
        }
        
        const adventureScene = this.scene.get('AdventureScene');
        if (adventureScene && adventureScene.scene.isPaused()) {
            adventureScene.scene.resume();
            return;
        }
        
        // 如果没有暂停的场景，启动GameScene
        this.scene.start('GameScene', { preserveData: true });
    }
}
