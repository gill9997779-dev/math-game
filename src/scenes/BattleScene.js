// Phaser 从全局对象获取
import { ProblemBank } from '../core/MathProblem.js';
import { CombatPowerSystem } from '../core/CombatPowerSystem.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 对战场景 - 回合制数学战斗
 * 玩家与数学之灵进行回合制战斗，通过答题造成伤害
 */
export class BattleScene extends Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }
    
    create() {
        Logger.info('BattleScene 创建中...');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.width = width;
        this.height = height;
        
        // 获取玩家和数学之灵数据
        this.player = window.gameData.player;
        this.spirit = window.gameData.currentSpirit || { name: '数学之灵', difficulty: 1 };
        
        if (!this.player) {
            Logger.error('玩家数据未初始化');
            this.showErrorAndReturn('玩家数据未初始化');
            return;
        }
        
        // 初始化战斗力系统
        if (!window.gameData.combatPowerSystem) {
            window.gameData.combatPowerSystem = new CombatPowerSystem();
        }
        this.combatPowerSystem = window.gameData.combatPowerSystem;
        
        // 计算战斗力
        this.playerPower = this.combatPowerSystem.calculateCombatPower(this.player);
        this.spiritPower = this.combatPowerSystem.calculateSpiritPower(this.spirit);
        
        // 战斗状态
        this.playerHealth = this.player.maxHealth || 100;
        this.spiritHealth = Math.floor(this.spiritPower * 2); // 敌人生命值基于战斗力
        this.maxPlayerHealth = this.playerHealth;
        this.maxSpiritHealth = this.spiritHealth;
        this.currentTurn = 'player'; // player 或 spirit
        this.isGameOver = false;
        this.isVictory = false;
        
        // 创建背景
        this.createBackground();
        
        // 创建战斗UI
        this.createBattleUI();
        
        // 创建题目区域
        this.createProblemArea();
        
        // 开始第一回合
        this.startPlayerTurn();
    }
    
    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 渐变背景
        const graphics = this.add.graphics();
        const steps = 100;
        const color1 = 0x1a1a2e;
        const color2 = 0x2d1b4e;
        
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
    
    createBattleUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 玩家信息（左侧）
        const playerPanel = this.add.container(150, 150);
        const playerBg = this.add.rectangle(0, 0, 300, 200, 0x1a1a1a, 0.9);
        playerBg.setStrokeStyle(3, 0x4a90e2);
        
        const playerTitle = this.add.text(0, -80, '玩家', {
            fontSize: '24px',
            fill: '#4a90e2',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.playerHealthText = this.add.text(0, -40, `生命: ${this.playerHealth}/${this.maxPlayerHealth}`, {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5);
        
        this.playerPowerText = this.add.text(0, 0, `战斗力: ${this.playerPower}`, {
            fontSize: '18px',
            fill: '#50e3c2',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5);
        
        // 玩家生命值条
        this.playerHealthBar = this.add.rectangle(0, 40, 250, 20, 0xff6b6b, 1.0);
        this.playerHealthBarBg = this.add.rectangle(0, 40, 250, 20, 0x333333, 1.0);
        this.playerHealthBar.setOrigin(0, 0.5);
        this.playerHealthBarBg.setOrigin(0, 0.5);
        
        playerPanel.add([playerBg, playerTitle, this.playerHealthText, this.playerPowerText, 
                         this.playerHealthBarBg, this.playerHealthBar]);
        playerPanel.setDepth(100);
        
        // 数学之灵信息（右侧）
        const spiritPanel = this.add.container(width - 150, 150);
        const spiritBg = this.add.rectangle(0, 0, 300, 200, 0x1a1a1a, 0.9);
        spiritBg.setStrokeStyle(3, 0xffd700);
        
        const spiritTitle = this.add.text(0, -80, this.spirit.name, {
            fontSize: '24px',
            fill: '#ffd700',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.spiritHealthText = this.add.text(0, -40, `生命: ${this.spiritHealth}/${this.maxSpiritHealth}`, {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5);
        
        this.spiritPowerText = this.add.text(0, 0, `战斗力: ${this.spiritPower}`, {
            fontSize: '18px',
            fill: '#ffa500',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5);
        
        // 敌人生命值条
        this.spiritHealthBar = this.add.rectangle(0, 40, 250, 20, 0xff6b6b, 1.0);
        this.spiritHealthBarBg = this.add.rectangle(0, 40, 250, 20, 0x333333, 1.0);
        this.spiritHealthBar.setOrigin(0, 0.5);
        this.spiritHealthBarBg.setOrigin(0, 0.5);
        
        spiritPanel.add([spiritBg, spiritTitle, this.spiritHealthText, this.spiritPowerText,
                         this.spiritHealthBarBg, this.spiritHealthBar]);
        spiritPanel.setDepth(100);
        
        // 回合提示
        this.turnText = this.add.text(width / 2, 50, '你的回合', {
            fontSize: '28px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);
        
        // 返回按钮
        const returnBtn = this.add.text(50, 50, '返回', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#666666',
            padding: { x: 15, y: 10 }
        }).setInteractive({ useHandCursor: true }).setDepth(100);
        
        returnBtn.on('pointerdown', () => {
            this.returnToGameScene();
        });
        
        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToGameScene();
        });
    }
    
    createProblemArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 题目显示区域
        this.problemText = this.add.text(width / 2, height / 2 - 100, '', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 30, y: 20 },
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // 选项按钮
        this.optionButtons = [];
    }
    
    startPlayerTurn() {
        if (this.isGameOver) return;
        
        this.currentTurn = 'player';
        this.turnText.setText('你的回合').setColor('#FFD700');
        
        // 生成题目
        this.generateProblem();
    }
    
    generateProblem() {
        const problemBank = new ProblemBank();
        this.currentProblem = problemBank.getProblem(
            this.player.currentZone,
            this.spirit.difficulty,
            this.spirit.name,
            this.player        // 传递玩家对象以支持概念系统
        );
        
        // 显示题目
        this.problemText.setText(this.currentProblem.problem);
        
        // 创建选项按钮
        this.clearOptionButtons();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const optionY = height / 2 + 50;
        const spacing = 80;
        
        this.currentProblem.options.forEach((option, index) => {
            const button = this.add.text(
                width / 2 - 120 + (index % 2) * 240,
                optionY + Math.floor(index / 2) * spacing,
                `${String.fromCharCode(65 + index)}. ${option}`,
                {
                    fontSize: '24px',
                    fill: '#FFFFFF',
                    fontFamily: 'Microsoft YaHei, SimSun, serif',
                    backgroundColor: '#667eea',
                    padding: { x: 25, y: 15 },
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });
            
            button.on('pointerover', () => {
                button.setTint(0x764ba2);
                button.setScale(1.1);
            });
            button.on('pointerout', () => {
                button.clearTint();
                button.setScale(1.0);
            });
            button.on('pointerdown', () => {
                this.selectAnswer(option);
            });
            
            this.optionButtons.push(button);
        });
    }
    
    clearOptionButtons() {
        this.optionButtons.forEach(btn => btn.destroy());
        this.optionButtons = [];
    }
    
    selectAnswer(answer) {
        if (this.currentTurn !== 'player' || this.isGameOver) return;
        
        const isCorrect = this.currentProblem.checkAnswer(answer);
        this.player.recordAnswer(isCorrect);
        
        if (isCorrect) {
            // 正确答案：造成伤害
            const damage = Math.floor(this.playerPower * 0.1 + Math.random() * this.playerPower * 0.1);
            this.spiritHealth = Math.max(0, this.spiritHealth - damage);
            
            // 显示伤害数字
            this.showDamageNumber(this.width - 150, 150, damage, '#50e3c2');
            
            // 更新UI
            this.updateUI();
            
            // 检查是否胜利
            if (this.spiritHealth <= 0) {
                this.victory();
                return;
            }
            
            // 延迟后切换到敌人回合
            this.time.delayedCall(1500, () => {
                this.startSpiritTurn();
            });
        } else {
            // 错误答案：玩家受到伤害
            const damage = Math.floor(this.spiritPower * 0.15);
            this.playerHealth = Math.max(0, this.playerHealth - damage);
            
            // 显示伤害数字
            this.showDamageNumber(150, 150, damage, '#ff6b6b');
            
            // 更新UI
            this.updateUI();
            
            // 检查是否失败
            if (this.playerHealth <= 0) {
                this.defeat();
                return;
            }
            
            // 延迟后切换到敌人回合
            this.time.delayedCall(1500, () => {
                this.startSpiritTurn();
            });
        }
        
        // 清除选项按钮
        this.clearOptionButtons();
        this.problemText.setText('');
    }
    
    startSpiritTurn() {
        if (this.isGameOver) return;
        
        this.currentTurn = 'spirit';
        this.turnText.setText(`${this.spirit.name}的回合`).setColor('#ff6b6b');
        
        // 敌人攻击：生成题目，玩家必须答对才能防御
        this.generateProblem();
        
        // 3秒后如果还没答题，自动造成伤害
        this.spiritAttackTimer = this.time.delayedCall(3000, () => {
            if (this.currentTurn === 'spirit' && !this.isGameOver) {
                // 超时，造成伤害
                const damage = Math.floor(this.spiritPower * 0.2);
                this.playerHealth = Math.max(0, this.playerHealth - damage);
                this.showDamageNumber(150, 150, damage, '#ff6b6b');
                this.updateUI();
                
                if (this.playerHealth <= 0) {
                    this.defeat();
                } else {
                    this.clearOptionButtons();
                    this.problemText.setText('');
                    this.time.delayedCall(1000, () => {
                        this.startPlayerTurn();
                    });
                }
            }
        });
    }
    
    showDamageNumber(x, y, damage, color) {
        const damageText = this.add.text(x, y, `-${damage}`, {
            fontSize: '36px',
            fill: color,
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(200);
        
        this.tweens.add({
            targets: damageText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => damageText.destroy()
        });
    }
    
    updateUI() {
        // 更新生命值文本
        this.playerHealthText.setText(`生命: ${this.playerHealth}/${this.maxPlayerHealth}`);
        this.spiritHealthText.setText(`生命: ${this.spiritHealth}/${this.maxSpiritHealth}`);
        
        // 更新生命值条
        const playerHealthRatio = this.playerHealth / this.maxPlayerHealth;
        this.playerHealthBar.setScale(playerHealthRatio, 1);
        
        const spiritHealthRatio = this.spiritHealth / this.maxSpiritHealth;
        this.spiritHealthBar.setScale(spiritHealthRatio, 1);
    }
    
    victory() {
        this.isGameOver = true;
        this.isVictory = true;
        this.currentTurn = '';
        
        if (this.spiritAttackTimer) {
            this.spiritAttackTimer.remove();
        }
        
        const { width, height } = this.cameras.main;
        
        // 胜利提示
        const victoryText = this.add.text(width / 2, height / 2, '胜利！', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);
        
        // 计算奖励
        const expGain = Math.floor(this.spiritPower * 0.5);
        const leveledUp = this.player.gainExp(expGain);
        
        const rewardText = this.add.text(width / 2, height / 2 + 80, 
            `获得 ${expGain} 点修为`, {
            fontSize: '24px',
            fill: '#50e3c2',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5).setDepth(200);
        
        // 返回按钮
        const returnBtn = this.add.text(width / 2, height / 2 + 150, '返回', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#50e3c2',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerdown', () => {
            this.returnToGameScene();
        });
        
        // 3秒后自动返回
        this.time.delayedCall(3000, () => {
            if (!this.isGameOver) return;
            this.returnToGameScene();
        });
    }
    
    defeat() {
        this.isGameOver = true;
        this.isVictory = false;
        this.currentTurn = '';
        
        if (this.spiritAttackTimer) {
            this.spiritAttackTimer.remove();
        }
        
        const { width, height } = this.cameras.main;
        
        // 失败提示
        const defeatText = this.add.text(width / 2, height / 2, '失败！', {
            fontSize: '48px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);
        
        // 返回按钮
        const returnBtn = this.add.text(width / 2, height / 2 + 80, '返回', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#ff6b6b',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerdown', () => {
            this.returnToGameScene();
        });
    }
    
    returnToGameScene() {
        this.scene.stop();
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.scene.isPaused()) {
            gameScene.scene.resume();
        }
    }
    
    showErrorAndReturn(message) {
        const { width, height } = this.cameras.main;
        const errorText = this.add.text(width / 2, height / 2, message, {
            fontSize: '24px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5).setDepth(200);
        
        this.time.delayedCall(2000, () => {
            this.returnToGameScene();
        });
    }
}

