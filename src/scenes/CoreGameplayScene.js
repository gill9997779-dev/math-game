// Phaser 从全局对象获取
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 核心玩法场景 - 深度重构版
 * 
 * 设计理念：
 * 1. 多维度挑战 - 不只是答题，还有时间、策略、连锁反应
 * 2. 即时反馈 - 每个操作都有视觉和听觉反馈
 * 3. 成长感 - 明确的进度和奖励系统
 * 4. 策略深度 - 选择题目顺序、使用道具、触发连锁
 */
export class CoreGameplayScene extends Scene {
    constructor() {
        super({ key: 'CoreGameplayScene' });
    }
    
    create(data = {}) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 游戏模式
        this.gameMode = data.mode || 'adventure'; // adventure, challenge, endless, puzzle
        this.difficulty = data.difficulty || 1;
        
        // 核心状态
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.energy = 100; // 灵力值
        this.maxEnergy = 100;
        this.timeLeft = this.gameMode === 'challenge' ? 60 : -1; // -1表示无限时间
        this.isGameActive = true;
        
        // 题目池
        this.problemQueue = [];
        this.currentProblems = []; // 当前显示的题目（最多3个）
        this.solvedCount = 0;
        this.wrongCount = 0;
        
        // 特殊效果
        this.activeEffects = [];
        this.chainMultiplier = 1;
        
        // 创建游戏界面
        this.createBackground();
        this.createUI();
        this.createProblemArea();
        this.createEffectsLayer();
        
        // 初始化题目
        this.initializeProblems();
        
        // 启动游戏循环
        this.startGameLoop();
        
