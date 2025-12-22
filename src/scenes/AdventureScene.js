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
        const buttonSpacing = 100;
        const startY = centerY - 100;
        
        // 1. 地图选择
        this.createAdventureButton(
            width / 2, 
            startY, 
            '地图选择',
            '选择不同的区域进行探索和挑战',
            '#9b59b6',
            () => this.showZoneSelector()
        );
        
        // 2. 弹幕战斗（数学之灵挑战）
        this.createAdventureButton(
            width / 2, 
            startY + buttonSpacing, 
            '弹幕战斗',
            '与数学之灵战斗，躲避错误答案，收集正确答案',
            '#4a90e2',
            () => this.startMathCombat()
        );
        
        // 3. 限时挑战
        this.createAdventureButton(
            width / 2, 
            startY + buttonSpacing * 2, 
            '限时挑战',
            '在限定时间内解答尽可能多的题目',
            '#50e3c2',
            () => this.startTimeChallenge()
        );
        
        // 4. 数学挑战（传统答题）
        this.createAdventureButton(
            width / 2, 
            startY + buttonSpacing * 3, 
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
        
        try {
            const player = window.gameData.player;
            if (!player) {
                Logger.error('玩家数据未初始化');
                this.showMessage('玩家数据未初始化', '#ff6b6b');
                return;
            }
            
            // 获取当前区域的数学之灵
            const zoneManager = window.gameData.zoneManager;
            if (!zoneManager) {
                Logger.error('区域管理器未初始化');
                this.showMessage('区域管理器未初始化', '#ff6b6b');
                return;
            }
            
            const currentZone = zoneManager.getZone(player.currentZone) || zoneManager.getZone('青石村');
            if (!currentZone) {
                Logger.error('无法获取当前区域');
                this.showMessage('无法获取当前区域', '#ff6b6b');
                return;
            }
            
            const spirits = currentZone.mathSpirits || [];
            Logger.info('当前区域数学之灵数量:', spirits.length);
            
            if (spirits.length === 0) {
                this.showMessage('当前区域没有可挑战的数学之灵', '#ff6b6b');
                return;
            }
            
            // 选择第一个数学之灵（或可以扩展为选择界面）
            const spirit = spirits[0];
            window.gameData.currentSpirit = spirit;
            Logger.info('选择的数学之灵:', spirit);
            
            // 暂停当前场景并启动战斗场景
            this.scene.pause();
            this.scene.launch('MathCombatScene');
            Logger.info('MathCombatScene 已启动');
        } catch (error) {
            Logger.error('启动弹幕战斗失败:', error);
            this.showMessage('启动弹幕战斗失败: ' + error.message, '#ff6b6b');
        }
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
        const spirits = currentZone.mathSpirits || [];
        
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
        
        // 对话框背景（增加高度以容纳所有按钮）
        const dialogBg = this.add.rectangle(width / 2, height / 2, 500, 500, 0x000000, 0.95);
        dialogBg.setStrokeStyle(3, 0xffa500);
        dialogBg.setDepth(200);
        dialogBg.setInteractive({ useHandCursor: false });
        
        // 标题
        const title = this.add.text(width / 2, height / 2 - 200, '选择挑战难度', {
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
        // 调整按钮间距，避免重叠（每个按钮高度约50px，间距设为70px）
        const buttonSpacing = 70;
        const startY = height / 2 - 80;
        
        difficulties.forEach((diff, index) => {
            const btnY = startY + index * buttonSpacing;
            const btn = this.add.text(width / 2, btnY, `${diff.name} (${diff.timeLimit}秒)`, {
                fontSize: '22px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                backgroundColor: diff.color,
                padding: { x: 30, y: 10 },
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
        
        // 取消按钮（调整位置，确保不重叠）
        const cancelBtn = this.add.text(width / 2, height / 2 + 180, '取消', {
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
     * 显示地图选择器
     */
    showZoneSelector() {
        const { width, height } = this.cameras.main;
        const player = window.gameData.player;
        const zoneManager = window.gameData.zoneManager;
        
        if (!zoneManager) {
            this.showMessage('区域管理器未初始化', '#ff6b6b');
            return;
        }
        
        // 解锁符合条件的区域
        zoneManager.unlockZonesForRealm(player.realm);
        
        // 获取所有区域
        const allZones = zoneManager.getAllZones();
        
        // 创建地图选择面板
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 700, 600, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setDepth(200);
        
        const title = this.add.text(0, -280, '选择地图', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(201);
        
        const closeBtn = this.add.text(320, -280, '✕', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial',
            backgroundColor: '#666666',
            padding: { x: 10, y: 8 }
        }).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => {
            closeBtn.setTint(0xcccccc);
            closeBtn.setScale(1.1);
        });
        closeBtn.on('pointerout', () => {
            closeBtn.clearTint();
            closeBtn.setScale(1.0);
        });
        closeBtn.on('pointerdown', () => {
            panel.destroy();
        });
        
        panel.add([bg, title, closeBtn]);
        panel.setDepth(200);
        
        // 显示所有地图
        let yOffset = -200;
        allZones.forEach((zone, index) => {
            const canEnter = zone.canEnter(player);
            const isCurrentZone = zone.name === player.currentZone;
            
            // 先创建背景框
            let zoneButton;
            if (isCurrentZone) {
                // 当前地图高亮
                zoneButton = this.add.rectangle(0, yOffset, 650, 70, 0x4a4a2a, 0.5)
                    .setStrokeStyle(2, 0xFFD700);
            } else if (canEnter) {
                // 可进入的地图
                zoneButton = this.add.rectangle(0, yOffset, 650, 70, 0x333333, 0.5)
                    .setInteractive({ useHandCursor: true })
                    .setStrokeStyle(2, 0x50e3c2);
                
                zoneButton.on('pointerover', () => {
                    zoneButton.setFillStyle(0x444444, 0.6);
                });
                zoneButton.on('pointerout', () => {
                    zoneButton.setFillStyle(0x333333, 0.5);
                });
                zoneButton.on('pointerdown', async () => {
                    // 验证是否可以进入该地图（双重检查）
                    if (!zone.canEnter(player)) {
                        this.showMessage(`无法进入 ${zone.name}，需要 ${zone.realmRequired} 境界`, '#ff6b6b');
                        return;
                    }
                    
                    // 验证 GameScene 是否存在
                    const gameScene = this.scene.get('GameScene');
                    if (!gameScene) {
                        Logger.error('GameScene 不存在，无法切换地图');
                        this.showMessage('游戏场景未初始化，无法切换地图', '#ff6b6b');
                        return;
                    }
                    
                    // 先更新地图（在保存前更新，确保保存的是新地图）
                    const oldZone = player.currentZone;
                    player.currentZone = zone.name;
                    
                    // 确保玩家数据已保存到 window.gameData（在保存前确保数据同步）
                    if (player && window.gameData) {
                        window.gameData.player = player;
                    }
                    
                    // 切换地图前先保存游戏数据，确保修为等数据不丢失
                    try {
                        if (typeof gameScene.saveGame === 'function') {
                            // 等待保存完成
                            await gameScene.saveGame();
                        }
                        
                        // 也保存到 localStorage 作为备份
                        try {
                            const username = window.gameData.username || window.gameData.playerId || 'default_player';
                            const saveData = {
                                playerData: player.toJSON(),
                                taskSystem: window.gameData.taskSystem ? window.gameData.taskSystem.toJSON() : null,
                                achievementSystem: window.gameData.achievementSystem ? window.gameData.achievementSystem.toJSON() : null,
                                skillSystem: window.gameData.skillSystem ? window.gameData.skillSystem.toJSON() : null,
                                dailyCheckIn: window.gameData.dailyCheckIn ? window.gameData.dailyCheckIn.toJSON() : null,
                                challengeSystem: window.gameData.challengeSystem ? window.gameData.challengeSystem.toJSON() : null,
                                treasureSystem: window.gameData.treasureSystem ? window.gameData.treasureSystem.toJSON() : null
                            };
                            const localKey = `game_save_${username}`;
                            localStorage.setItem(localKey, JSON.stringify(saveData));
                            Logger.info('地图切换前数据已保存到本地存储');
                        } catch (e) {
                            Logger.warn('保存到本地存储失败:', e);
                        }
                    } catch (saveError) {
                        Logger.error('保存游戏数据失败:', saveError);
                        // 如果保存失败，恢复原来的地图
                        player.currentZone = oldZone;
                        this.showMessage('保存数据失败，地图切换已取消', '#ff6b6b');
                        return;
                    }
                    
                    // 关闭对话框并返回游戏场景
                    panel.destroy();
                    this.scene.stop();
                    
                    // 使用 scene.start 而不是 restart，并传递数据确保玩家数据被保留
                    try {
                        gameScene.scene.start('GameScene', { 
                            zoneSwitch: true,
                            preserveData: true,
                            targetZone: zone.name
                        });
                        Logger.info(`地图切换成功: ${oldZone} -> ${zone.name}`);
                    } catch (switchError) {
                        Logger.error('地图切换失败:', switchError);
                        // 如果切换失败，尝试恢复原来的地图
                        player.currentZone = oldZone;
                        if (window.gameData) {
                            window.gameData.player = player;
                        }
                        // 重新显示对话框
                        this.scene.start('AdventureScene');
                        this.showMessage('地图切换失败，请重试', '#ff6b6b');
                    }
                });
            } else {
                // 未解锁的地图
                zoneButton = this.add.rectangle(0, yOffset, 650, 70, 0x222222, 0.5)
                    .setStrokeStyle(2, 0x666666);
            }
            
            // 地图信息（放在框内，使用容器坐标）
            const zoneInfo = this.add.text(-280, yOffset, 
                `${zone.name}\n境界要求: ${zone.realmRequired} | 难度: ${zone.difficulty}`, {
                fontSize: '18px',
                fill: canEnter ? (isCurrentZone ? '#FFD700' : '#fff') : '#888',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                align: 'left'
            }).setOrigin(0, 0.5).setDepth(201);
            
            // 状态标签（放在框内右侧）
            let statusText = '';
            if (isCurrentZone) {
                statusText = '当前地图';
            } else if (!canEnter) {
                statusText = '未解锁';
            } else {
                statusText = '点击进入';
            }
            
            const statusLabel = this.add.text(250, yOffset, statusText, {
                fontSize: '16px',
                fill: isCurrentZone ? '#FFD700' : (canEnter ? '#50e3c2' : '#888'),
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                backgroundColor: isCurrentZone ? 'rgba(255,215,0,0.2)' : (canEnter ? 'rgba(80,227,194,0.2)' : 'rgba(136,136,136,0.2)'),
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setDepth(201);
            
            panel.add([zoneButton, zoneInfo, statusLabel]);
            yOffset += 80;
        });
        
        // 如果没有可用的地图，显示提示
        if (allZones.filter(z => z.canEnter(player)).length === 0) {
            const noZoneText = this.add.text(0, 0, '暂无可用地图\n请提升境界解锁更多地图', {
                fontSize: '20px',
                fill: '#888',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                align: 'center'
            }).setOrigin(0.5).setDepth(201);
            panel.add(noZoneText);
        }
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

