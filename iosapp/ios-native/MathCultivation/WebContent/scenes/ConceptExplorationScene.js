/**
 * 数学概念探索场景
 * 提供交互式的数学概念学习体验
 */
export class ConceptExplorationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConceptExplorationScene' });
        this.conceptLibrary = null;
        this.currentConcept = null;
        this.currentChallenge = null;
        this.ui = {};
    }
    
    init(data) {
        this.conceptId = data.conceptId;
        this.player = data.player || window.gameData.player;
    }
    
    async create() {
        console.log('ConceptExplorationScene 创建中...', this.conceptId);
        
        // 动态导入概念库
        try {
            const module = await import('../core/MathematicalConcept.js');
            this.conceptLibrary = new module.ConceptLibrary();
            this.currentConcept = this.conceptLibrary.getConcept(this.conceptId);
            
            if (!this.currentConcept) {
                console.error('概念不存在:', this.conceptId);
                this.scene.start('GameScene');
                return;
            }
            
            this.createUI();
            this.player.startConceptExploration(this.conceptId);
            
        } catch (error) {
            console.error('加载概念库失败:', error);
            this.scene.start('GameScene');
        }
    }
    
    createUI() {
        // 创建背景
        this.createBackground();
        
        // 创建概念信息面板
        this.createConceptPanel();
        
        // 创建挑战选择面板
        this.createChallengePanel();
        
        // 创建小游戏按钮
        this.createGameButton();
        
        // 创建进度显示
        this.createProgressDisplay();
        
        // 创建返回按钮
        this.createBackButton();
    }
    
    createBackground() {
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // 添加数学符号装饰
        this.createMathSymbols();
    }
    
    createMathSymbols() {
        const symbols = ['∫', '∑', '∞', 'π', 'φ', '∂', '∇', '∆', 'α', 'β', 'γ', 'δ', 'ε'];
        
        for (let i = 0; i < 15; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const x = Math.random() * this.cameras.main.width;
            const y = Math.random() * this.cameras.main.height;
            const size = 20 + Math.random() * 30;
            
            const text = this.add.text(x, y, symbol, {
                fontSize: `${size}px`,
                fill: '#ffffff',
                alpha: 0.1
            });
            
            // 添加缓慢旋转动画
            this.tweens.add({
                targets: text,
                rotation: Math.PI * 2,
                duration: 20000 + Math.random() * 10000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }
    
    createConceptPanel() {
        const panelX = 50;
        const panelY = 50;
        const panelWidth = 500;
        const panelHeight = 300;
        
        // 面板背景
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.8);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        panel.lineStyle(2, 0x4a90e2);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        
        // 概念标题
        this.ui.conceptTitle = this.add.text(panelX + 20, panelY + 20, this.currentConcept.name, {
            fontSize: '28px',
            fill: '#4a90e2',
            fontWeight: 'bold'
        });
        
        // 概念描述
        this.ui.conceptDescription = this.add.text(panelX + 20, panelY + 60, this.currentConcept.description, {
            fontSize: '16px',
            fill: '#ffffff',
            wordWrap: { width: panelWidth - 40 }
        });
        
        // 直觉解释
        this.ui.conceptIntuition = this.add.text(panelX + 20, panelY + 120, `💡 ${this.currentConcept.intuition}`, {
            fontSize: '14px',
            fill: '#f5a623',
            wordWrap: { width: panelWidth - 40 }
        });
        
        // 历史背景
        if (this.currentConcept.historicalContext) {
            this.ui.historicalContext = this.add.text(panelX + 20, panelY + 200, `📚 ${this.currentConcept.historicalContext}`, {
                fontSize: '12px',
                fill: '#50e3c2',
                wordWrap: { width: panelWidth - 40 }
            });
        }
    }
    
    createChallengePanel() {
        const panelX = 600;
        const panelY = 50;
        const panelWidth = 550;
        const panelHeight = 500;
        
        // 面板背景
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.8);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        panel.lineStyle(2, 0xbd10e0);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        
        // 挑战标题
        this.add.text(panelX + 20, panelY + 20, '🎯 交互式探索挑战', {
            fontSize: '24px',
            fill: '#bd10e0',
            fontWeight: 'bold'
        });
        
        // 创建挑战按钮
        const challenges = this.currentConcept.getExplorationChallenges();
        let buttonY = panelY + 70;
        
        challenges.forEach((challenge, index) => {
            this.createChallengeButton(panelX + 20, buttonY, panelWidth - 40, challenge, index);
            buttonY += 100;
        });
        
        // 如果没有挑战，显示提示
        if (challenges.length === 0) {
            this.add.text(panelX + 20, buttonY, '此概念暂无交互式挑战\n请通过答题来学习此概念', {
                fontSize: '16px',
                fill: '#ffffff',
                wordWrap: { width: panelWidth - 40 }
            });
        }
        
        // 添加小游戏按钮
        const gameButtonY = Math.max(buttonY + 50, panelY + panelHeight - 80);
        this.createGameButton(panelX + 20, gameButtonY, panelWidth - 40);
    }
    
    createGameButton(x, y, width) {
        const buttonHeight = 60;
        
        // 小游戏按钮背景
        const button = this.add.graphics();
        button.fillStyle(0x50e3c2, 0.9);
        button.fillRoundedRect(x, y, width, buttonHeight, 8);
        button.lineStyle(2, 0x50e3c2);
        button.strokeRoundedRect(x, y, width, buttonHeight, 8);
        
        // 游戏图标和标题
        const title = this.add.text(x + 15, y + 15, '🎮 互动小游戏', {
            fontSize: '18px',
            fill: '#ffffff',
            fontWeight: 'bold'
        });
        
        // 游戏描述
        const description = this.add.text(x + 15, y + 35, '通过趣味游戏深度体验数学概念', {
            fontSize: '14px',
            fill: '#ffffff'
        });
        
        // 开始按钮
        const startButton = this.add.text(x + width - 80, y + buttonHeight / 2, '开始游戏', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#4ac9b0',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // 交互区域
        const interactiveArea = this.add.rectangle(x + width/2, y + buttonHeight/2, width, buttonHeight, 0x000000, 0);
        interactiveArea.setInteractive({ useHandCursor: true });
        
        interactiveArea.on('pointerover', () => {
            button.clear();
            button.fillStyle(0x4ac9b0, 0.9);
            button.fillRoundedRect(x, y, width, buttonHeight, 8);
            button.lineStyle(3, 0x4ac9b0);
            button.strokeRoundedRect(x, y, width, buttonHeight, 8);
        });
        
        interactiveArea.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x50e3c2, 0.9);
            button.fillRoundedRect(x, y, width, buttonHeight, 8);
            button.lineStyle(2, 0x50e3c2);
            button.strokeRoundedRect(x, y, width, buttonHeight, 8);
        });
        
        interactiveArea.on('pointerdown', () => {
            // 启动对应概念的小游戏
            this.scene.start('ConceptGameScene', {
                conceptId: this.conceptId,
                player: this.player,
                returnScene: 'ConceptExplorationScene'
            });
        });
    }
    
    createChallengeButton(x, y, width, challenge, index) {
        const buttonHeight = 80;
        
        // 按钮背景
        const button = this.add.graphics();
        button.fillStyle(0x333333, 0.9);
        button.fillRoundedRect(x, y, width, buttonHeight, 5);
        button.lineStyle(1, 0x666666);
        button.strokeRoundedRect(x, y, width, buttonHeight, 5);
        
        // 挑战标题
        const title = this.add.text(x + 15, y + 10, challenge.title, {
            fontSize: '18px',
            fill: '#ffffff',
            fontWeight: 'bold'
        });
        
        // 挑战描述
        const description = this.add.text(x + 15, y + 35, challenge.description, {
            fontSize: '14px',
            fill: '#cccccc',
            wordWrap: { width: width - 30 }
        });
        
        // 进度显示
        const progress = this.player.getConceptProgress(this.conceptId);
        const progressText = this.add.text(x + width - 100, y + 10, `进度: ${progress}%`, {
            fontSize: '12px',
            fill: progress >= 100 ? '#50e3c2' : '#f5a623'
        });
        
        // 添加交互
        const interactiveArea = this.add.rectangle(x + width/2, y + buttonHeight/2, width, buttonHeight, 0x000000, 0);
        interactiveArea.setInteractive();
        
        interactiveArea.on('pointerover', () => {
            button.clear();
            button.fillStyle(0x444444, 0.9);
            button.fillRoundedRect(x, y, width, buttonHeight, 5);
            button.lineStyle(2, 0x4a90e2);
            button.strokeRoundedRect(x, y, width, buttonHeight, 5);
        });
        
        interactiveArea.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x333333, 0.9);
            button.fillRoundedRect(x, y, width, buttonHeight, 5);
            button.lineStyle(1, 0x666666);
            button.strokeRoundedRect(x, y, width, buttonHeight, 5);
        });
        
        interactiveArea.on('pointerdown', () => {
            this.startChallenge(challenge);
        });
    }
    
    createProgressDisplay() {
        const x = 50;
        const y = 400;
        const width = 500;
        
        // 进度条背景
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x333333);
        progressBg.fillRoundedRect(x, y, width, 30, 15);
        
        // 进度条
        const progress = this.player.getConceptProgress(this.conceptId);
        const progressWidth = (progress / 100) * width;
        
        this.ui.progressBar = this.add.graphics();
        this.ui.progressBar.fillStyle(0x4a90e2);
        this.ui.progressBar.fillRoundedRect(x, y, progressWidth, 30, 15);
        
        // 进度文本
        this.ui.progressText = this.add.text(x + width/2, y + 15, `概念掌握度: ${progress}%`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 掌握状态
        if (this.player.hasConceptMastered(this.conceptId)) {
            this.add.text(x + width/2, y + 50, '✅ 已完全掌握此概念！', {
                fontSize: '18px',
                fill: '#50e3c2',
                fontWeight: 'bold'
            }).setOrigin(0.5);
        }
    }
    
    createBackButton() {
        const button = this.add.graphics();
        button.fillStyle(0x666666, 0.9);
        button.fillRoundedRect(50, 600, 120, 40, 5);
        button.lineStyle(1, 0x999999);
        button.strokeRoundedRect(50, 600, 120, 40, 5);
        
        const text = this.add.text(110, 620, '返回游戏', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const interactiveArea = this.add.rectangle(110, 620, 120, 40, 0x000000, 0);
        interactiveArea.setInteractive();
        
        interactiveArea.on('pointerover', () => {
            button.clear();
            button.fillStyle(0x777777, 0.9);
            button.fillRoundedRect(50, 600, 120, 40, 5);
            button.lineStyle(2, 0x4a90e2);
            button.strokeRoundedRect(50, 600, 120, 40, 5);
        });
        
        interactiveArea.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x666666, 0.9);
            button.fillRoundedRect(50, 600, 120, 40, 5);
            button.lineStyle(1, 0x999999);
            button.strokeRoundedRect(50, 600, 120, 40, 5);
        });
        
        interactiveArea.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
    
    startChallenge(challenge) {
        console.log('开始挑战:', challenge.title);
        
        // 根据挑战类型启动相应的交互
        switch (challenge.type) {
            case 'construction':
            case 'proof':
            case 'game':
                this.startInteractiveChallenge(challenge);
                break;
            case 'visualization':
            case 'animation':
            case '3d_visualization':
                this.startVisualizationChallenge(challenge);
                break;
            case 'calculation':
            case 'exploration':
                this.startCalculationChallenge(challenge);
                break;
            default:
                this.startGenericChallenge(challenge);
        }
    }
    
    startInteractiveChallenge(challenge) {
        // 创建模态对话框
        this.createChallengeModal(challenge, () => {
            // 模拟挑战完成
            const success = Math.random() > 0.3; // 70% 成功率
            const result = this.player.completeConceptChallenge(this.conceptId, challenge.type, success);
            
            if (result.success) {
                this.showSuccessMessage(`挑战成功！获得 ${result.progressGain}% 进度`);
                this.updateProgressDisplay();
                
                if (result.mastered) {
                    this.showMasteryMessage();
                }
            } else {
                this.showFailureMessage('挑战失败，请再试一次');
            }
        });
    }
    
    startVisualizationChallenge(challenge) {
        this.createChallengeModal(challenge, () => {
            // 可视化挑战总是成功，但进度较少
            const result = this.player.completeConceptChallenge(this.conceptId, challenge.type, true);
            this.showSuccessMessage(`观察完成！获得 ${result.progressGain}% 进度`);
            this.updateProgressDisplay();
            
            if (result.mastered) {
                this.showMasteryMessage();
            }
        });
    }
    
    startCalculationChallenge(challenge) {
        this.createChallengeModal(challenge, () => {
            // 计算挑战需要验证答案
            const success = Math.random() > 0.4; // 60% 成功率
            const result = this.player.completeConceptChallenge(this.conceptId, challenge.type, success);
            
            if (result.success) {
                this.showSuccessMessage(`计算正确！获得 ${result.progressGain}% 进度`);
                this.updateProgressDisplay();
                
                if (result.mastered) {
                    this.showMasteryMessage();
                }
            } else {
                this.showFailureMessage('计算错误，请检查步骤');
            }
        });
    }
    
    startGenericChallenge(challenge) {
        this.createChallengeModal(challenge, () => {
            const success = Math.random() > 0.5; // 50% 成功率
            const result = this.player.completeConceptChallenge(this.conceptId, challenge.type, success);
            
            if (result.success) {
                this.showSuccessMessage(`挑战完成！获得 ${result.progressGain}% 进度`);
                this.updateProgressDisplay();
                
                if (result.mastered) {
                    this.showMasteryMessage();
                }
            } else {
                this.showFailureMessage('挑战未完成，请再试一次');
            }
        });
    }
    
    createChallengeModal(challenge, onComplete) {
        // 创建模态背景
        const modalBg = this.add.graphics();
        modalBg.fillStyle(0x000000, 0.7);
        modalBg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // 创建模态面板
        const panelWidth = 600;
        const panelHeight = 400;
        const panelX = (this.cameras.main.width - panelWidth) / 2;
        const panelY = (this.cameras.main.height - panelHeight) / 2;
        
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.95);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        panel.lineStyle(2, 0x4a90e2);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        
        // 挑战标题
        const title = this.add.text(panelX + panelWidth/2, panelY + 40, challenge.title, {
            fontSize: '24px',
            fill: '#4a90e2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 挑战描述
        const description = this.add.text(panelX + 30, panelY + 80, challenge.description, {
            fontSize: '16px',
            fill: '#ffffff',
            wordWrap: { width: panelWidth - 60 }
        });
        
        // 模拟挑战内容
        const challengeContent = this.add.text(panelX + 30, panelY + 150, this.getChallengeContent(challenge), {
            fontSize: '14px',
            fill: '#cccccc',
            wordWrap: { width: panelWidth - 60 }
        });
        
        // 完成按钮
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonX = panelX + panelWidth/2 - buttonWidth/2;
        const buttonY = panelY + panelHeight - 80;
        
        const button = this.add.graphics();
        button.fillStyle(0x4a90e2, 0.9);
        button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
        
        const buttonText = this.add.text(buttonX + buttonWidth/2, buttonY + buttonHeight/2, '完成挑战', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const buttonArea = this.add.rectangle(buttonX + buttonWidth/2, buttonY + buttonHeight/2, buttonWidth, buttonHeight, 0x000000, 0);
        buttonArea.setInteractive();
        
        buttonArea.on('pointerdown', () => {
            // 清理模态
            modalBg.destroy();
            panel.destroy();
            title.destroy();
            description.destroy();
            challengeContent.destroy();
            button.destroy();
            buttonText.destroy();
            buttonArea.destroy();
            
            // 执行完成回调
            onComplete();
        });
    }
    
    getChallengeContent(challenge) {
        // 根据挑战类型返回不同的内容
        const contentMap = {
            'construction': '请按照步骤构造数学对象...\n1. 从基础元素开始\n2. 应用构造规则\n3. 验证结果',
            'proof': '请完成以下证明步骤...\n1. 假设条件\n2. 逻辑推理\n3. 得出结论',
            'visualization': '观察以下可视化内容...\n• 注意关键特征\n• 理解几何关系\n• 记住重要性质',
            'game': '参与以下数学游戏...\n• 按照规则操作\n• 达成目标条件\n• 理解背后原理',
            'calculation': '完成以下计算...\n• 应用相关公式\n• 注意计算步骤\n• 验证答案合理性',
            'substitution': '进行符号替换练习...\n• 理解变量的含义\n• 练习抽象思维\n• 体验符号的力量',
            'pattern_recognition': '识别数学模式...\n• 观察规律性\n• 抽象共同特征\n• 形成一般结论',
            'balance_game': '天平平衡游戏...\n• 保持等式平衡\n• 理解方程本质\n• 掌握变换规则',
            'step_by_step': '逐步求解练习...\n• 按步骤操作\n• 理解每步原理\n• 形成解题思路',
            'compass_ruler_construction': '尺规作图挑战...\n• 只用圆规和直尺\n• 严格按照公理\n• 体验几何之美',
            'proof_exploration': '几何证明探索...\n• 从公理出发\n• 逻辑严密推理\n• 得出几何定理',
            'circle_animation': '单位圆动画观察...\n• 观察角度变化\n• 理解三角函数\n• 建立几何直觉',
            'wave_generation': '波形生成实验...\n• 从圆到波\n• 理解周期性\n• 连接几何与代数',
            'discontinuity_classification': '间断点分类...\n• 识别间断类型\n• 理解连续性\n• 掌握分析概念',
            'function_morphing': '函数连续变形...\n• 观察连续变化\n• 理解连续性质\n• 建立分析直觉',
            'secant_to_tangent': '割线到切线...\n• 观察极限过程\n• 理解导数定义\n• 体验微积分思想',
            'practical_derivatives': '实际应用计算...\n• 解决实际问题\n• 理解导数意义\n• 连接数学与现实',
            'convergence_analysis': '收敛性分析...\n• 判别收敛性\n• 理解极限理论\n• 掌握分析方法',
            'compactness_properties': '紧致性探索...\n• 理解紧致概念\n• 掌握重要性质\n• 应用于分析',
            'measure_building': '测度构造...\n• 从简单到复杂\n• 理解测度概念\n• 掌握构造方法',
            'integration_methods': '积分方法比较...\n• 比较不同积分\n• 理解积分理论\n• 掌握现代方法'
        };
        
        return contentMap[challenge.type] || '完成这个数学挑战来加深理解...';
    }
    
    updateProgressDisplay() {
        const progress = this.player.getConceptProgress(this.conceptId);
        const width = 500;
        const progressWidth = (progress / 100) * width;
        
        // 更新进度条
        this.ui.progressBar.clear();
        this.ui.progressBar.fillStyle(0x4a90e2);
        this.ui.progressBar.fillRoundedRect(50, 400, progressWidth, 30, 15);
        
        // 更新进度文本
        this.ui.progressText.setText(`概念掌握度: ${progress}%`);
    }
    
    showSuccessMessage(message) {
        const text = this.add.text(this.cameras.main.width/2, 300, message, {
            fontSize: '20px',
            fill: '#50e3c2',
            fontWeight: 'bold',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // 淡出动画
        this.tweens.add({
            targets: text,
            alpha: 0,
            y: 250,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }
    
    showFailureMessage(message) {
        const text = this.add.text(this.cameras.main.width/2, 300, message, {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontWeight: 'bold',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // 淡出动画
        this.tweens.add({
            targets: text,
            alpha: 0,
            y: 250,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }
    
    showMasteryMessage() {
        const text = this.add.text(this.cameras.main.width/2, 200, '🎉 概念完全掌握！🎉', {
            fontSize: '32px',
            fill: '#ffd93d',
            fontWeight: 'bold',
            backgroundColor: '#000000',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5);
        
        // 闪烁动画
        this.tweens.add({
            targets: text,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 2,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 1000,
                    delay: 1000,
                    onComplete: () => text.destroy()
                });
            }
        });
    }
}