        Logger.info('CoreGameplayScene 创建完成 - 模式:', this.gameMode);
    }
    
    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 动态渐变背景
        const graphics = this.add.graphics();
        this.drawDynamicBackground(graphics);
        graphics.setDepth(0);
        
        // 粒子效果层
        this.particleContainer = this.add.container(0, 0);
        this.particleContainer.setDepth(1);
        
        // 创建背景粒子
        this.createBackgroundParticles();
    }
    
    drawDynamicBackground(graphics) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 根据游戏模式选择颜色主题
        const themes = {
            adventure: { top: 0x1a1a2e, bottom: 0x2d1b4e },
            challenge: { top: 0x2e1a1a, bottom: 0x4e1b2d },
            endless: { top: 0x1a2e1a, bottom: 0x1b4e2d },
            puzzle: { top: 0x1a2e2e, bottom: 0x1b4e4e }
        };
        
        const theme = themes[this.gameMode] || themes.adventure;
        
        // 绘制渐变
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const color = this.lerpColor(theme.top, theme.bottom, ratio);
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, (height / steps) * i, width, height / steps + 1);
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
    
    createBackgroundParticles() {
        // 创建漂浮的灵气粒子
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, this.cameras.main.width),
                Phaser.Math.Between(0, this.cameras.main.height),
                Phaser.Math.Between(2, 5),
                0xFFD700,
                Phaser.Math.FloatBetween(0.1, 0.3)
            );
            
            // 添加漂浮动画
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(50, 150),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                onComplete: () => {
                    particle.y = this.cameras.main.height + 20;
                    particle.x = Phaser.Math.Between(0, this.cameras.main.width);
                    particle.alpha = Phaser.Math.FloatBetween(0.1, 0.3);
                    this.createParticleAnimation(particle);
                }
            });
            
            this.particleContainer.add(particle);
        }
    }
    
    createParticleAnimation(particle) {
        this.tweens.add({
            targets: particle,
            y: particle.y - Phaser.Math.Between(50, 150),
            alpha: 0,
            duration: Phaser.Math.Between(3000, 6000),
            onComplete: () => {
                if (particle.active) {
                    particle.y = this.cameras.main.height + 20;
                    particle.x = Phaser.Math.Between(0, this.cameras.main.width);
                    particle.alpha = Phaser.Math.FloatBetween(0.1, 0.3);
                    this.createParticleAnimation(particle);
                }
            }
        });
    }
    
    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 顶部信息栏
        this.createTopBar();
        
        // 左侧状态面板
        this.createStatusPanel();
        
        // 右侧道具面板
        this.createItemPanel();
        
        // 底部操作区
        this.createBottomBar();
    }
    
    createTopBar() {
        const width = this.cameras.main.width;
        
        // 顶部背景
        const topBg = this.add.rectangle(width / 2, 40, width, 80, 0x000000, 0.7);
        topBg.setDepth(10);
        
        // 返回按钮
        const returnBtn = this.add.text(30, 40, '← 返回', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0, 0.5).setDepth(11).setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerover', () => returnBtn.setTint(0xcccccc));
        returnBtn.on('pointerout', () => returnBtn.clearTint());
        returnBtn.on('pointerdown', () => this.exitGame());
        
        // 分数显示
        this.scoreText = this.add.text(width / 2, 25, '0', {
            fontSize: '36px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // 分数标签
        this.add.text(width / 2, 55, '修为点', {
            fontSize: '14px',
            fill: '#AAAAAA',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5).setDepth(11);
        
        // 连击显示
        this.comboText = this.add.text(width - 150, 30, '', {
            fontSize: '24px',
            fill: '#50E3C2',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // 时间显示（挑战模式）
        if (this.timeLeft > 0) {
            this.timeText = this.add.text(width - 50, 40, this.formatTime(this.timeLeft), {
                fontSize: '28px',
                fill: '#FF6B6B',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5).setDepth(11);
        }
    }
    
    createStatusPanel() {
        const panelX = 80;
        const panelY = 150;
        
        // 灵力条背景
        const energyBg = this.add.rectangle(panelX, panelY, 120, 20, 0x333333, 0.8);
        energyBg.setDepth(10);
        
        // 灵力条
        this.energyBar = this.add.rectangle(panelX - 55, panelY, 0, 16, 0x667eea, 1);
        this.energyBar.setOrigin(0, 0.5);
        this.energyBar.setDepth(11);
        
        // 灵力标签（先创建，再更新）
        this.energyText = this.add.text(panelX, panelY + 25, `灵力: ${this.energy}/${this.maxEnergy}`, {
            fontSize: '14px',
            fill: '#AAAAAA',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5).setDepth(11);
        
        // 更新灵力条（在energyText创建后调用）
        this.updateEnergyBar();
        
        // 统计信息
        this.statsText = this.add.text(panelX, panelY + 60, '', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, Arial',
            align: 'center'
        }).setOrigin(0.5).setDepth(11);
        this.updateStats();
    }
    
    createItemPanel() {
        const width = this.cameras.main.width;
        const panelX = width - 80;
        const panelY = 150;
        
        // 道具标题
        this.add.text(panelX, panelY - 30, '道具', {
            fontSize: '16px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5).setDepth(11);
        
        // 道具按钮
        const items = [
            { id: 'hint', icon: '💡', name: '提示', cost: 20 },
            { id: 'freeze', icon: '❄️', name: '冻结', cost: 30 },
            { id: 'double', icon: '✨', name: '双倍', cost: 40 }
        ];
        
        this.itemButtons = [];
        items.forEach((item, index) => {
            const btn = this.createItemButton(panelX, panelY + index * 50, item);
            this.itemButtons.push(btn);
        });
    }
    
    createItemButton(x, y, item) {
        const container = this.add.container(x, y);
        container.setDepth(11);
        
        // 按钮背景
        const bg = this.add.rectangle(0, 0, 60, 40, 0x333333, 0.8);
        bg.setStrokeStyle(2, 0x667eea);
        bg.setInteractive({ useHandCursor: true });
        
        // 图标
        const icon = this.add.text(0, -5, item.icon, {
            fontSize: '20px'
        }).setOrigin(0.5);
        
        // 消耗
        const cost = this.add.text(0, 12, `${item.cost}`, {
            fontSize: '10px',
            fill: '#AAAAAA',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        container.add([bg, icon, cost]);
        container.setData('item', item);
        
        // 交互
        bg.on('pointerover', () => bg.setFillStyle(0x444444, 0.9));
        bg.on('pointerout', () => bg.setFillStyle(0x333333, 0.8));
        bg.on('pointerdown', () => this.useItem(item));
        
        return container;
    }
    
    createBottomBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 底部背景
        const bottomBg = this.add.rectangle(width / 2, height - 40, width, 80, 0x000000, 0.5);
        bottomBg.setDepth(10);
        
        // 模式提示
        const modeNames = {
            adventure: '🗡️ 冒险模式',
            challenge: '⏱️ 限时挑战',
            endless: '♾️ 无尽模式',
            puzzle: '🧩 解谜模式'
        };
        
        this.add.text(width / 2, height - 40, modeNames[this.gameMode] || '冒险模式', {
            fontSize: '18px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5).setDepth(11);
    }
    
    createProblemArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 题目区域容器
        this.problemContainer = this.add.container(width / 2, height / 2 - 50);
        this.problemContainer.setDepth(20);
        
        // 题目卡片位置
        this.cardPositions = [
            { x: -250, y: 0 },
            { x: 0, y: 0 },
            { x: 250, y: 0 }
        ];
    }
    
    createEffectsLayer() {
        // 特效层
        this.effectsContainer = this.add.container(0, 0);
        this.effectsContainer.setDepth(100);
    }

    
    initializeProblems() {
        // 生成题目池
        this.generateProblemPool(10);
        
        // 显示初始题目
        this.showNextProblems();
    }
    
    generateProblemPool(count) {
        const problemTypes = this.getProblemTypesForMode();
        
        for (let i = 0; i < count; i++) {
            const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
            const problem = this.generateProblem(type);
            this.problemQueue.push(problem);
        }
    }
    
    getProblemTypesForMode() {
        switch (this.gameMode) {
            case 'adventure':
                return ['arithmetic', 'sequence', 'comparison'];
            case 'challenge':
                return ['arithmetic', 'quick_calc', 'mental_math'];
            case 'endless':
                return ['arithmetic', 'sequence', 'pattern', 'logic'];
            case 'puzzle':
                return ['pattern', 'logic', 'spatial'];
            default:
                return ['arithmetic'];
        }
    }
    
    generateProblem(type) {
        const difficulty = this.difficulty + Math.floor(this.solvedCount / 5);
        
        switch (type) {
            case 'arithmetic':
                return this.generateArithmeticProblem(difficulty);
            case 'sequence':
                return this.generateSequenceProblem(difficulty);
            case 'comparison':
                return this.generateComparisonProblem(difficulty);
            case 'quick_calc':
                return this.generateQuickCalcProblem(difficulty);
            case 'mental_math':
                return this.generateMentalMathProblem(difficulty);
            case 'pattern':
                return this.generatePatternProblem(difficulty);
            case 'logic':
                return this.generateLogicProblem(difficulty);
            default:
                return this.generateArithmeticProblem(difficulty);
        }
    }
    
    generateArithmeticProblem(difficulty) {
        const ops = ['+', '-', '×', '÷'];
        const op = ops[Math.floor(Math.random() * Math.min(ops.length, difficulty + 1))];
        
        let a, b, answer;
        const maxNum = 10 * difficulty;
        
        switch (op) {
            case '+':
                a = Phaser.Math.Between(1, maxNum);
                b = Phaser.Math.Between(1, maxNum);
                answer = a + b;
                break;
            case '-':
                a = Phaser.Math.Between(10, maxNum + 10);
                b = Phaser.Math.Between(1, a - 1);
                answer = a - b;
                break;
            case '×':
                a = Phaser.Math.Between(2, Math.min(12, maxNum));
                b = Phaser.Math.Between(2, Math.min(12, maxNum));
                answer = a * b;
                break;
            case '÷':
                b = Phaser.Math.Between(2, Math.min(10, maxNum));
                answer = Phaser.Math.Between(1, Math.min(10, maxNum));
                a = b * answer;
                break;
        }
        
        return {
            type: 'arithmetic',
            question: `${a} ${op} ${b} = ?`,
            answer: answer,
            options: this.generateOptions(answer, 4),
            points: 10 * difficulty,
            timeBonus: 5
        };
    }
    
    generateSequenceProblem(difficulty) {
        const sequences = [
            { name: '等差', gen: (n, d) => n + d },
            { name: '等比', gen: (n, r) => n * r },
            { name: '斐波那契', gen: (a, b) => a + b }
        ];
        
        const seq = sequences[Math.floor(Math.random() * sequences.length)];
        let nums = [];
        
        if (seq.name === '等差') {
            const start = Phaser.Math.Between(1, 10);
            const diff = Phaser.Math.Between(2, 5 * difficulty);
            for (let i = 0; i < 5; i++) {
                nums.push(start + i * diff);
            }
        } else if (seq.name === '等比') {
            const start = Phaser.Math.Between(1, 5);
            const ratio = Phaser.Math.Between(2, 3);
            for (let i = 0; i < 5; i++) {
                nums.push(start * Math.pow(ratio, i));
            }
        } else {
            nums = [1, 1, 2, 3, 5, 8];
        }
        
        const answer = nums[nums.length - 1];
        const display = nums.slice(0, -1).join(', ') + ', ?';
        
        return {
            type: 'sequence',
            question: `找规律: ${display}`,
            answer: answer,
            options: this.generateOptions(answer, 4),
            points: 15 * difficulty,
            timeBonus: 8
        };
    }
    
    generateComparisonProblem(difficulty) {
        const a = Phaser.Math.Between(10, 50 * difficulty);
        const b = Phaser.Math.Between(10, 50 * difficulty);
        
        const ops = ['>', '<', '='];
        let answer;
        
        if (a > b) answer = '>';
        else if (a < b) answer = '<';
        else answer = '=';
        
        return {
            type: 'comparison',
            question: `${a} ○ ${b}，○应填什么？`,
            answer: answer,
            options: ['>', '<', '=', '≠'],
            points: 8 * difficulty,
            timeBonus: 3
        };
    }
    
    generateQuickCalcProblem(difficulty) {
        // 快速计算 - 简单但需要快速反应
        const a = Phaser.Math.Between(1, 20);
        const b = Phaser.Math.Between(1, 20);
        const answer = a + b;
        
        return {
            type: 'quick_calc',
            question: `⚡ ${a} + ${b} = ?`,
            answer: answer,
            options: this.generateOptions(answer, 4),
            points: 5 * difficulty,
            timeBonus: 10, // 快速回答有更多时间奖励
            isQuick: true
        };
    }
    
    generateMentalMathProblem(difficulty) {
        // 心算题 - 多步运算
        const a = Phaser.Math.Between(5, 15);
        const b = Phaser.Math.Between(2, 10);
        const c = Phaser.Math.Between(1, 5);
        const answer = a * b + c;
        
        return {
            type: 'mental_math',
            question: `${a} × ${b} + ${c} = ?`,
            answer: answer,
            options: this.generateOptions(answer, 4),
            points: 20 * difficulty,
            timeBonus: 5
        };
    }
    
    generatePatternProblem(difficulty) {
        // 图案规律题
        const patterns = [
            { seq: ['○', '●', '○', '●'], answer: '○', question: '○●○●?' },
            { seq: ['△', '△', '□', '△', '△'], answer: '□', question: '△△□△△?' },
            { seq: ['★', '☆', '★', '☆'], answer: '★', question: '★☆★☆?' }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        return {
            type: 'pattern',
            question: `图案规律: ${pattern.question}`,
            answer: pattern.answer,
            options: ['○', '●', '△', '□', '★', '☆'].slice(0, 4),
            points: 12 * difficulty,
            timeBonus: 6
        };
    }
    
    generateLogicProblem(difficulty) {
        // 逻辑推理题
        const problems = [
            {
                question: '如果A>B，B>C，那么A和C的关系是？',
                answer: 'A>C',
                options: ['A>C', 'A<C', 'A=C', '无法确定']
            },
            {
                question: '所有的猫都是动物，小花是猫，所以？',
                answer: '小花是动物',
                options: ['小花是动物', '小花不是动物', '无法确定', '小花是猫']
            }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        
        return {
            type: 'logic',
            question: problem.question,
            answer: problem.answer,
            options: problem.options,
            points: 25 * difficulty,
            timeBonus: 10
        };
    }
    
    generateOptions(correctAnswer, count) {
        const options = [correctAnswer];
        const isNumber = typeof correctAnswer === 'number';
        
        while (options.length < count) {
            let option;
            if (isNumber) {
                // 生成接近正确答案的干扰项
                const offset = Phaser.Math.Between(-10, 10);
                option = correctAnswer + offset;
                if (option <= 0) option = correctAnswer + Math.abs(offset);
            } else {
                option = correctAnswer; // 非数字类型需要特殊处理
            }
            
            if (!options.includes(option) && option !== correctAnswer) {
                options.push(option);
            } else if (isNumber) {
                options.push(correctAnswer + options.length * 2);
            }
        }
        
        // 打乱选项顺序
        return Phaser.Utils.Array.Shuffle(options);
    }
    
    showNextProblems() {
        // 清除当前题目卡片
        this.currentProblems.forEach(card => {
            if (card && card.container) {
                card.container.destroy();
            }
        });
        this.currentProblems = [];
        
        // 根据模式决定显示几道题
        const problemCount = this.gameMode === 'puzzle' ? 1 : Math.min(3, this.problemQueue.length);
        
        for (let i = 0; i < problemCount; i++) {
            if (this.problemQueue.length === 0) {
                this.generateProblemPool(5);
            }
            
            const problem = this.problemQueue.shift();
            const position = this.cardPositions[i] || { x: 0, y: 0 };
            const card = this.createProblemCard(problem, position, i);
            this.currentProblems.push({ problem, card, container: card });
        }
    }
    
    createProblemCard(problem, position, index) {
        const container = this.add.container(position.x, position.y);
        
        // 卡片背景
        const cardWidth = 220;
        const cardHeight = 280;
        
        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(3, this.getCardColor(problem.type));
        
        // 题目类型标签
        const typeLabel = this.add.text(0, -cardHeight/2 + 25, this.getTypeLabel(problem.type), {
            fontSize: '14px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        // 题目文本
        const questionText = this.add.text(0, -40, problem.question, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            align: 'center',
            wordWrap: { width: cardWidth - 30 }
        }).setOrigin(0.5);
        
        // 分数显示
        const pointsText = this.add.text(0, -cardHeight/2 + 50, `+${problem.points}`, {
            fontSize: '12px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        container.add([bg, typeLabel, questionText, pointsText]);
        
        // 选项按钮
        const optionStartY = 30;
        problem.options.forEach((option, optIndex) => {
            const optBtn = this.createOptionButton(option, optIndex, cardWidth - 40, problem, container);
            optBtn.y = optionStartY + optIndex * 45;
            container.add(optBtn);
        });
        
        // 添加到题目容器
        this.problemContainer.add(container);
        
        // 入场动画
        container.setScale(0);
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            duration: 300,
            delay: index * 100,
            ease: 'Back.easeOut'
        });
        
        return container;
    }
    
    createOptionButton(option, index, width, problem, parentContainer) {
        const container = this.add.container(0, 0);
        
        const bg = this.add.rectangle(0, 0, width, 35, 0x333333, 0.9);
        bg.setStrokeStyle(2, 0x555555);
        bg.setInteractive({ useHandCursor: true });
        
        const text = this.add.text(0, 0, String(option), {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        container.add([bg, text]);
        
        // 交互效果
        bg.on('pointerover', () => {
            bg.setFillStyle(0x444444, 1);
            bg.setStrokeStyle(2, 0x667eea);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x333333, 0.9);
            bg.setStrokeStyle(2, 0x555555);
        });
        
        bg.on('pointerdown', () => {
            this.checkAnswer(option, problem, parentContainer);
        });
        
        return container;
    }
    
    getCardColor(type) {
        const colors = {
            arithmetic: 0x667eea,
            sequence: 0x50e3c2,
            comparison: 0xf5a623,
            quick_calc: 0xff6b6b,
            mental_math: 0x9013fe,
            pattern: 0x4a90e2,
            logic: 0xbd10e0
        };
        return colors[type] || 0x667eea;
    }
    
    getTypeLabel(type) {
        const labels = {
            arithmetic: '📐 四则运算',
            sequence: '🔢 数列规律',
            comparison: '⚖️ 大小比较',
            quick_calc: '⚡ 快速计算',
            mental_math: '🧠 心算挑战',
            pattern: '🎨 图案规律',
            logic: '💡 逻辑推理'
        };
        return labels[type] || '📐 数学题';
    }

    
    checkAnswer(selectedOption, problem, cardContainer) {
        const isCorrect = selectedOption === problem.answer || 
                         String(selectedOption) === String(problem.answer);
        
        if (isCorrect) {
            this.handleCorrectAnswer(problem, cardContainer);
        } else {
            this.handleWrongAnswer(problem, cardContainer, selectedOption);
        }
    }
    
    handleCorrectAnswer(problem, cardContainer) {
        // 更新状态
        this.solvedCount++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // 计算得分（含连击加成）
        const comboMultiplier = 1 + (this.combo - 1) * 0.1;
        const chainBonus = this.chainMultiplier;
        const points = Math.floor(problem.points * comboMultiplier * chainBonus);
        this.score += points;
        
        // 恢复灵力
        this.energy = Math.min(this.maxEnergy, this.energy + 5);
        
        // 时间奖励（挑战模式）
        if (this.timeLeft > 0) {
            this.timeLeft += problem.timeBonus;
        }
        
        // 视觉反馈
        this.showCorrectEffect(cardContainer, points);
        
        // 更新UI
        this.updateUI();
        
        // 检查连锁效果
        this.checkChainEffect();
        
        // 移除卡片并显示新题目
        this.time.delayedCall(500, () => {
            this.removeCard(cardContainer);
            if (this.currentProblems.length === 0) {
                this.showNextProblems();
            }
        });
        
        // 更新玩家数据
        if (window.gameData && window.gameData.player) {
            window.gameData.player.recordAnswer(true);
            window.gameData.player.gainExp(points);
        }
    }
    
    handleWrongAnswer(problem, cardContainer, selectedOption) {
        // 更新状态
        this.wrongCount++;
        this.combo = 0;
        this.chainMultiplier = 1;
        
        // 扣除灵力
        this.energy = Math.max(0, this.energy - 10);
        
        // 视觉反馈
        this.showWrongEffect(cardContainer, selectedOption, problem.answer);
        
        // 更新UI
        this.updateUI();
        
        // 检查游戏结束
        if (this.energy <= 0) {
            this.gameOver('灵力耗尽');
            return;
        }
        
        // 更新玩家数据
        if (window.gameData && window.gameData.player) {
            window.gameData.player.recordAnswer(false);
        }
    }
    
    showCorrectEffect(cardContainer, points) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 卡片闪烁效果
        this.tweens.add({
            targets: cardContainer,
            scale: 1.1,
            duration: 100,
            yoyo: true
        });
        
        // 得分飘字
        const pointsText = this.add.text(
            cardContainer.x + this.problemContainer.x,
            cardContainer.y + this.problemContainer.y - 50,
            `+${points}`,
            {
                fontSize: '32px',
                fill: '#50E3C2',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(101);
        
        this.tweens.add({
            targets: pointsText,
            y: pointsText.y - 80,
            alpha: 0,
            duration: 1000,
            onComplete: () => pointsText.destroy()
        });
        
        // 连击提示
        if (this.combo > 1) {
            this.showComboEffect();
        }
        
        // 粒子爆发效果
        this.createBurstParticles(
            cardContainer.x + this.problemContainer.x,
            cardContainer.y + this.problemContainer.y,
            0x50E3C2
        );
    }
    
    showWrongEffect(cardContainer, selectedOption, correctAnswer) {
        // 卡片震动效果
        this.tweens.add({
            targets: cardContainer,
            x: cardContainer.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
        
        // 错误提示
        const wrongText = this.add.text(
            cardContainer.x + this.problemContainer.x,
            cardContainer.y + this.problemContainer.y - 50,
            `正确答案: ${correctAnswer}`,
            {
                fontSize: '20px',
                fill: '#FF6B6B',
                fontFamily: 'Microsoft YaHei, Arial',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setDepth(101);
        
        this.tweens.add({
            targets: wrongText,
            alpha: 0,
            duration: 2000,
            delay: 1000,
            onComplete: () => wrongText.destroy()
        });
    }
    
    showComboEffect() {
        const width = this.cameras.main.width;
        
        // 更新连击文本
        if (this.comboText) {
            this.comboText.setText(`🔥 ${this.combo} 连击!`);
        }
        
        // 连击动画
        this.tweens.add({
            targets: this.comboText,
            scale: 1.3,
            duration: 100,
            yoyo: true
        });
        
        // 特殊连击里程碑
        if (this.combo === 5 || this.combo === 10 || this.combo === 20) {
            this.showMilestoneEffect(this.combo);
        }
    }
    
    showMilestoneEffect(combo) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const milestoneText = this.add.text(width / 2, height / 2, `🎉 ${combo} 连击达成!`, {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);
        
        this.tweens.add({
            targets: milestoneText,
            scale: { from: 0, to: 1.2 },
            alpha: { from: 1, to: 0 },
            duration: 1500,
            ease: 'Back.easeOut',
            onComplete: () => milestoneText.destroy()
        });
        
        // 奖励灵力
        this.energy = Math.min(this.maxEnergy, this.energy + combo * 2);
        this.chainMultiplier = 1 + combo * 0.05;
    }
    
    createBurstParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = this.add.circle(x, y, 5, color, 1);
            particle.setDepth(102);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 100,
                y: y + Math.sin(angle) * 100,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    removeCard(cardContainer) {
        // 移除动画
        this.tweens.add({
            targets: cardContainer,
            scale: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                // 从当前题目列表中移除
                const index = this.currentProblems.findIndex(p => p.container === cardContainer);
                if (index > -1) {
                    this.currentProblems.splice(index, 1);
                }
                cardContainer.destroy();
            }
        });
    }
    
    checkChainEffect() {
        // 连锁效果检查
        if (this.combo >= 3 && this.combo % 3 === 0) {
            // 每3连击触发一次连锁
            this.triggerChainBonus();
        }
    }
    
    triggerChainBonus() {
        const bonusPoints = this.combo * 5;
        this.score += bonusPoints;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const chainText = this.add.text(width / 2, height / 2 + 100, `⚡ 连锁奖励 +${bonusPoints}`, {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(150);
        
        this.tweens.add({
            targets: chainText,
            y: chainText.y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => chainText.destroy()
        });
    }
    
    useItem(item) {
        if (this.energy < item.cost) {
            this.showMessage('灵力不足!', '#FF6B6B');
            return;
        }
        
        this.energy -= item.cost;
        this.updateEnergyBar();
        
        switch (item.id) {
            case 'hint':
                this.useHintItem();
                break;
            case 'freeze':
                this.useFreezeItem();
                break;
            case 'double':
                this.useDoubleItem();
                break;
        }
    }
    
    useHintItem() {
        // 提示道具 - 高亮正确答案
        if (this.currentProblems.length > 0) {
            const firstProblem = this.currentProblems[0];
            this.showMessage(`💡 提示: 答案是 ${firstProblem.problem.answer}`, '#50E3C2');
        }
    }
    
    useFreezeItem() {
        // 冻结道具 - 暂停时间5秒
        if (this.timeLeft > 0) {
            this.isTimeFrozen = true;
            this.showMessage('❄️ 时间冻结 5秒!', '#4A90E2');
            
            this.time.delayedCall(5000, () => {
                this.isTimeFrozen = false;
            });
        } else {
            this.showMessage('❄️ 当前模式无时间限制', '#888888');
        }
    }
    
    useDoubleItem() {
        // 双倍道具 - 下一题双倍得分
        this.chainMultiplier = 2;
        this.showMessage('✨ 下一题双倍得分!', '#FFD700');
    }
    
    showMessage(text, color) {
        const width = this.cameras.main.width;
        
        const msg = this.add.text(width / 2, 120, text, {
            fontSize: '20px',
            fill: color,
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(200);
        
        this.tweens.add({
            targets: msg,
            alpha: 0,
            duration: 2000,
            delay: 1000,
            onComplete: () => msg.destroy()
        });
    }
    
    startGameLoop() {
        // 时间更新（挑战模式）
        if (this.timeLeft > 0) {
            this.timeEvent = this.time.addEvent({
                delay: 1000,
                callback: this.updateTime,
                callbackScope: this,
                loop: true
            });
        }
    }
    
    updateTime() {
        if (this.isTimeFrozen || !this.isGameActive) return;
        
        this.timeLeft--;
        
        if (this.timeText) {
            this.timeText.setText(this.formatTime(this.timeLeft));
            
            // 时间紧迫警告
            if (this.timeLeft <= 10) {
                this.timeText.setFill('#FF0000');
                this.tweens.add({
                    targets: this.timeText,
                    scale: 1.2,
                    duration: 100,
                    yoyo: true
                });
            }
        }
        
        if (this.timeLeft <= 0) {
            this.gameOver('时间耗尽');
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateUI() {
        // 更新分数
        if (this.scoreText) {
            this.scoreText.setText(this.score.toString());
        }
        
        // 更新连击
        if (this.comboText) {
            if (this.combo > 0) {
                this.comboText.setText(`🔥 ${this.combo} 连击`);
            } else {
                this.comboText.setText('');
            }
        }
        
        // 更新灵力条
        this.updateEnergyBar();
        
        // 更新统计
        this.updateStats();
    }
    
    updateEnergyBar() {
        const maxWidth = 110;
        const width = (this.energy / this.maxEnergy) * maxWidth;
        this.energyBar.width = width;
        
        // 根据灵力值改变颜色
        if (this.energy < 30) {
            this.energyBar.setFillStyle(0xff6b6b, 1);
        } else if (this.energy < 60) {
            this.energyBar.setFillStyle(0xf5a623, 1);
        } else {
            this.energyBar.setFillStyle(0x667eea, 1);
        }
        
        // 安全检查：确保energyText存在
        if (this.energyText) {
            this.energyText.setText(`灵力: ${this.energy}/${this.maxEnergy}`);
        }
    }
    
    updateStats() {
        const accuracy = this.solvedCount + this.wrongCount > 0 
            ? Math.round((this.solvedCount / (this.solvedCount + this.wrongCount)) * 100) 
            : 0;
        
        // 安全检查：确保statsText存在
        if (this.statsText) {
            this.statsText.setText(`正确: ${this.solvedCount} | 错误: ${this.wrongCount}\n准确率: ${accuracy}%`);
        }
    }
    
    gameOver(reason) {
        this.isGameActive = false;
        
        if (this.timeEvent) {
            this.timeEvent.remove();
        }
        
        this.showGameOverScreen(reason, false);
    }
    
    victory() {
        this.isGameActive = false;
        
        if (this.timeEvent) {
            this.timeEvent.remove();
        }
        
        this.showGameOverScreen('挑战完成', true);
    }
    
    showGameOverScreen(reason, isVictory) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 遮罩
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setDepth(300);
        
        // 结果面板
        const panel = this.add.container(width / 2, height / 2);
        panel.setDepth(301);
        
        const bg = this.add.rectangle(0, 0, 400, 350, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(3, isVictory ? 0x50e3c2 : 0xff6b6b);
        
        const title = this.add.text(0, -130, isVictory ? '🎉 挑战成功!' : '💫 挑战结束', {
            fontSize: '32px',
            fill: isVictory ? '#50E3C2' : '#FF6B6B',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const reasonText = this.add.text(0, -90, reason, {
            fontSize: '18px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        const scoreLabel = this.add.text(0, -40, '最终得分', {
            fontSize: '16px',
            fill: '#AAAAAA',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        const finalScore = this.add.text(0, 0, this.score.toString(), {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const statsLabel = this.add.text(0, 60, 
            `正确: ${this.solvedCount} | 错误: ${this.wrongCount} | 最大连击: ${this.maxCombo}`, {
            fontSize: '14px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        // 按钮
        const retryBtn = this.createEndButton(0, 110, '🔄 再来一次', () => {
            this.scene.restart({ mode: this.gameMode, difficulty: this.difficulty });
        });
        
        const exitBtn = this.createEndButton(0, 160, '🏠 返回', () => {
            this.exitGame();
        });
        
        panel.add([bg, title, reasonText, scoreLabel, finalScore, statsLabel, retryBtn, exitBtn]);
        
        // 入场动画
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }
    
    createEndButton(x, y, text, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 180, 40, 0x333333, 0.9);
        bg.setStrokeStyle(2, 0x667eea);
        bg.setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        
        bg.on('pointerover', () => bg.setFillStyle(0x444444, 1));
        bg.on('pointerout', () => bg.setFillStyle(0x333333, 0.9));
        bg.on('pointerdown', callback);
        
        return container;
    }
    
    exitGame() {
        this.scene.start('GameScene', { preserveData: true });
    }
}