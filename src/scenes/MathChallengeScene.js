// Phaser 从全局对象获取
import { ProblemBank } from '../core/MathProblem.js';
import { ButtonFactory } from '../core/ButtonFactory.js';
import { DropSystem } from '../core/DropSystem.js';

const { Scene } = Phaser;

export class MathChallengeScene extends Scene {
    constructor() {
        super({ key: 'MathChallengeScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        const player = window.gameData.player;
        // 获取数学之灵，如果没有则使用默认值
        const spirit = window.gameData.currentSpirit || { 
            name: '数学之灵', 
            difficulty: 1 
        };
        
        // 初始化掉落系统
        if (!window.gameData.dropSystem) {
            window.gameData.dropSystem = new DropSystem();
        }
        
        console.log('MathChallengeScene create - 玩家:', player);
        console.log('MathChallengeScene create - 数学之灵:', spirit);
        
        // 创建背景（使用背景图片 + 半透明遮罩）
        if (this.textures.exists('game_background')) {
            const bg = this.add.image(width / 2, height / 2, 'game_background');
            bg.setScale(Math.max(width / bg.width, height / bg.height));
            bg.setDepth(0);
            bg.setAlpha(0.3); // 背景图片半透明
            
            // 添加深色遮罩以提高文字对比度
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.85);
            overlay.setDepth(1);
            console.log('背景图片已创建');
        } else {
            // 如果图片未加载，使用纯色背景
            const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
            bg.setDepth(0);
            console.log('默认背景已创建');
        }
        
        // 创建题目（传递数学之灵名称以生成对应类型的题目）
        const problemBank = new ProblemBank();
        this.currentProblem = problemBank.getProblem(
            player.currentZone,
            spirit.difficulty,
            spirit.name  // 传递数学之灵名称
        );
        console.log('题目已生成:', this.currentProblem.problem);
        console.log('数学之灵名称:', spirit.name);
        console.log('题目类型:', this.currentProblem.operation || '随机');
        
        // 标题（使用亮色，增强对比度，位置靠上）
        const titleText = this.add.text(width / 2, 100, spirit.name || '数学挑战', {
            fontSize: '36px',
            fill: '#FFD93D',  // 亮黄色
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#2d2d44',  // 深灰蓝色背景
            padding: { x: 20, y: 15 },
            stroke: '#FFFFFF',  // 白色描边
            strokeThickness: 2
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(10);
        console.log('标题文本已创建:', titleText);
        
        // 题目显示（使用亮色文字和深色背景，调整位置避免重叠）
        this.problemText = this.add.text(width / 2, 200, this.currentProblem.problem || '题目加载中...', {
            fontSize: '28px',  // 稍微减小字体
            fill: '#FFFFFF',  // 纯白色
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#2d2d44',  // 深灰蓝色背景
            padding: { x: 30, y: 20 },
            align: 'center',
            wordWrap: { width: 900 },  // 增加宽度
            stroke: '#667eea',  // 紫色描边
            strokeThickness: 3
        });
        this.problemText.setOrigin(0.5);
        this.problemText.setDepth(10);
        console.log('题目文本已创建:', this.problemText);
        console.log('题目文本内容:', this.problemText.text);
        console.log('题目文本位置:', this.problemText.x, this.problemText.y);
        console.log('题目文本可见性:', this.problemText.visible, this.problemText.alpha);
        
        // 选项按钮（调整位置，确保不重叠）
        this.optionButtons = [];
        const optionY = 450;  // 从450开始，给题目留出足够空间
        const spacing = 80;  // 减小间距，但确保不重叠
        
        this.currentProblem.options.forEach((option, index) => {
            const buttonText = `${String.fromCharCode(65 + index)}. ${option}`;
            console.log(`创建选项按钮 ${index}:`, buttonText);
            
            // 计算每个按钮的Y位置，确保不重叠
            // 第一个按钮在 optionY，后续按钮依次向下
            const buttonY = optionY + index * spacing;
            
            const button = this.add.text(
                width / 2,
                buttonY,
                buttonText,
                {
                    fontSize: '24px',  // 稍微减小字体
                    fill: '#FFFFFF',  // 纯白色文字
                    fontFamily: 'Arial, sans-serif',  // 使用系统字体
                    backgroundColor: '#667EEA',  // 蓝紫色背景（大写）
                    padding: { x: 35, y: 15 },
                    stroke: '#000000',
                    strokeThickness: 2
                }
            );
            button.setOrigin(0.5);
            button.setDepth(10);  // 确保在最上层
            button.setInteractive({ useHandCursor: true });
            button.on('pointerdown', () => this.selectAnswer(option));
            button.on('pointerover', () => {
                button.setTint(0x764ba2);
                button.setScale(1.05);
            });
            button.on('pointerout', () => {
                button.clearTint();
                button.setScale(1.0);
            });
            
            console.log(`选项按钮 ${index} 已创建:`, button);
            console.log(`选项按钮 ${index} 位置:`, button.x, button.y);
            console.log(`选项按钮 ${index} 可见性:`, button.visible, button.alpha);
            
            this.optionButtons.push(button);
        });
        
        // 返回按钮（左上角，古風樣式）
        const returnButton = this.add.text(50, 50, '返回', {
            fontSize: '24px',
            fill: '#E8D5B7',  // 古風米色
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#1a1a1a',
            padding: { x: 20, y: 12 },
            stroke: '#FFD700',  // 金色描邊
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4
            }
        });
        returnButton.setOrigin(0, 0.5);
        returnButton.setDepth(100);
        returnButton.setInteractive({ useHandCursor: true });
        
        // 返回按鈕懸停效果
        returnButton.on('pointerover', () => {
            returnButton.setTint(0xFFD700);  // 金色高亮
            returnButton.setScale(1.1);
            returnButton.setBackgroundColor('#2a2a1a');
        });
        
        returnButton.on('pointerout', () => {
            returnButton.clearTint();
            returnButton.setScale(1.0);
            returnButton.setBackgroundColor('#1a1a1a');
        });
        
        // 返回按鈕點擊事件
        returnButton.on('pointerdown', () => {
            console.log('返回按鈕被點擊');
            this.scene.stop();
        });
        
        
        // ESC 鍵關閉
        this.input.keyboard.on('keydown-ESC', () => {
            console.log('ESC 鍵被按下，返回遊戲場景');
            this.scene.stop();
        });
    }
    
    selectAnswer(answer) {
        const { width, height } = this.cameras.main;
        const player = window.gameData.player;
        const isCorrect = this.currentProblem.checkAnswer(answer);
        
        player.recordAnswer(isCorrect);
        
        if (isCorrect) {
            // 正确答案 - 应用连击奖励
            const baseExp = 10 * window.gameData.currentSpirit.difficulty;
            const comboMultiplier = player.getComboMultiplier();
            const expGained = Math.floor(baseExp * comboMultiplier);
            const leveledUp = player.gainExp(expGained);
            
            // 显示结果（移到屏幕下方，避免遮挡题目）
            let resultMessage = `正确！获得 ${expGained} 点修为`;
            if (player.combo > 1) {
                resultMessage += `\n连击 x${player.combo} (${Math.round(comboMultiplier * 100)}% 奖励)`;
            }
            
            // 将提示移到屏幕下方（y=650），避免遮挡题目（题目在 y=200）
            const resultText = this.add.text(width / 2, 650, resultMessage, {
                fontSize: '24px',
                fill: '#50E3C2',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 20, y: 15 },
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            });
            resultText.setOrigin(0.5);
            resultText.setDepth(20);
            
            // 添加淡出动画，2秒后自动消失
            this.tweens.add({
                targets: resultText,
                alpha: 0,
                duration: 2000,
                delay: 1000,
                onComplete: () => resultText.destroy()
            });
            
            // 触发任务和成就系统更新
            if (window.gameData.taskSystem) {
                window.gameData.taskSystem.updateTaskProgress('problem_solved', {}, player);
                window.gameData.taskSystem.updateTaskProgress('combo_achieved', { combo: player.combo }, player);
            }
            
            // 如果是挑战模式，记录挑战进度
            if (window.gameData.isChallengeMode && window.gameData.challengeSystem) {
                window.gameData.challengeSystem.recordAnswer(true);
            }
            
            // 应用技能效果（修为加成）
            if (window.gameData.skillSystem) {
                const expMultiplier = window.gameData.skillSystem.getSkillEffect('exp_multiplier');
                if (expMultiplier > 0) {
                    const bonusExp = Math.floor(expGained * expMultiplier);
                    player.gainExp(bonusExp);
                }
            }
            
            if (window.gameData.achievementSystem) {
                window.gameData.achievementSystem.checkAchievements(player, 'problem_solved', { combo: player.combo });
            }
            
            // 尝试掉落道具或材料
            const currentSpirit = window.gameData.currentSpirit || { difficulty: 1 };
            const droppedItem = window.gameData.dropSystem.tryDrop(
                currentSpirit.difficulty || 1,
                player.combo
            );
            
            if (droppedItem) {
                // 添加到玩家背包
                player.addCollectible(droppedItem);
                
                // 显示掉落提示（移到屏幕下方，避免遮挡题目）
                const dropMessage = droppedItem.quantity > 1 
                    ? `获得 ${droppedItem.name} x${droppedItem.quantity}！`
                    : `获得 ${droppedItem.name}！`;
                
                const rarityColor = window.gameData.dropSystem.getRarityColor(droppedItem.rarity);
                
                // 将掉落提示移到屏幕下方（y=700），避免遮挡题目
                const dropText = this.add.text(width / 2, 700, dropMessage, {
                    fontSize: '24px',
                    fill: rarityColor,
                    fontFamily: 'Microsoft YaHei, SimSun, serif',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: { x: 20, y: 15 },
                    stroke: '#000000',
                    strokeThickness: 2,
                    align: 'center'
                });
                dropText.setOrigin(0.5);
                dropText.setDepth(20);
                
                // 添加闪烁动画
                this.tweens.add({
                    targets: dropText,
                    scale: { from: 1, to: 1.2 },
                    duration: 300,
                    yoyo: true,
                    repeat: 1
                });
                
                // 延迟销毁
                this.time.delayedCall(2500, () => {
                    dropText.destroy();
                });
                
                // 更新任务系统（如果是材料）
                if (droppedItem.type === 'material' && window.gameData.taskSystem) {
                    window.gameData.taskSystem.updateTaskProgress('item_collected', { 
                        itemId: droppedItem.id 
                    }, player);
                }
            }
            
            if (leveledUp) {
                const levelUpText = this.add.text(width / 2, 250, `恭喜！境界提升至 ${player.realm}！`, {
                    fontSize: '32px',
                    fill: '#FFD93D',
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: '#000000',
                    padding: { x: 20, y: 15 },
                    stroke: '#000000',
                    strokeThickness: 3
                });
                levelUpText.setOrigin(0.5);
                levelUpText.setDepth(20);
                
                // 解锁新区域
                if (window.gameData.zoneManager) {
                    window.gameData.zoneManager.unlockZonesForRealm(player.realm);
                }
                
                this.tweens.add({
                    targets: levelUpText,
                    scale: 1.2,
                    duration: 500,
                    yoyo: true,
                    repeat: 1
                });
            }
            
            // 禁用所有按钮
            this.optionButtons.forEach(btn => {
                btn.disableInteractive();
                if (this.currentProblem.options[this.optionButtons.indexOf(btn)] === answer) {
                    btn.setTint(0x50e3c2);
                } else {
                    btn.setAlpha(0.5);
                }
            });
            
            // 延迟关闭
            this.time.delayedCall(2000, () => {
                this.scene.stop();
            });
        } else {
            // 错误答案
            // 如果是挑战模式，记录挑战进度
            if (window.gameData.isChallengeMode && window.gameData.challengeSystem) {
                window.gameData.challengeSystem.recordAnswer(false);
            }
            
            // 错误答案（移到屏幕下方，避免遮挡题目）
            const resultText = this.add.text(width / 2, 650, '回答错误，请再试一次', {
                fontSize: '24px',
                fill: '#FF6B6B',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 20, y: 15 },
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            });
            resultText.setOrigin(0.5);
            resultText.setDepth(20);
            
            // 添加淡出动画，2秒后自动消失
            this.tweens.add({
                targets: resultText,
                alpha: 0,
                duration: 2000,
                delay: 1000,
                onComplete: () => resultText.destroy()
            });
            
            // 高亮正确答案
            this.optionButtons.forEach((btn, index) => {
                const optionValue = this.currentProblem.options[index];
                if (optionValue === this.currentProblem.correctAnswer) {
                    btn.setTint(0x50e3c2);
                } else if (optionValue === answer) {
                    btn.setTint(0xff6b6b);
                }
            });
            
            // 延迟后重新生成题目
            this.time.delayedCall(2000, () => {
                resultText.destroy();
                this.generateNewProblem();
            });
        }
    }
    
    generateNewProblem() {
        const player = window.gameData.player;
        const spirit = window.gameData.currentSpirit;
        const problemBank = new ProblemBank();
        
        // 传递数学之灵名称以生成对应类型的题目
        this.currentProblem = problemBank.getProblem(
            player.currentZone,
            spirit.difficulty,
            spirit.name  // 传递数学之灵名称
        );
        
        // 更新题目和选项
        this.problemText.setText(this.currentProblem.problem);
        
        this.optionButtons.forEach((btn, index) => {
            btn.setText(`${String.fromCharCode(65 + index)}. ${this.currentProblem.options[index]}`)
                .clearTint()
                .setAlpha(1)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.selectAnswer(this.currentProblem.options[index]));
        });
    }
}

