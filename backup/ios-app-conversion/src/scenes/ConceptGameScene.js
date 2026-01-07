/**
 * 数学概念小游戏场景
 * 为每个数学概念提供专门的交互式小游戏
 */
export class ConceptGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConceptGameScene' });
        this.conceptId = null;
        this.gameData = {};
        this.ui = {};
        this.gameObjects = [];
    }
    
    init(data) {
        this.conceptId = data.conceptId;
        this.player = data.player || window.gameData.player;
        this.returnScene = data.returnScene || 'ConceptExplorationScene';
    }
    
    // 安全获取相机尺寸的辅助函数
    getSafeCameraDimensions() {
        if (!this.cameras || !this.cameras.main) {
            console.warn('相机未初始化，使用默认尺寸');
            return { width: 800, height: 600 };
        }
        return {
            width: this.cameras.main.width,
            height: this.cameras.main.height
        };
    }

    create() {
        console.log('ConceptGameScene 创建中...', this.conceptId);
        
        // 清理之前的游戏对象
        this.clearGameObjects();
        
        // 重置UI和游戏数据
        this.ui = {};
        this.gameData = {};
        this.gameObjects = [];
        
        // 创建背景
        this.createBackground();
        
        // 创建通用UI
        this.createCommonUI();
        
        // 根据概念ID启动对应的小游戏
        this.startConceptGame();
    }
    
    // 清理游戏对象的方法
    clearGameObjects() {
        // 清理之前创建的所有游戏对象
        if (this.gameObjects && this.gameObjects.length > 0) {
            this.gameObjects.forEach(obj => {
                if (obj && obj.destroy) {
                    obj.destroy();
                }
            });
            this.gameObjects = [];
        }
        
        // 清理所有子对象（更彻底的清理）
        if (this.children) {
            this.children.removeAll(true);
        }
    }
    
    createBackground() {
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0f0f23, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // 添加粒子效果
        this.createParticleEffect();
    }
    
    createParticleEffect() {
        // 创建数学符号粒子
        const symbols = ['∫', '∑', '∞', 'π', 'φ', '∂', '∇', '∆', 'α', 'β', 'γ', 'δ', 'ε'];
        
        for (let i = 0; i < 20; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const x = Math.random() * this.cameras.main.width;
            const y = Math.random() * this.cameras.main.height;
            
            const text = this.add.text(x, y, symbol, {
                fontSize: `${15 + Math.random() * 20}px`,
                fill: '#ffffff',
                alpha: 0.05 + Math.random() * 0.1
            });
            
            // 缓慢漂浮动画
            this.tweens.add({
                targets: text,
                y: y - 100,
                alpha: 0,
                duration: 15000 + Math.random() * 10000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }
    
    startConceptGame() {
        // 确保UI已经创建完成
        this.time.delayedCall(100, () => {
            console.log('延迟启动概念游戏，UI状态:', {
                gameTitle: !!this.ui.gameTitle,
                gameInstructions: !!this.ui.gameInstructions,
                scoreText: !!this.ui.scoreText
            });
            
            // 根据概念ID启动对应的小游戏
            switch (this.conceptId) {
                case 'peano_axioms':
                    this.startPeanoAxiomsGame();
                    break;
                case 'irrational_discovery':
                    this.startIrrationalDiscoveryGame();
                    break;
                case 'variable_abstraction':
                    this.startVariableAbstractionGame();
                    break;
                case 'functional_thinking':
                    this.startFunctionalThinkingGame();
                    break;
                case 'equation_solving':
                    this.startEquationSolvingGame();
                    break;
                case 'euclidean_axioms':
                    this.startEuclideanAxiomsGame();
                    break;
                case 'distance_metrics':
                    this.startDistanceMetricsGame();
                    break;
                case 'trigonometric_circle':
                    this.startTrigonometricCircleGame();
                    break;
                case 'epsilon_delta':
                    this.startEpsilonDeltaGame();
                    break;
                case 'zeno_paradoxes':
                    this.startZenoParadoxesGame();
                    break;
                case 'continuity_concept':
                    this.startContinuityConceptGame();
                    break;
                case 'derivative_definition':
                    this.startDerivativeDefinitionGame();
                    break;
                case 'staircase_paradox':
                    this.startStaircaseParadoxGame();
                    break;
                case 'schwarz_lantern':
                    this.startSchwarzLanternGame();
                    break;
                case 'real_analysis':
                    this.startRealAnalysisGame();
                    break;
                case 'measure_theory':
                    this.startMeasureTheoryGame();
                    break;
                case 'mathematical_induction':
                    this.startMathematicalInductionGame();
                    break;
                default:
                    console.warn('未知的概念ID:', this.conceptId);
                    if (this.ui.gameTitle && this.ui.gameInstructions) {
                        this.ui.gameTitle.setText('概念游戏');
                        this.ui.gameInstructions.setText('该概念的游戏正在开发中...');
                    }
            }
        });
    }
    
    createCommonUI() {
        console.log('创建通用UI');
        const { width, height } = this.getSafeCameraDimensions();
        
        // 确保ui对象存在
        if (!this.ui) {
            this.ui = {};
        }
        
        // 返回按钮
        const backButton = this.add.text(50, 50, '← 返回', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 10 }
        }).setInteractive({ useHandCursor: true });
        
        backButton.on('pointerdown', () => {
            this.scene.start(this.returnScene, {
                conceptId: this.conceptId,
                player: this.player
            });
        });
        
        // 游戏标题
        this.ui.gameTitle = this.add.text(width / 2, 50, '', {
            fontSize: '24px',
            fill: '#4a90e2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        console.log('gameTitle创建完成:', !!this.ui.gameTitle);
        
        // 游戏说明
        this.ui.gameInstructions = this.add.text(width / 2, 100, '', {
            fontSize: '16px',
            fill: '#cccccc',
            wordWrap: { width: width - 100 }
        }).setOrigin(0.5);
        
        // 分数显示
        this.ui.scoreText = this.add.text(width - 50, 50, '分数: 0', {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(1, 0);
        
        // 游戏统计按钮
        const statsButton = this.add.text(50, height - 50, '📊', {
            fontSize: '24px',
            fill: '#888888'
        }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
        
        statsButton.on('pointerdown', () => {
            this.showGameStats();
        });
        
        // 确保gameData对象存在
        if (!this.gameData) {
            this.gameData = {};
        }
        this.gameData.score = 0;
        
        console.log('通用UI创建完成，所有元素状态:', {
            gameTitle: !!this.ui.gameTitle,
            gameInstructions: !!this.ui.gameInstructions,
            scoreText: !!this.ui.scoreText
        });
    }
    
    // 安全设置UI文本的辅助方法
    safeSetText(element, text) {
        try {
            if (element && typeof element.setText === 'function') {
                element.setText(text);
                return true;
            } else {
                console.error('UI元素不存在或没有setText方法:', element);
                return false;
            }
        } catch (error) {
            console.error('设置UI文本时出错:', error);
            return false;
        }
    }
    
    // 安全设置游戏标题和说明
    safeSetGameUI(title, instructions) {
        const titleSet = this.safeSetText(this.ui.gameTitle, title);
        const instructionsSet = this.safeSetText(this.ui.gameInstructions, instructions);
        return titleSet && instructionsSet;
    }
    
    // 安全添加游戏对象并跟踪
    safeAddGameObject(gameObject) {
        if (gameObject) {
            this.gameObjects.push(gameObject);
        }
        return gameObject;
    }
    
    // 清理特定游戏的UI元素
    clearGameSpecificUI() {
        // 清理除了通用UI之外的所有元素
        const commonUIKeys = ['gameTitle', 'gameInstructions', 'scoreText'];
        
        Object.keys(this.ui).forEach(key => {
            if (!commonUIKeys.includes(key) && this.ui[key]) {
                if (this.ui[key].destroy) {
                    this.ui[key].destroy();
                }
                delete this.ui[key];
            }
        });
    }
    
    // 游戏完成处理
    completeGame(message) {
        // 保存游戏进度
        this.saveGameProgress();
        
        // 显示完成消息
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const completionText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2, message, {
                fontSize: '24px',
                fill: '#50e3c2',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 20, y: 15 },
                wordWrap: { width: width - 100 }
            }).setOrigin(0.5)
        );
        
        // 显示获得的奖励
        const scoreGain = this.gameData.score || 0;
        const progressGain = Math.min(50, Math.floor(scoreGain / 10));
        
        const rewardText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 + 60, 
                `🎯 获得分数: ${scoreGain}\n📈 概念进度: +${progressGain}%`, {
                fontSize: '16px',
                fill: '#f5a623',
                align: 'center'
            }).setOrigin(0.5)
        );
        
        // 延迟后返回概念探索场景
        this.time.delayedCall(4000, () => {
            this.scene.start(this.returnScene, {
                conceptId: this.conceptId,
                player: this.player
            });
        });
    }
    
    // 保存游戏进度
    saveGameProgress() {
        if (this.player && this.conceptId) {
            const scoreGain = this.gameData.score || 0;
            const progressGain = Math.min(50, Math.floor(scoreGain / 10));
            
            // 更新概念进度
            const currentProgress = this.player.getConceptProgress(this.conceptId);
            this.player.updateConceptProgress(this.conceptId, Math.min(100, currentProgress + progressGain));
            
            // 保存游戏统计
            const gameStats = {
                conceptId: this.conceptId,
                score: scoreGain,
                completedAt: new Date().toISOString(),
                attempts: this.gameData.totalQuestions || 1,
                accuracy: this.gameData.correctAnswers ? 
                    (this.gameData.correctAnswers / (this.gameData.totalQuestions || 1) * 100).toFixed(1) : 100
            };
            
            // 保存到本地存储
            const existingStats = JSON.parse(localStorage.getItem('concept_game_stats') || '[]');
            existingStats.push(gameStats);
            
            // 只保留最近50次记录
            if (existingStats.length > 50) {
                existingStats.splice(0, existingStats.length - 50);
            }
            
            localStorage.setItem('concept_game_stats', JSON.stringify(existingStats));
            
            console.log('游戏进度已保存:', gameStats);
        }
    }
    
    // 显示游戏统计
    showGameStats() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const stats = this.loadGameStats();
        
        // 创建统计面板背景
        const statsPanel = this.safeAddGameObject(
            this.add.rectangle(width / 2, height / 2, width - 100, height - 100, 0x000000, 0.9)
        );
        statsPanel.setStrokeStyle(2, 0x4a90e2);
        
        // 标题
        const title = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 180, '🎮 游戏统计', {
                fontSize: '24px',
                fill: '#4a90e2',
                fontWeight: 'bold'
            }).setOrigin(0.5)
        );
        
        if (stats.length === 0) {
            // 没有统计数据
            const noDataText = this.safeAddGameObject(
                this.add.text(width / 2, height / 2, '还没有游戏记录\n开始游戏来建立你的统计数据！', {
                    fontSize: '18px',
                    fill: '#888888',
                    align: 'center'
                }).setOrigin(0.5)
            );
        } else {
            // 计算统计数据
            const totalGames = stats.length;
            const totalScore = stats.reduce((sum, stat) => sum + stat.score, 0);
            const avgScore = (totalScore / totalGames).toFixed(1);
            const avgAccuracy = (stats.reduce((sum, stat) => sum + parseFloat(stat.accuracy), 0) / totalGames).toFixed(1);
            const bestScore = Math.max.apply(Math, stats.map(function(stat) { return stat.score; }));
            const recentGames = stats.slice(-5);
            
            // 显示统计信息
            const statsText = [
                `🎯 总游戏次数: ${totalGames}`,
                `📊 平均分数: ${avgScore}`,
                `🎪 最高分数: ${bestScore}`,
                `✅ 平均准确率: ${avgAccuracy}%`,
                '',
                '📈 最近5次游戏:'
            ];
            
            recentGames.forEach((game, index) => {
                const date = new Date(game.completedAt).toLocaleDateString();
                statsText.push(`${index + 1}. ${date} - 分数:${game.score} 准确率:${game.accuracy}%`);
            });
            
            const statsDisplay = this.safeAddGameObject(
                this.add.text(width / 2, height / 2 - 50, statsText.join('\n'), {
                    fontSize: '16px',
                    fill: '#ffffff',
                    align: 'left',
                    lineSpacing: 8
                }).setOrigin(0.5)
            );
        }
        
        // 关闭按钮
        const closeButton = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 + 160, '关闭', {
                fontSize: '18px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        );
        
        closeButton.on('pointerdown', () => {
            // 销毁统计面板
            [statsPanel, title, closeButton].forEach(obj => {
                if (obj && obj.destroy) obj.destroy();
            });
            
            // 销毁其他统计相关对象
            this.children.list.forEach(child => {
                if (child.getData && child.getData('isStatsPanel')) {
                    child.destroy();
                }
            });
        });
        
        // 标记统计面板对象
        [statsPanel, title, closeButton].forEach(obj => {
            if (obj && obj.setData) obj.setData('isStatsPanel', true);
        });
    }
    
    // 加载游戏统计
    loadGameStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('concept_game_stats') || '[]');
            return stats.filter(stat => stat.conceptId === this.conceptId);
        } catch (error) {
            console.error('加载游戏统计失败:', error);
            return [];
        }
    }
    
    // 场景销毁时的清理
    destroy() {
        this.clearGameObjects();
        super.destroy();
    }
    
    // ==================== 皮亚诺公理游戏 ====================
    startPeanoAxiomsGame() {
        console.log('开始皮亚诺公理游戏');
        console.log('UI对象:', this.ui);
        console.log('gameTitle存在:', !!this.ui.gameTitle);
        console.log('gameInstructions存在:', !!this.ui.gameInstructions);
        
        if (!this.ui.gameTitle) {
            console.error('gameTitle未创建');
            return;
        }
        
        if (!this.ui.gameInstructions) {
            console.error('gameInstructions未创建');
            return;
        }
        
        // 安全地设置UI文本
        if (!this.safeSetGameUI('🔢 自然数构造游戏', '使用后继函数S(n)从0开始构造自然数！点击按钮来构造下一个数。')) {
            console.error('无法设置皮亚诺公理游戏UI');
            return;
        }
        
        // 清理之前的游戏特定UI
        this.clearGameSpecificUI();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 游戏数据
        this.gameData.currentNumber = 0;
        this.gameData.targetNumber = 5 + Math.floor(Math.random() * 10);
        this.gameData.constructedNumbers = [0];
        
        // 显示当前数字
        this.ui.currentNumberText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 100, '当前数字: 0', {
                fontSize: '32px',
                fill: '#4a90e2',
                fontWeight: 'bold'
            }).setOrigin(0.5)
        );
        
        // 显示目标
        this.ui.targetText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 50, `目标: 构造到数字 ${this.gameData.targetNumber}`, {
                fontSize: '20px',
                fill: '#f5a623'
            }).setOrigin(0.5)
        );
        
        // 后继函数按钮
        const successorButton = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 + 50, 'S(n) = n + 1', {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#50e3c2',
                padding: { x: 20, y: 15 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        );
        
        successorButton.on('pointerdown', () => {
            this.applySuccessorFunction();
        });
        
        // 构造历史显示
        this.ui.historyText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 + 150, '构造历史: 0', {
                fontSize: '16px',
                fill: '#cccccc',
                wordWrap: { width: width - 100 }
            }).setOrigin(0.5)
        );
    }
    
    applySuccessorFunction() {
        this.gameData.currentNumber++;
        this.gameData.constructedNumbers.push(this.gameData.currentNumber);
        
        // 更新显示
        this.ui.currentNumberText.setText(`当前数字: ${this.gameData.currentNumber}`);
        this.ui.historyText.setText(`构造历史: ${this.gameData.constructedNumbers.join(' → ')}`);
        
        // 增加分数
        this.updateScore(10);
        
        // 检查是否达到目标
        if (this.gameData.currentNumber >= this.gameData.targetNumber) {
            this.completeGame('恭喜！你成功构造了自然数序列！');
        }
    }
    
    // ==================== 无理数发现游戏 ====================
    startIrrationalDiscoveryGame() {
        if (!this.ui.gameTitle || !this.ui.gameInstructions) {
            console.error('UI元素未创建，无法启动无理数游戏');
            return;
        }
        
        if (!this.safeSetGameUI('🔍 无理数探索游戏', '尝试用分数逼近√2，发现无理数的奥秘！')) {
            console.error('无法设置无理数游戏UI');
            return;
        }
        
        // 清理之前的游戏特定UI
        this.clearGameSpecificUI();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 游戏数据
        this.gameData.sqrt2 = Math.sqrt(2);
        this.gameData.attempts = [];
        this.gameData.bestApproximation = Infinity;
        
        // 显示√2的值
        this.ui.sqrt2Text = this.add.text(width / 2, height / 2 - 100, `√2 ≈ ${this.gameData.sqrt2.toFixed(6)}`, {
            fontSize: '24px',
            fill: '#4a90e2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 输入框模拟（使用按钮）
        this.createFractionInput();
        
        // 最佳逼近显示
        this.ui.bestText = this.add.text(width / 2, height / 2 + 100, '最佳逼近: 无', {
            fontSize: '18px',
            fill: '#50e3c2'
        }).setOrigin(0.5);
        
        // 尝试历史
        this.ui.attemptsText = this.add.text(width / 2, height / 2 + 150, '尝试历史: ', {
            fontSize: '14px',
            fill: '#cccccc',
            wordWrap: { width: width - 100 }
        }).setOrigin(0.5);
    }
    
    createFractionInput() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 分子分母选择
        this.gameData.numerator = 1;
        this.gameData.denominator = 1;
        
        // 分子控制
        this.add.text(width / 2 - 100, height / 2 - 20, '分子:', {
            fontSize: '16px',
            fill: '#ffffff'
        });
        
        const numMinusBtn = this.add.text(width / 2 - 50, height / 2 - 20, '-', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true });
        
        this.ui.numeratorText = this.add.text(width / 2 - 20, height / 2 - 20, '1', {
            fontSize: '18px',
            fill: '#4a90e2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const numPlusBtn = this.add.text(width / 2 + 10, height / 2 - 20, '+', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true });
        
        // 分母控制
        this.add.text(width / 2 - 100, height / 2 + 20, '分母:', {
            fontSize: '16px',
            fill: '#ffffff'
        });
        
        const denMinusBtn = this.add.text(width / 2 - 50, height / 2 + 20, '-', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true });
        
        this.ui.denominatorText = this.add.text(width / 2 - 20, height / 2 + 20, '1', {
            fontSize: '18px',
            fill: '#4a90e2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const denPlusBtn = this.add.text(width / 2 + 10, height / 2 + 20, '+', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true });
        
        // 提交按钮
        const submitBtn = this.add.text(width / 2 + 100, height / 2, '尝试', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#50e3c2',
            padding: { x: 15, y: 10 }
        }).setInteractive({ useHandCursor: true });
        
        // 事件处理
        numMinusBtn.on('pointerdown', () => {
            if (this.gameData.numerator > 1) {
                this.gameData.numerator--;
                this.ui.numeratorText.setText(this.gameData.numerator.toString());
            }
        });
        
        numPlusBtn.on('pointerdown', () => {
            if (this.gameData.numerator < 20) {
                this.gameData.numerator++;
                this.ui.numeratorText.setText(this.gameData.numerator.toString());
            }
        });
        
        denMinusBtn.on('pointerdown', () => {
            if (this.gameData.denominator > 1) {
                this.gameData.denominator--;
                this.ui.denominatorText.setText(this.gameData.denominator.toString());
            }
        });
        
        denPlusBtn.on('pointerdown', () => {
            if (this.gameData.denominator < 20) {
                this.gameData.denominator++;
                this.ui.denominatorText.setText(this.gameData.denominator.toString());
            }
        });
        
        submitBtn.on('pointerdown', () => {
            this.tryFractionApproximation();
        });
    }
    
    tryFractionApproximation() {
        const fraction = this.gameData.numerator / this.gameData.denominator;
        const error = Math.abs(fraction - this.gameData.sqrt2);
        
        this.gameData.attempts.push({
            numerator: this.gameData.numerator,
            denominator: this.gameData.denominator,
            value: fraction,
            error: error
        });
        
        // 检查是否是更好的逼近
        if (error < this.gameData.bestApproximation) {
            this.gameData.bestApproximation = error;
            this.ui.bestText.setText(`最佳逼近: ${this.gameData.numerator}/${this.gameData.denominator} = ${fraction.toFixed(6)}`);
            this.updateScore(50);
        } else {
            this.updateScore(10);
        }
        
        // 更新尝试历史
        const lastAttempts = this.gameData.attempts.slice(-3);
        const historyText = lastAttempts.map(a => `${a.numerator}/${a.denominator}`).join(', ');
        this.ui.attemptsText.setText(`最近尝试: ${historyText}`);
        
        // 检查是否足够接近
        if (error < 0.001) {
            this.completeGame('惊人！你发现了一个非常接近√2的分数逼近！');
        } else if (this.gameData.attempts.length >= 10) {
            this.completeGame('你体验了无理数的奥秘 - 无法用分数精确表示！');
        }
    }
    
    // ==================== 变量抽象化游戏 ====================
    startVariableAbstractionGame() {
        if (!this.ui.gameTitle || !this.ui.gameInstructions) {
            console.error('UI元素未创建，无法启动变量抽象游戏');
            return;
        }
        
        if (!this.safeSetGameUI('🔤 符号抽象游戏', '将具体的数字模式抽象为代数表达式！')) {
            console.error('无法设置变量抽象游戏UI');
            return;
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 显示模式 - 先创建UI元素
        this.ui.patternText = this.add.text(width / 2, height / 2 - 80, '', {
            fontSize: '20px',
            fill: '#4a90e2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 生成模式 - 在UI元素创建后调用
        this.generatePattern();
        
        // 选项按钮
        this.createPatternOptions();
    }
    
    generatePattern() {
        const patterns = [
            {
                examples: ['2×3=6', '2×5=10', '2×7=14'],
                correct: '2×n',
                options: ['2×n', 'n×2', '2+n', 'n²'],
                explanation: '每个数都乘以2'
            },
            {
                examples: ['1+3=4', '2+3=5', '5+3=8'],
                correct: 'n+3',
                options: ['n+3', '3+n', 'n×3', '3n'],
                explanation: '每个数都加3'
            },
            {
                examples: ['1²=1', '2²=4', '3²=9'],
                correct: 'n²',
                options: ['n²', '2n', 'n+n', 'n×2'],
                explanation: '每个数的平方'
            },
            {
                examples: ['3×1+1=4', '3×2+1=7', '3×3+1=10'],
                correct: '3n+1',
                options: ['3n+1', 'n+3', '3×n', 'n²+1'],
                explanation: '每个数乘以3再加1'
            },
            {
                examples: ['5-1=4', '5-2=3', '5-4=1'],
                correct: '5-n',
                options: ['5-n', 'n-5', '5+n', 'n×5'],
                explanation: '用5减去每个数'
            },
            {
                examples: ['2×1-1=1', '2×2-1=3', '2×3-1=5'],
                correct: '2n-1',
                options: ['2n-1', '2n+1', 'n×2', '2-n'],
                explanation: '每个数乘以2再减1'
            },
            {
                examples: ['1+2=3', '2+4=6', '3+6=9'],
                correct: 'n+2n',
                options: ['n+2n', '3n', 'n²+n', '2n+1'],
                explanation: '每个数加上它的2倍'
            },
            {
                examples: ['10÷2=5', '20÷2=10', '30÷2=15'],
                correct: 'n÷2',
                options: ['n÷2', '2÷n', 'n×2', 'n-2'],
                explanation: '每个数除以2'
            }
        ];
        
        this.gameData.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // 安全检查UI元素是否存在
        if (this.ui && this.ui.patternText) {
            this.ui.patternText.setText(`观察模式: ${this.gameData.currentPattern.examples.join(', ')}`);
        } else {
            console.error('patternText UI元素未找到');
        }
        
        // 添加提示文本
        if (!this.ui.hintText) {
            this.ui.hintText = this.safeAddGameObject(
                this.add.text(width / 2, height / 2 - 40, '找出规律，选择正确的代数表达式', {
                    fontSize: '16px',
                    fill: '#cccccc',
                    fontFamily: 'Microsoft YaHei, SimSun, serif'
                }).setOrigin(0.5)
            );
        }
    }
    
    createPatternOptions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 清理之前的选项按钮
        if (this.gameData.optionButtons) {
            this.gameData.optionButtons.forEach(btn => {
                if (btn && btn.destroy) btn.destroy();
            });
        }
        this.gameData.optionButtons = [];
        
        this.gameData.currentPattern.options.forEach((option, index) => {
            const x = width / 2 + (index % 2 - 0.5) * 200;
            const y = height / 2 + Math.floor(index / 2) * 60;
            
            const optionBtn = this.safeAddGameObject(
                this.add.text(x, y, option, {
                    fontSize: '18px',
                    fill: '#ffffff',
                    backgroundColor: '#666666',
                    padding: { x: 15, y: 10 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            );
            
            optionBtn.on('pointerdown', () => {
                this.checkPatternAnswer(option);
            });
            
            this.gameData.optionButtons.push(optionBtn);
        });
    }
    
    checkPatternAnswer(answer) {
        if (answer === this.gameData.currentPattern.correct) {
            this.updateScore(100);
            
            // 显示解释
            const explanation = `正确！${this.gameData.currentPattern.explanation}`;
            this.showFeedback(explanation, '#50e3c2');
            
            // 增加正确答案计数
            this.gameData.correctAnswers = (this.gameData.correctAnswers || 0) + 1;
            
            // 生成新模式
            setTimeout(() => {
                if (this.gameData.correctAnswers >= 5) {
                    this.completeGame('恭喜！你掌握了变量抽象的精髓！');
                } else {
                    this.generatePattern();
                    this.createPatternOptions();
                }
            }, 2500);
        } else {
            this.showFeedback('再试试！观察数字之间的关系。', '#ff6b6b');
            
            // 添加提示
            setTimeout(() => {
                this.showFeedback(`提示：${this.gameData.currentPattern.explanation}`, '#f5a623');
            }, 1500);
        }
    }
    
    // ==================== 函数思维游戏 ====================
    startFunctionalThinkingGame() {
        if (!this.safeSetGameUI('⚙️ 函数机器游戏', '操作函数机器，理解输入输出的映射关系！')) {
            console.error('无法设置函数思维游戏UI');
            return;
        }
        
        // 清理之前的游戏特定UI
        this.clearGameSpecificUI();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 先设置游戏数据
        this.gameData.currentFunction = this.generateRandomFunction();
        this.gameData.correctAnswers = 0;
        this.gameData.totalQuestions = 0;
        
        // 然后创建函数机器（会调用nextFunctionQuestion）
        this.createFunctionMachine();
    }
    
    createFunctionMachine() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 函数机器外观
        const machine = this.safeAddGameObject(
            this.add.rectangle(width / 2, height / 2, 300, 200, 0x333333)
        );
        machine.setStrokeStyle(4, 0x4a90e2);
        
        // 输入口
        this.safeAddGameObject(
            this.add.text(width / 2 - 120, height / 2, '输入', {
                fontSize: '16px',
                fill: '#ffffff'
            }).setOrigin(0.5)
        );
        
        // 输出口
        this.safeAddGameObject(
            this.add.text(width / 2 + 120, height / 2, '输出', {
                fontSize: '16px',
                fill: '#ffffff'
            }).setOrigin(0.5)
        );
        
        // 函数显示
        this.ui.functionText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 30, '', {
                fontSize: '20px',
                fill: '#f5a623',
                fontWeight: 'bold'
            }).setOrigin(0.5)
        );
        
        // 输入值显示
        this.ui.inputText = this.safeAddGameObject(
            this.add.text(width / 2 - 120, height / 2 + 30, '', {
                fontSize: '18px',
                fill: '#50e3c2'
            }).setOrigin(0.5)
        );
        
        // 输出选择
        this.createOutputOptions();
        
        // 开始第一题
        this.nextFunctionQuestion();
    }
    
    generateRandomFunction() {
        const functions = [
            { name: 'f(x) = 2x', func: x => 2 * x },
            { name: 'f(x) = x + 3', func: x => x + 3 },
            { name: 'f(x) = x²', func: x => x * x },
            { name: 'f(x) = 3x - 1', func: x => 3 * x - 1 }
        ];
        
        return functions[Math.floor(Math.random() * functions.length)];
    }
    
    nextFunctionQuestion() {
        // 安全检查
        if (!this.gameData.currentFunction) {
            console.error('currentFunction未初始化');
            return;
        }
        
        if (!this.gameData.currentFunction.func) {
            console.error('currentFunction.func未定义');
            return;
        }
        
        if (!this.ui.functionText || !this.ui.inputText) {
            console.error('函数游戏UI元素未创建');
            return;
        }
        
        try {
            this.gameData.currentInput = Math.floor(Math.random() * 10) + 1;
            this.gameData.correctOutput = this.gameData.currentFunction.func(this.gameData.currentInput);
            
            this.ui.functionText.setText(this.gameData.currentFunction.name);
            this.ui.inputText.setText(`x = ${this.gameData.currentInput}`);
            
            // 生成选项
            this.generateOutputOptions();
        } catch (error) {
            console.error('生成函数问题时出错:', error);
        }
    }
    
    generateOutputOptions() {
        if (!this.gameData.correctOutput && this.gameData.correctOutput !== 0) {
            console.error('correctOutput未设置');
            return;
        }
        
        const correct = this.gameData.correctOutput;
        const options = [correct];
        
        // 生成错误选项
        while (options.length < 4) {
            const wrong = correct + Math.floor(Math.random() * 10) - 5;
            if (!options.includes(wrong) && wrong !== correct) {
                options.push(wrong);
            }
        }
        
        // 打乱选项
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        this.gameData.currentOptions = options;
        this.updateOutputButtons();
    }
    
    createOutputOptions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.gameData.outputButtons = [];
        
        for (let i = 0; i < 4; i++) {
            const x = width / 2 + 120;
            const y = height / 2 + 80 + i * 40;
            
            const btn = this.safeAddGameObject(
                this.add.text(x, y, '', {
                    fontSize: '16px',
                    fill: '#ffffff',
                    backgroundColor: '#666666',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            );
            
            btn.on('pointerdown', () => {
                this.checkFunctionAnswer(parseInt(btn.text));
            });
            
            this.gameData.outputButtons.push(btn);
        }
    }
    
    updateOutputButtons() {
        if (!this.gameData.outputButtons || !this.gameData.currentOptions) {
            console.error('输出按钮或选项未初始化');
            return;
        }
        
        if (this.gameData.outputButtons.length !== this.gameData.currentOptions.length) {
            console.error('按钮数量与选项数量不匹配');
            return;
        }
        
        try {
            this.gameData.outputButtons.forEach((btn, index) => {
                if (btn && typeof btn.setText === 'function') {
                    btn.setText(this.gameData.currentOptions[index].toString());
                }
            });
        } catch (error) {
            console.error('更新输出按钮时出错:', error);
        }
    }
    
    checkFunctionAnswer(answer) {
        this.gameData.totalQuestions++;
        
        if (answer === this.gameData.correctOutput) {
            this.gameData.correctAnswers++;
            this.updateScore(50);
            this.showFeedback('正确！', '#50e3c2');
        } else {
            this.showFeedback(`错误！正确答案是 ${this.gameData.correctOutput}`, '#ff6b6b');
        }
        
        // 下一题或结束
        if (this.gameData.totalQuestions >= 5) {
            const accuracy = (this.gameData.correctAnswers / this.gameData.totalQuestions * 100).toFixed(0);
            this.completeGame(`游戏完成！准确率: ${accuracy}%`);
        } else {
            setTimeout(() => {
                this.nextFunctionQuestion();
            }, 1500);
        }
    }
    
    // ==================== 方程求解游戏 ====================
    startEquationSolvingGame() {
        if (!this.safeSetGameUI('⚖️ 天平方程游戏', '保持天平平衡，求解方程中的未知数！')) {
            console.error('无法设置方程求解游戏UI');
            return;
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建天平
        this.createBalance();
        
        // 生成方程
        this.generateEquation();
    }
    
    createBalance() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 天平支点
        this.add.triangle(width / 2, height / 2 + 50, 0, -30, -20, 10, 20, 10, 0x666666);
        
        // 天平横梁
        this.add.rectangle(width / 2, height / 2, 300, 8, 0x888888);
        
        // 左盘
        this.ui.leftPan = this.add.rectangle(width / 2 - 120, height / 2 + 30, 100, 60, 0x4a90e2, 0.7);
        this.ui.leftPan.setStrokeStyle(2, 0x4a90e2);
        
        // 右盘
        this.ui.rightPan = this.add.rectangle(width / 2 + 120, height / 2 + 30, 100, 60, 0x4a90e2, 0.7);
        this.ui.rightPan.setStrokeStyle(2, 0x4a90e2);
        
        // 方程显示
        this.ui.equationText = this.add.text(width / 2, height / 2 - 100, '', {
            fontSize: '24px',
            fill: '#f5a623',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 左右盘内容
        this.ui.leftContent = this.add.text(width / 2 - 120, height / 2 + 30, '', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.ui.rightContent = this.add.text(width / 2 + 120, height / 2 + 30, '', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 操作按钮
        this.createEquationButtons();
    }
    
    generateEquation() {
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 10) + 1;
        const x = Math.floor(Math.random() * 8) + 1;
        const c = a * x + b;
        
        this.gameData.equation = {
            a: a,
            b: b,
            c: c,
            x: x,
            leftSide: `${a}x + ${b}`,
            rightSide: c.toString()
        };
        
        this.ui.equationText.setText(`${this.gameData.equation.leftSide} = ${this.gameData.equation.rightSide}`);
        this.ui.leftContent.setText(this.gameData.equation.leftSide);
        this.ui.rightContent.setText(this.gameData.equation.rightSide);
        
        this.gameData.currentLeft = this.gameData.equation.leftSide;
        this.gameData.currentRight = this.gameData.equation.rightSide;
    }
    
    createEquationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const operations = [
            { text: `减去 ${this.gameData.equation && this.gameData.equation.b ? this.gameData.equation.b : 5}`, action: 'subtract_b' },
            { text: `除以 ${this.gameData.equation && this.gameData.equation.a ? this.gameData.equation.a : 2}`, action: 'divide_a' },
            { text: '检查答案', action: 'check' }
        ];
        
        operations.forEach((op, index) => {
            const btn = this.add.text(width / 2, height / 2 + 120 + index * 40, op.text, {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                this.performOperation(op.action);
            });
        });
    }
    
    performOperation(action) {
        switch (action) {
            case 'subtract_b':
                this.gameData.currentLeft = `${this.gameData.equation.a}x`;
                this.gameData.currentRight = (this.gameData.equation.c - this.gameData.equation.b).toString();
                this.ui.leftContent.setText(this.gameData.currentLeft);
                this.ui.rightContent.setText(this.gameData.currentRight);
                this.updateScore(25);
                break;
                
            case 'divide_a':
                if (this.gameData.currentLeft === `${this.gameData.equation.a}x`) {
                    this.gameData.currentLeft = 'x';
                    this.gameData.currentRight = this.gameData.equation.x.toString();
                    this.ui.leftContent.setText(this.gameData.currentLeft);
                    this.ui.rightContent.setText(this.gameData.currentRight);
                    this.updateScore(25);
                }
                break;
                
            case 'check':
                if (this.gameData.currentLeft === 'x' && 
                    parseInt(this.gameData.currentRight) === this.gameData.equation.x) {
                    this.completeGame(`正确！x = ${this.gameData.equation.x}`);
                } else {
                    this.showFeedback('还没有完全求解，继续操作！', '#ff6b6b');
                }
                break;
        }
    }
    
    // ==================== 欧几里得公理游戏 ====================
    startEuclideanAxiomsGame() {
        if (!this.safeSetGameUI('📐 尺规作图游戏', '使用圆规和直尺完成几何构造！')) {
            console.error('无法设置欧几里得公理游戏UI');
            return;
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建画布
        this.gameData.canvas = this.add.graphics();
        this.gameData.points = [];
        this.gameData.lines = [];
        this.gameData.circles = [];
        
        // 工具选择
        this.createGeometryTools();
        
        // 当前任务
        this.gameData.currentTask = this.generateGeometryTask();
        this.ui.taskText = this.add.text(width / 2, 150, this.gameData.currentTask.description, {
            fontSize: '16px',
            fill: '#f5a623',
            wordWrap: { width: width - 100 }
        }).setOrigin(0.5);
    }
    
    createGeometryTools() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.gameData.selectedTool = 'point';
        
        const tools = [
            { name: 'point', text: '📍 点', color: '#50e3c2' },
            { name: 'line', text: '📏 直线', color: '#4a90e2' },
            { name: 'circle', text: '⭕ 圆', color: '#f5a623' }
        ];
        
        tools.forEach((tool, index) => {
            const btn = this.add.text(100 + index * 120, height - 50, tool.text, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: tool.name === this.gameData.selectedTool ? tool.color : '#666666',
                padding: { x: 10, y: 8 }
            }).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                this.gameData.selectedTool = tool.name;
                this.updateToolButtons();
            });
            
            this.gameData[`${tool.name}Button`] = btn;
        });
        
        // 画布交互
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > 200 && pointer.y < height - 100) {
                this.handleCanvasClick(pointer.x, pointer.y);
            }
        });
    }
    
    updateToolButtons() {
        const tools = ['point', 'line', 'circle'];
        const colors = { point: '#50e3c2', line: '#4a90e2', circle: '#f5a623' };
        
        tools.forEach(tool => {
            const btn = this.gameData[`${tool}Button`];
            btn.setBackgroundColor(tool === this.gameData.selectedTool ? colors[tool] : '#666666');
        });
    }
    
    generateGeometryTask() {
        const tasks = [
            {
                description: '在画布上放置两个点，然后连接它们',
                check: () => this.gameData.points.length >= 2 && this.gameData.lines.length >= 1
            },
            {
                description: '创建一个点，然后以该点为圆心画一个圆',
                check: () => this.gameData.points.length >= 1 && this.gameData.circles.length >= 1
            }
        ];
        
        return tasks[Math.floor(Math.random() * tasks.length)];
    }
    
    handleCanvasClick(x, y) {
        switch (this.gameData.selectedTool) {
            case 'point':
                this.addPoint(x, y);
                break;
            case 'line':
                this.addLine(x, y);
                break;
            case 'circle':
                this.addCircle(x, y);
                break;
        }
        
        // 检查任务完成
        if (this.gameData.currentTask.check()) {
            this.updateScore(100);
            this.completeGame('任务完成！你掌握了基本的几何构造！');
        }
    }
    
    addPoint(x, y) {
        this.gameData.points.push({ x, y });
        this.gameData.canvas.fillStyle(0x50e3c2);
        this.gameData.canvas.fillCircle(x, y, 4);
        this.updateScore(10);
    }
    
    addLine(x, y) {
        if (this.gameData.points.length >= 2) {
            const p1 = this.gameData.points[this.gameData.points.length - 2];
            const p2 = this.gameData.points[this.gameData.points.length - 1];
            
            this.gameData.canvas.lineStyle(2, 0x4a90e2);
            this.gameData.canvas.lineBetween(p1.x, p1.y, p2.x, p2.y);
            this.gameData.lines.push({ p1, p2 });
            this.updateScore(20);
        }
    }
    
    addCircle(x, y) {
        if (this.gameData.points.length >= 1) {
            const center = this.gameData.points[this.gameData.points.length - 1];
            const radius = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
            
            this.gameData.canvas.lineStyle(2, 0xf5a623);
            this.gameData.canvas.strokeCircle(center.x, center.y, radius);
            this.gameData.circles.push({ center, radius });
            this.updateScore(30);
        }
    }
    
    // ==================== 距离度量游戏 ====================
    startDistanceMetricsGame() {
        if (!this.safeSetGameUI('📏 距离测量游戏', '比较不同距离度量方式的结果！')) {
            console.error('无法设置距离度量游戏UI');
            return;
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 生成两个随机点
        this.generateRandomPoints();
        
        // 显示点
        this.drawPoints();
        
        // 距离计算挑战
        this.createDistanceChallenge();
    }
    
    generateRandomPoints() {
        this.gameData.pointA = {
            x: Math.floor(Math.random() * 5) + 1,
            y: Math.floor(Math.random() * 5) + 1
        };
        this.gameData.pointB = {
            x: Math.floor(Math.random() * 5) + 1,
            y: Math.floor(Math.random() * 5) + 1
        };
        
        // 确保两点不同
        while (this.gameData.pointA.x === this.gameData.pointB.x && 
               this.gameData.pointA.y === this.gameData.pointB.y) {
            this.gameData.pointB.x = Math.floor(Math.random() * 5) + 1;
            this.gameData.pointB.y = Math.floor(Math.random() * 5) + 1;
        }
    }
    
    drawPoints() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 网格
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333);
        
        const gridSize = 40;
        const startX = width / 2 - 120;
        const startY = height / 2 - 120;
        
        // 画网格
        for (let i = 0; i <= 6; i++) {
            graphics.lineBetween(startX, startY + i * gridSize, startX + 6 * gridSize, startY + i * gridSize);
            graphics.lineBetween(startX + i * gridSize, startY, startX + i * gridSize, startY + 6 * gridSize);
        }
        
        // 画点
        graphics.fillStyle(0xff6b6b);
        graphics.fillCircle(startX + this.gameData.pointA.x * gridSize, startY + this.gameData.pointA.y * gridSize, 8);
        
        graphics.fillStyle(0x50e3c2);
        graphics.fillCircle(startX + this.gameData.pointB.x * gridSize, startY + this.gameData.pointB.y * gridSize, 8);
        
        // 标签
        this.add.text(startX + this.gameData.pointA.x * gridSize, startY + this.gameData.pointA.y * gridSize - 20, 'A', {
            fontSize: '16px',
            fill: '#ff6b6b',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(startX + this.gameData.pointB.x * gridSize, startY + this.gameData.pointB.y * gridSize - 20, 'B', {
            fontSize: '16px',
            fill: '#50e3c2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 坐标显示
        this.add.text(width / 2, height / 2 + 150, 
            `A(${this.gameData.pointA.x}, ${this.gameData.pointA.y})  B(${this.gameData.pointB.x}, ${this.gameData.pointB.y})`, {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }
    
    createDistanceChallenge() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 计算真实距离
        const dx = this.gameData.pointB.x - this.gameData.pointA.x;
        const dy = this.gameData.pointB.y - this.gameData.pointA.y;
        
        this.gameData.euclidean = Math.sqrt(dx * dx + dy * dy);
        this.gameData.manhattan = Math.abs(dx) + Math.abs(dy);
        this.gameData.chebyshev = Math.max(Math.abs(dx), Math.abs(dy));
        
        // 距离类型选择
        const distanceTypes = [
            { name: '欧几里得距离', value: this.gameData.euclidean.toFixed(2) },
            { name: '曼哈顿距离', value: this.gameData.manhattan.toString() },
            { name: '切比雪夫距离', value: this.gameData.chebyshev.toString() }
        ];
        
        // 随机选择一个要回答的距离类型
        this.gameData.currentQuestion = distanceTypes[Math.floor(Math.random() * distanceTypes.length)];
        
        this.ui.questionText = this.add.text(width / 2, height / 2 + 200, 
            `${this.gameData.currentQuestion.name}是多少？`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
        
        // 生成选项
        this.createDistanceOptions();
    }
    
    createDistanceOptions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const correct = parseFloat(this.gameData.currentQuestion.value);
        const options = [correct];
        
        // 生成干扰项
        while (options.length < 4) {
            let wrong;
            if (this.gameData.currentQuestion.name === '欧几里得距离') {
                wrong = parseFloat((correct + (Math.random() - 0.5) * 2).toFixed(2));
            } else {
                wrong = Math.floor(correct + (Math.random() - 0.5) * 4);
            }
            
            if (!options.includes(wrong) && wrong > 0) {
                options.push(wrong);
            }
        }
        
        // 打乱选项
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // 创建选项按钮
        options.forEach((option, index) => {
            const x = width / 2 + (index % 2 - 0.5) * 200;
            const y = height / 2 + 250 + Math.floor(index / 2) * 40;
            
            const btn = this.add.text(x, y, option.toString(), {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                this.checkDistanceAnswer(option);
            });
        });
    }
    
    checkDistanceAnswer(answer) {
        const correct = parseFloat(this.gameData.currentQuestion.value);
        
        if (Math.abs(answer - correct) < 0.01) {
            this.updateScore(100);
            this.completeGame('正确！你理解了不同的距离度量方式！');
        } else {
            this.showFeedback(`错误！正确答案是 ${correct}`, '#ff6b6b');
        }
    }
    
    // ==================== 三角函数圆游戏 ====================
    startTrigonometricCircleGame() {
        if (!this.safeSetGameUI('🔄 单位圆探索游戏', '拖动点在单位圆上移动，观察三角函数值的变化！')) {
            console.error('无法设置三角函数圆游戏UI');
            return;
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建单位圆
        this.createUnitCircle();
        
        // 游戏数据
        this.gameData.angle = 0;
        this.gameData.targetAngle = Math.floor(Math.random() * 12) * 30; // 0, 30, 60, 90, ...
        
        // 目标显示
        this.ui.targetText = this.add.text(width / 2, height / 2 + 150, 
            `目标角度: ${this.gameData.targetAngle}°`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
    }
    
    createUnitCircle() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 100;
        
        // 画圆
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0x4a90e2);
        graphics.strokeCircle(centerX, centerY, radius);
        
        // 坐标轴
        graphics.lineStyle(2, 0x666666);
        graphics.lineBetween(centerX - radius - 20, centerY, centerX + radius + 20, centerY);
        graphics.lineBetween(centerX, centerY - radius - 20, centerX, centerY + radius + 20);
        
        // 可拖动的点
        this.gameData.movablePoint = this.add.circle(centerX + radius, centerY, 8, 0xff6b6b);
        this.gameData.movablePoint.setInteractive({ draggable: true });
        
        // 角度线
        this.gameData.angleLine = this.add.graphics();
        
        // 三角函数值显示
        this.ui.sinText = this.add.text(centerX + 150, centerY - 50, 'sin θ = 0.00', {
            fontSize: '16px',
            fill: '#50e3c2'
        });
        
        this.ui.cosText = this.add.text(centerX + 150, centerY - 20, 'cos θ = 1.00', {
            fontSize: '16px',
            fill: '#f5a623'
        });
        
        this.ui.angleText = this.add.text(centerX + 150, centerY + 10, 'θ = 0°', {
            fontSize: '16px',
            fill: '#ffffff'
        });
        
        // 拖动事件
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.gameData.movablePoint) {
                this.updatePointPosition(dragX, dragY, centerX, centerY, radius);
            }
        });
    }
    
    updatePointPosition(dragX, dragY, centerX, centerY, radius) {
        // 计算角度
        const dx = dragX - centerX;
        const dy = dragY - centerY;
        const angle = Math.atan2(dy, dx);
        
        // 限制在圆上
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        this.gameData.movablePoint.setPosition(x, y);
        
        // 更新角度（转换为度）
        this.gameData.angle = ((angle * 180 / Math.PI) + 360) % 360;
        
        // 更新显示
        this.updateTrigValues();
        
        // 画角度线
        this.gameData.angleLine.clear();
        this.gameData.angleLine.lineStyle(2, 0xff6b6b);
        this.gameData.angleLine.lineBetween(centerX, centerY, x, y);
        
        // 检查是否接近目标角度
        const angleDiff = Math.abs(this.gameData.angle - this.gameData.targetAngle);
        if (angleDiff < 5 || angleDiff > 355) {
            this.updateScore(100);
            this.completeGame(`太棒了！你找到了 ${this.gameData.targetAngle}° 角度！`);
        }
    }
    
    updateTrigValues() {
        const radians = this.gameData.angle * Math.PI / 180;
        const sin = Math.sin(radians);
        const cos = Math.cos(radians);
        
        this.ui.sinText.setText(`sin θ = ${sin.toFixed(2)}`);
        this.ui.cosText.setText(`cos θ = ${cos.toFixed(2)}`);
        this.ui.angleText.setText(`θ = ${this.gameData.angle.toFixed(0)}°`);
    }
    
    // ==================== 简化版其他概念游戏 ====================
    
    startEpsilonDeltaGame() {
        if (!this.safeSetGameUI('🎯 ε-δ 挑战游戏', '理解极限的精确定义：对于任意 ε > 0，找到合适的 δ > 0')) {
            console.error('无法设置ε-δ游戏UI');
            return;
        }
        
        // 清理之前的游戏特定UI
        this.clearGameSpecificUI();
        
        this.createAdvancedEpsilonDeltaGame();
    }
    
    createAdvancedEpsilonDeltaGame() {
        // 安全检查相机是否存在
        if (!this.cameras || !this.cameras.main) {
            console.error('相机未初始化，延迟执行');
            this.time.delayedCall(100, function() {
                this.createAdvancedEpsilonDeltaGame();
            }, [], this);
            return;
        }
        
        const { width, height } = this.getSafeCameraDimensions();
        
        // 初始化游戏数据
        this.gameData.currentLevel = this.gameData.currentLevel || 1;
        this.gameData.correctAnswers = this.gameData.correctAnswers || 0;
        
        // 根据级别生成不同难度的问题
        const problems = [
            {
                function: 'f(x) = 2x + 1',
                limit: 'lim(x→1) f(x) = 3',
                epsilon: 0.5,
                correctDelta: 0.25,
                explanation: '对于线性函数，δ = ε/2'
            },
            {
                function: 'f(x) = x²',
                limit: 'lim(x→2) f(x) = 4',
                epsilon: 0.4,
                correctDelta: 0.1,
                explanation: '对于二次函数，需要更小的δ'
            },
            {
                function: 'f(x) = 3x - 2',
                limit: 'lim(x→2) f(x) = 4',
                epsilon: 0.3,
                correctDelta: 0.1,
                explanation: '斜率为3，所以δ = ε/3'
            }
        ];
        
        const currentProblem = problems[(this.gameData.currentLevel - 1) % problems.length];
        this.gameData.currentProblem = currentProblem;
        
        // 显示函数和极限
        this.ui.functionText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 100, currentProblem.function, {
                fontSize: '24px',
                fill: '#4a90e2',
                fontWeight: 'bold'
            }).setOrigin(0.5)
        );
        
        this.ui.limitText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 60, currentProblem.limit, {
                fontSize: '20px',
                fill: '#f5a623'
            }).setOrigin(0.5)
        );
        
        // 显示ε值
        this.ui.epsilonText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 20, `给定 ε = ${currentProblem.epsilon}`, {
                fontSize: '18px',
                fill: '#50e3c2'
            }).setOrigin(0.5)
        );
        
        // 问题提示
        this.ui.questionText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 + 20, '找到合适的 δ 值，使得 |f(x) - L| < ε 当 |x - a| < δ', {
                fontSize: '16px',
                fill: '#cccccc',
                wordWrap: { width: width - 100 },
                align: 'center'
            }).setOrigin(0.5)
        );
        
        // 创建δ选择器
        this.createDeltaSelector(currentProblem);
        
        // 添加可视化图表
        this.createEpsilonDeltaVisualization(currentProblem);
    }
    
    createDeltaSelector(problem) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 生成选项（包括正确答案和干扰项）
        const correctDelta = problem.correctDelta;
        const options = [
            correctDelta,
            correctDelta * 2,
            correctDelta * 0.5,
            correctDelta * 4,
            problem.epsilon, // 常见错误：直接用ε
            problem.epsilon * 0.5
        ].sort(() => Math.random() - 0.5).slice(0, 4);
        
        // 确保正确答案在选项中
        if (!options.includes(correctDelta)) {
            options[0] = correctDelta;
        }
        
        options.forEach((option, index) => {
            const x = width / 2 + (index % 2 - 0.5) * 200;
            const y = height / 2 + 80 + Math.floor(index / 2) * 50;
            
            const btn = this.safeAddGameObject(
                this.add.text(x, y, `δ = ${option.toFixed(3)}`, {
                    fontSize: '16px',
                    fill: '#ffffff',
                    backgroundColor: '#666666',
                    padding: { x: 15, y: 8 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            );
            
            btn.on('pointerdown', () => {
                this.checkDeltaAnswer(option, problem);
            });
        });
    }
    
    createEpsilonDeltaVisualization(problem) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建简单的函数图像
        const graphics = this.safeAddGameObject(this.add.graphics());
        graphics.lineStyle(2, 0x4a90e2);
        
        // 绘制坐标轴
        const centerX = width - 150;
        const centerY = height - 150;
        const scale = 30;
        
        // X轴
        graphics.lineBetween(centerX - 60, centerY, centerX + 60, centerY);
        // Y轴
        graphics.lineBetween(centerX, centerY - 60, centerX, centerY + 60);
        
        // 绘制函数的一小段（示意）
        graphics.lineStyle(3, 0xf5a623);
        for (let i = -2; i <= 2; i += 0.1) {
            let y;
            if (problem.function.includes('x²')) {
                y = i * i;
            } else if (problem.function.includes('2x + 1')) {
                y = 2 * i + 1;
            } else {
                y = 3 * i - 2;
            }
            
            const screenX = centerX + i * scale;
            const screenY = centerY - y * scale / 4;
            
            if (i === -2) {
                graphics.moveTo(screenX, screenY);
            } else {
                graphics.lineTo(screenX, screenY);
            }
        }
        
        // 添加标签
        this.safeAddGameObject(
            this.add.text(centerX, centerY + 80, '函数图像示意', {
                fontSize: '12px',
                fill: '#888888'
            }).setOrigin(0.5)
        );
    }
    
    checkDeltaAnswer(selectedDelta, problem) {
        const isCorrect = Math.abs(selectedDelta - problem.correctDelta) < 0.01;
        
        if (isCorrect) {
            this.updateScore(150);
            this.gameData.correctAnswers++;
            
            const feedback = `正确！${problem.explanation}`;
            this.showFeedback(feedback, '#50e3c2');
            
            setTimeout(() => {
                if (this.gameData.correctAnswers >= 3) {
                    this.completeGame('恭喜！你掌握了 ε-δ 定义的精髓！');
                } else {
                    this.gameData.currentLevel++;
                    this.clearGameSpecificUI();
                    this.createAdvancedEpsilonDeltaGame();
                }
            }, 3000);
        } else {
            let hint = '再试试！';
            if (selectedDelta >= problem.epsilon) {
                hint = 'δ 通常需要比 ε 更小！';
            } else if (selectedDelta > problem.correctDelta * 2) {
                hint = 'δ 值太大了，试试更小的值。';
            } else {
                hint = '接近了！再仔细考虑函数的性质。';
            }
            
            this.showFeedback(hint, '#ff6b6b');
        }
    }
    
    // 为其他概念创建简化游戏
    startZenoParadoxesGame() {
        this.ui.gameTitle.setText('🏃 阿喀琉斯追龟游戏');
        this.ui.gameInstructions.setText('观察无穷级数如何收敛到有限值！');
        this.createZenoAnimation();
    }
    
    createZenoAnimation() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建阿喀琉斯和乌龟
        this.gameData.achilles = this.add.circle(100, height / 2, 10, 0x4a90e2);
        this.gameData.turtle = this.add.circle(200, height / 2, 8, 0x50e3c2);
        
        this.gameData.step = 0;
        this.gameData.positions = [100];
        
        // 开始动画按钮
        const startBtn = this.add.text(width / 2, height / 2 + 100, '开始追赶', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#50e3c2',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        startBtn.on('pointerdown', () => {
            this.animateZenoParadox();
        });
    }
    
    animateZenoParadox() {
        if (this.gameData.step < 10) {
            const distance = 100 / Math.pow(2, this.gameData.step);
            const newPos = this.gameData.positions[this.gameData.step] + distance;
            this.gameData.positions.push(newPos);
            
            this.tweens.add({
                targets: this.gameData.achilles,
                x: newPos,
                duration: 1000,
                onComplete: () => {
                    this.gameData.step++;
                    this.updateScore(20);
                    
                    if (this.gameData.step < 10) {
                        setTimeout(() => this.animateZenoParadox(), 500);
                    } else {
                        this.completeGame('阿喀琉斯追上了乌龟！无穷级数收敛了！');
                    }
                }
            });
        }
    }
    
    // 其他概念的简化实现
    startContinuityConceptGame() {
        this.ui.gameTitle.setText('📈 连续性判断游戏');
        this.ui.gameInstructions.setText('判断函数在给定点是否连续！');
        this.createContinuityGame();
    }
    
    startDerivativeDefinitionGame() {
        this.ui.gameTitle.setText('📊 导数计算游戏');
        this.ui.gameInstructions.setText('计算简单函数的导数！');
        this.createDerivativeGame();
    }
    
    startStaircaseParadoxGame() {
        this.ui.gameTitle.setText('🪜 阶梯悖论演示');
        this.ui.gameInstructions.setText('观察阶梯如何逼近对角线！');
        this.createStaircaseAnimation();
    }
    
    startSchwarzLanternGame() {
        this.ui.gameTitle.setText('🏮 施瓦茨灯笼游戏');
        this.ui.gameInstructions.setText('调整参数观察面积变化！');
        this.createLanternGame();
    }
    
    startRealAnalysisGame() {
        this.ui.gameTitle.setText('📐 实分析挑战');
        this.ui.gameInstructions.setText('判断数列的收敛性！');
        this.createAnalysisGame();
    }
    
    startMeasureTheoryGame() {
        this.ui.gameTitle.setText('📏 测度计算游戏');
        this.ui.gameInstructions.setText('计算集合的测度！');
        this.createMeasureGame();
    }
    
    // ==================== 简化实现的其他游戏 ====================
    
    createContinuityGame() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const functions = [
            { name: 'f(x) = x²', continuous: true },
            { name: 'f(x) = 1/x (在 x=0)', continuous: false },
            { name: 'f(x) = sin(x)', continuous: true }
        ];
        
        const func = functions[Math.floor(Math.random() * functions.length)];
        
        this.add.text(width / 2, height / 2 - 50, `函数 ${func.name} 在给定点连续吗？`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
        
        ['是', '否'].forEach((answer, index) => {
            const btn = this.add.text(width / 2 + (index - 0.5) * 100, height / 2 + 50, answer, {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                const correct = (answer === '是') === func.continuous;
                if (correct) {
                    this.updateScore(100);
                    this.completeGame('正确！你理解了连续性概念！');
                } else {
                    this.showFeedback('再想想连续性的定义！', '#ff6b6b');
                }
            });
        });
    }
    
    createDerivativeGame() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const problems = [
            { func: 'f(x) = x²', derivative: '2x' },
            { func: 'f(x) = 3x', derivative: '3' },
            { func: 'f(x) = x³', derivative: '3x²' }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        
        this.add.text(width / 2, height / 2 - 50, `${problem.func} 的导数是？`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
        
        const options = [problem.derivative, 'x', '1', '0'];
        
        options.forEach((option, index) => {
            const btn = this.add.text(width / 2, height / 2 + index * 40, option, {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                if (option === problem.derivative) {
                    this.updateScore(100);
                    this.completeGame('正确！你掌握了导数计算！');
                } else {
                    this.showFeedback('再试试！回想导数的定义。', '#ff6b6b');
                }
            });
        });
    }
    
    createStaircaseAnimation() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建阶梯动画
        this.gameData.graphics = this.add.graphics();
        this.gameData.steps = 4;
        
        const startBtn = this.add.text(width / 2, height / 2 + 100, '开始演示', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#4a90e2',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        startBtn.on('pointerdown', () => {
            this.animateStaircase();
        });
    }
    
    animateStaircase() {
        this.gameData.graphics.clear();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const size = 200;
        const startX = width / 2 - size / 2;
        const startY = height / 2 - size / 2;
        
        // 画对角线
        this.gameData.graphics.lineStyle(3, 0x50e3c2);
        this.gameData.graphics.lineBetween(startX, startY + size, startX + size, startY);
        
        // 画阶梯
        this.gameData.graphics.lineStyle(2, 0xff6b6b);
        const stepSize = size / this.gameData.steps;
        
        for (let i = 0; i < this.gameData.steps; i++) {
            const x = startX + i * stepSize;
            const y = startY + size - i * stepSize;
            
            // 水平线
            this.gameData.graphics.lineBetween(x, y, x + stepSize, y);
            // 垂直线
            this.gameData.graphics.lineBetween(x + stepSize, y, x + stepSize, y - stepSize);
        }
        
        this.gameData.steps *= 2;
        this.updateScore(25);
        
        if (this.gameData.steps <= 32) {
            setTimeout(() => this.animateStaircase(), 2000);
        } else {
            this.completeGame('阶梯越来越细，但长度始终是2！');
        }
    }
    
    createLanternGame() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.gameData.M = 4;
        this.gameData.N = 2;
        
        this.ui.parameterText = this.add.text(width / 2, height / 2 - 50, 
            `M = ${this.gameData.M}, N = ${this.gameData.N}`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
        
        const area = 2 * Math.PI * Math.sqrt(1 + (this.gameData.M / (this.gameData.N * this.gameData.N)) ** 2);
        this.ui.areaText = this.add.text(width / 2, height / 2, 
            `估计面积: ${area.toFixed(2)}`, {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const increaseBtn = this.add.text(width / 2, height / 2 + 50, '增加 M', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        increaseBtn.on('pointerdown', () => {
            this.gameData.M += 2;
            this.updateLanternDisplay();
            this.updateScore(20);
            
            if (this.gameData.M > 20) {
                this.completeGame('面积趋向无穷大！这就是施瓦茨灯笼悖论！');
            }
        });
    }
    
    updateLanternDisplay() {
        const area = 2 * Math.PI * Math.sqrt(1 + (this.gameData.M / (this.gameData.N * this.gameData.N)) ** 2);
        this.ui.parameterText.setText(`M = ${this.gameData.M}, N = ${this.gameData.N}`);
        this.ui.areaText.setText(`估计面积: ${area.toFixed(2)}`);
    }
    
    createAnalysisGame() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const sequences = [
            { name: '1/n', convergent: true },
            { name: 'n', convergent: false },
            { name: '(-1)^n/n', convergent: true }
        ];
        
        const seq = sequences[Math.floor(Math.random() * sequences.length)];
        
        this.add.text(width / 2, height / 2 - 50, `数列 a_n = ${seq.name} 收敛吗？`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
        
        ['收敛', '发散'].forEach((answer, index) => {
            const btn = this.add.text(width / 2 + (index - 0.5) * 100, height / 2 + 50, answer, {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                const correct = (answer === '收敛') === seq.convergent;
                if (correct) {
                    this.updateScore(100);
                    this.completeGame('正确！你掌握了收敛性判断！');
                } else {
                    this.showFeedback('再想想数列的极限行为！', '#ff6b6b');
                }
            });
        });
    }
    
    createMeasureGame() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const sets = [
            { name: '区间 [0, 1]', measure: 1 },
            { name: '区间 [0, 2]', measure: 2 },
            { name: '单点集 {0}', measure: 0 }
        ];
        
        const set = sets[Math.floor(Math.random() * sets.length)];
        
        this.add.text(width / 2, height / 2 - 50, `${set.name} 的 Lebesgue 测度是？`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
        
        const options = [set.measure, set.measure + 1, set.measure * 2, '∞'];
        
        options.forEach((option, index) => {
            const btn = this.add.text(width / 2, height / 2 + index * 40, option.toString(), {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                if (option === set.measure) {
                    this.updateScore(100);
                    this.completeGame('正确！你理解了测度的概念！');
                } else {
                    this.showFeedback('再想想测度的定义！', '#ff6b6b');
                }
            });
        });
    }
    
    // ==================== 通用辅助方法 ====================
    
    updateScore(points) {
        this.gameData.score += points;
        if (this.ui && this.ui.scoreText) {
            this.ui.scoreText.setText(`分数: ${this.gameData.score}`);
        }
        
        // 分数动画
        this.tweens.add({
            targets: this.ui.scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    showFeedback(message, color = '#ffffff') {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const feedback = this.safeAddGameObject(
            this.add.text(width / 2, height - 100, message, {
                fontSize: '16px',
                fill: color,
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5)
        );
        
        // 淡出动画
        this.tweens.add({
            targets: feedback,
            alpha: 0,
            y: height - 150,
            duration: 2000,
            onComplete: () => {
                if (feedback && feedback.destroy) {
                    feedback.destroy();
                }
            }
        });
    }
    
    completeGame(message) {
        // 计算概念进度增益
        const progressGain = Math.min(50, Math.floor(this.gameData.score / 10));
        
        // 更新玩家进度
        if (this.player && this.conceptId) {
            const currentProgress = this.player.getConceptProgress(this.conceptId);
            this.player.updateConceptProgress(this.conceptId, currentProgress + progressGain);
        }
        
        // 显示完成消息
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const completionPanel = this.add.container(width / 2, height / 2);
        
        const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.9);
        bg.setStrokeStyle(3, 0x50e3c2);
        
        const title = this.add.text(0, -60, '🎉 游戏完成！', {
            fontSize: '24px',
            fill: '#50e3c2',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const messageText = this.add.text(0, -20, message, {
            fontSize: '16px',
            fill: '#ffffff',
            wordWrap: { width: 350 }
        }).setOrigin(0.5);
        
        const scoreText = this.add.text(0, 20, `最终分数: ${this.gameData.score}`, {
            fontSize: '18px',
            fill: '#f5a623'
        }).setOrigin(0.5);
        
        const progressText = this.add.text(0, 50, `概念进度 +${progressGain}%`, {
            fontSize: '16px',
            fill: '#4a90e2'
        }).setOrigin(0.5);
        
        const continueBtn = this.add.text(0, 80, '继续', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#50e3c2',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        continueBtn.on('pointerdown', () => {
            this.scene.start(this.returnScene, {
                conceptId: this.conceptId,
                player: this.player
            });
        });
        
        completionPanel.add([bg, title, messageText, scoreText, progressText, continueBtn]);
    }
    
    showError(message) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.text(width / 2, height / 2, message, {
            fontSize: '20px',
            fill: '#ff6b6b',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5);
        
        // 返回按钮
        const backBtn = this.add.text(width / 2, height / 2 + 100, '返回', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerdown', () => {
            this.scene.start(this.returnScene);
        });
    }
    
    // ==================== 数学归纳法游戏 ====================
    startMathematicalInductionGame() {
        if (!this.safeSetGameUI('🔗 数学归纳法游戏', '证明对所有自然数n成立的命题，体验数学归纳法的威力！')) {
            console.error('无法设置数学归纳法游戏UI');
            return;
        }
        
        // 清理之前的游戏特定UI
        this.clearGameSpecificUI();
        
        this.createMathematicalInductionGame();
    }
    
    createMathematicalInductionGame() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 初始化游戏数据
        this.gameData.currentStep = 'base'; // base, inductive, complete
        this.gameData.currentProblem = this.generateInductionProblem();
        this.gameData.correctSteps = 0;
        
        // 显示问题
        this.ui.problemText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 120, this.gameData.currentProblem.statement, {
                fontSize: '18px',
                fill: '#4a90e2',
                fontWeight: 'bold',
                wordWrap: { width: width - 100 },
                align: 'center'
            }).setOrigin(0.5)
        );
        
        // 显示当前步骤
        this.updateInductionStep();
    }
    
    generateInductionProblem() {
        const problems = [
            {
                statement: '证明：1 + 2 + 3 + ... + n = n(n+1)/2',
                baseCase: {
                    question: '基础步骤：当 n = 1 时，等式成立吗？',
                    options: ['成立：1 = 1(1+1)/2 = 1', '不成立：左边是1，右边是2', '无法判断', '需要更多信息'],
                    correct: 0,
                    explanation: '当n=1时，左边=1，右边=1×2/2=1，等式成立'
                },
                inductiveStep: {
                    question: '归纳步骤：假设n=k时成立，证明n=k+1时也成立',
                    options: [
                        '1+2+...+k+(k+1) = k(k+1)/2 + (k+1) = (k+1)(k+2)/2',
                        '直接计算 (k+1)(k+2)/2',
                        '用数学公式验证',
                        '无需证明，显然成立'
                    ],
                    correct: 0,
                    explanation: '利用归纳假设，加上(k+1)项，化简得到n=k+1的公式'
                }
            },
            {
                statement: '证明：2^n > n 对所有 n ≥ 1 成立',
                baseCase: {
                    question: '基础步骤：当 n = 1 时，不等式成立吗？',
                    options: ['成立：2^1 = 2 > 1', '不成立：2^1 = 1', '成立：2^1 = 1 = 1', '无法确定'],
                    correct: 0,
                    explanation: '当n=1时，2^1=2>1，不等式成立'
                },
                inductiveStep: {
                    question: '归纳步骤：假设2^k > k，如何证明2^(k+1) > k+1？',
                    options: [
                        '2^(k+1) = 2×2^k > 2k ≥ k+1 (当k≥1)',
                        '直接计算2^(k+1)的值',
                        '用计算器验证',
                        '显然成立，无需证明'
                    ],
                    correct: 0,
                    explanation: '利用归纳假设和2k≥k+1的事实完成证明'
                }
            },
            {
                statement: '证明：n! > 2^n 对所有 n ≥ 4 成立',
                baseCase: {
                    question: '基础步骤：当 n = 4 时，不等式成立吗？',
                    options: ['成立：4! = 24 > 16 = 2^4', '不成立：4! = 16 = 2^4', '成立：4! = 16 > 8', '无法判断'],
                    correct: 0,
                    explanation: '当n=4时，4!=24>16=2^4，不等式成立'
                },
                inductiveStep: {
                    question: '归纳步骤：假设k! > 2^k，如何证明(k+1)! > 2^(k+1)？',
                    options: [
                        '(k+1)! = (k+1)×k! > (k+1)×2^k > 2×2^k = 2^(k+1)',
                        '直接计算(k+1)!',
                        '用归纳假设但不需要额外条件',
                        '显然成立'
                    ],
                    correct: 0,
                    explanation: '利用k+1>2（当k≥4时）和归纳假设完成证明'
                }
            }
        ];
        
        return problems[Math.floor(Math.random() * problems.length)];
    }
    
    updateInductionStep() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 清理之前的步骤UI
        if (this.ui.stepTitle) this.ui.stepTitle.destroy();
        if (this.ui.stepQuestion) this.ui.stepQuestion.destroy();
        if (this.ui.stepButtons) {
            this.ui.stepButtons.forEach(btn => btn.destroy());
        }
        
        let stepData, stepTitle, stepColor;
        
        if (this.gameData.currentStep === 'base') {
            stepData = this.gameData.currentProblem.baseCase;
            stepTitle = '第一步：基础步骤 (Base Case)';
            stepColor = '#50e3c2';
        } else if (this.gameData.currentStep === 'inductive') {
            stepData = this.gameData.currentProblem.inductiveStep;
            stepTitle = '第二步：归纳步骤 (Inductive Step)';
            stepColor = '#f5a623';
        }
        
        // 显示步骤标题
        this.ui.stepTitle = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 60, stepTitle, {
                fontSize: '20px',
                fill: stepColor,
                fontWeight: 'bold'
            }).setOrigin(0.5)
        );
        
        // 显示问题
        this.ui.stepQuestion = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 20, stepData.question, {
                fontSize: '16px',
                fill: '#ffffff',
                wordWrap: { width: width - 100 },
                align: 'center'
            }).setOrigin(0.5)
        );
        
        // 创建选项按钮
        this.ui.stepButtons = [];
        stepData.options.forEach((option, index) => {
            const x = width / 2;
            const y = height / 2 + 40 + index * 45;
            
            const btn = this.safeAddGameObject(
                this.add.text(x, y, option, {
                    fontSize: '14px',
                    fill: '#ffffff',
                    backgroundColor: '#666666',
                    padding: { x: 15, y: 8 },
                    wordWrap: { width: width - 200 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            );
            
            btn.on('pointerdown', () => {
                this.checkInductionAnswer(index, stepData);
            });
            
            this.ui.stepButtons.push(btn);
        });
    }
    
    checkInductionAnswer(selectedIndex, stepData) {
        const isCorrect = selectedIndex === stepData.correct;
        
        if (isCorrect) {
            this.updateScore(100);
            this.gameData.correctSteps++;
            
            this.showFeedback(`正确！${stepData.explanation}`, '#50e3c2');
            
            setTimeout(() => {
                if (this.gameData.currentStep === 'base') {
                    this.gameData.currentStep = 'inductive';
                    this.updateInductionStep();
                } else if (this.gameData.currentStep === 'inductive') {
                    this.completeInductionProof();
                }
            }, 3000);
        } else {
            this.showFeedback('再想想数学归纳法的逻辑！', '#ff6b6b');
            
            // 提供提示
            setTimeout(() => {
                let hint = '';
                if (this.gameData.currentStep === 'base') {
                    hint = '提示：基础步骤需要验证最小值时命题是否成立';
                } else {
                    hint = '提示：归纳步骤需要利用归纳假设证明下一个情况';
                }
                this.showFeedback(hint, '#f5a623');
            }, 1500);
        }
    }
    
    completeInductionProof() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 清理步骤UI
        if (this.ui.stepTitle) this.ui.stepTitle.destroy();
        if (this.ui.stepQuestion) this.ui.stepQuestion.destroy();
        if (this.ui.stepButtons) {
            this.ui.stepButtons.forEach(btn => btn.destroy());
        }
        
        // 显示完成信息
        const completionText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 - 40, '🎉 证明完成！', {
                fontSize: '28px',
                fill: '#50e3c2',
                fontWeight: 'bold'
            }).setOrigin(0.5)
        );
        
        const explanationText = this.safeAddGameObject(
            this.add.text(width / 2, height / 2, 
                '你成功运用了数学归纳法的两个关键步骤：\n' +
                '1. 基础步骤：验证最小情况\n' +
                '2. 归纳步骤：从k推导到k+1\n' +
                '这样就证明了命题对所有自然数都成立！', {
                fontSize: '16px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: width - 100 }
            }).setOrigin(0.5)
        );
        
        // 继续按钮
        const continueBtn = this.safeAddGameObject(
            this.add.text(width / 2, height / 2 + 100, '继续下一题', {
                fontSize: '18px',
                fill: '#ffffff',
                backgroundColor: '#4a90e2',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        );
        
        continueBtn.on('pointerdown', () => {
            if (this.gameData.correctSteps >= 4) { // 完成2道题
                this.completeGame('恭喜！你掌握了数学归纳法的精髓！');
            } else {
                // 重新开始新题目
                this.gameData.currentStep = 'base';
                this.gameData.currentProblem = this.generateInductionProblem();
                this.clearGameSpecificUI();
                this.createMathematicalInductionGame();
            }
        });
    }
    
    // ==================== 通用辅助方法 ====================
    
    clearGameObjects() {
        // 清理游戏对象
        this.gameObjects.forEach(obj => {
            if (obj && obj.destroy) {
                obj.destroy();
            }
        });
        this.gameObjects = [];
    }
}