// Phaser 从全局对象获取
const { Scene } = Phaser;
import { Player } from '../core/Player.js';
import { ZoneManager } from '../core/Zone.js';
import { TaskSystem } from '../core/TaskSystem.js';
import { AchievementSystem } from '../core/AchievementSystem.js';
import { EventSystem } from '../core/EventSystem.js';
import { DailyCheckInSystem } from '../core/DailyCheckInSystem.js';
import { SkillSystem } from '../core/SkillSystem.js';
import { ShopSystem } from '../core/ShopSystem.js';
import { ChallengeSystem } from '../core/ChallengeSystem.js';
import { TreasureSystem } from '../core/TreasureSystem.js';

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // 確保 Player 存在
        if (!window.gameData.player) {
            window.gameData.player = new Player();
        }
        const player = window.gameData.player;
        
        // 初始化区域管理器
        if (!window.gameData.zoneManager) {
            window.gameData.zoneManager = new ZoneManager();
        }
        const zoneManager = window.gameData.zoneManager;
        
        // 初始化任务系统
        if (!window.gameData.taskSystem) {
            window.gameData.taskSystem = new TaskSystem();
            window.gameData.taskSystem.initializeTasks(player);
        }
        
        // 初始化成就系统
        if (!window.gameData.achievementSystem) {
            window.gameData.achievementSystem = new AchievementSystem();
        }
        
        // 初始化事件系统
        if (!window.gameData.eventSystem) {
            window.gameData.eventSystem = new EventSystem();
            window.gameData.eventSystem.initializeEvents();
        }
        
        // 初始化每日签到系统
        if (!window.gameData.dailyCheckIn) {
            window.gameData.dailyCheckIn = new DailyCheckInSystem();
        }
        
        // 初始化技能系统
        if (!window.gameData.skillSystem) {
            window.gameData.skillSystem = new SkillSystem();
            // 境界提升时给予技能点
            if (player.realmLevel > 1) {
                window.gameData.skillSystem.gainSkillPoint(player.realmLevel - 1);
            }
        }
        
        // 初始化商店系统
        if (!window.gameData.shopSystem) {
            window.gameData.shopSystem = new ShopSystem();
        }
        
        // 初始化挑战系统
        if (!window.gameData.challengeSystem) {
            window.gameData.challengeSystem = new ChallengeSystem();
        }
        
        // 初始化宝藏系统
        if (!window.gameData.treasureSystem) {
            window.gameData.treasureSystem = new TreasureSystem();
        }
        
        // 获取当前区域（必须先获取，因为后面会使用）
        const currentZone = zoneManager.getZone(player.currentZone) || zoneManager.getZone('青石村');
        player.currentZone = currentZone.name;
        
        // 记录区域探索
        const isFirstVisit = player.exploreZone(currentZone.name);
        if (isFirstVisit) {
            // 首次探索奖励
            player.gainExp(20);
            if (window.gameData.taskSystem) {
                window.gameData.taskSystem.updateTaskProgress('zone_entered', { 
                    exploredZones: player.exploredZones 
                }, player);
            }
        }
        
        // 创建宝藏（在获取currentZone之后）
        this.createTreasures(currentZone);
        
        // 设置背景（优先使用背景图片，完全显示，不添加遮罩）
        console.log('GameScene - 检查背景图片:', this.textures.exists('game_background'));
        if (this.textures.exists('game_background')) {
            // 使用背景图片，不添加遮罩，让背景图片完全显示
            const bg = this.add.image(width / 2, height / 2, 'game_background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            bg.setScale(Math.max(scaleX, scaleY));
            bg.setDepth(0);
            console.log('✓ GameScene 背景图片已添加，尺寸:', bg.width, bg.height, '缩放:', bg.scaleX, bg.scaleY);
        } else {
            // 使用渐变背景 + 区域颜色遮罩
            console.warn('⚠ GameScene - 背景图片不存在，使用渐变背景');
            this.createGradientBackground();
            // 添加区域颜色遮罩
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, currentZone.background, 0.5);
            overlay.setDepth(1);
        }
        
        // 显示区域名称（调整位置，避免与返回按钮重叠）
        this.add.text(50, 80, currentZone.name, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 15, y: 10 }
        });
        
        // 显示区域描述（调整位置，在区域名称下方）
        this.add.text(50, 130, currentZone.description, {
            fontSize: '18px',
            fill: '#ddd',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 15, y: 10 },
            wordWrap: { width: 400 }  // 添加换行，避免文字过长
        });
        
        // 创建玩家角色（简单表示）
        this.playerSprite = this.add.circle(player.x || width / 2, player.y || height / 2, 20, 0x4a90e2)
            .setInteractive({ useHandCursor: true });
        
        // 创建数学之灵和资源点（位置同步）
        this.mathSpirits = [];
        this.resources = [];
        
        // 先创建数学之灵
        currentZone.mathSpirits.forEach(spirit => {
            const spiritSprite = this.add.circle(spirit.x, spirit.y, 30, 0xf5a623)
                .setInteractive({ useHandCursor: true })
                .setData('spirit', spirit)
                .on('pointerdown', () => {
                    this.startMathChallenge(spirit);
                });
            
            // 添加标签
            this.add.text(spirit.x, spirit.y - 50, spirit.name, {
                fontSize: '16px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            
            this.mathSpirits.push(spiritSprite);
            
            // 在数学之灵的同一位置创建资源点（星星）
            // 根据数学之灵的类型决定资源类型
            const resourceType = spirit.name.includes('加法') || spirit.name.includes('减法') || 
                                spirit.name.includes('乘法') || spirit.name.includes('除法') ? 'herb' : 'ore';
            const resourceName = resourceType === 'herb' ? '青灵草' : '基础矿石';
            
            const resource = {
                id: `resource_${spirit.id}`,
                x: spirit.x,
                y: spirit.y,
                type: resourceType,
                name: resourceName
            };
            
            // 创建资源点（星星形状，使用星形符号）
            const resourceSprite = this.add.star(resource.x, resource.y, 5, 12, 24, 0xffff00, 1)
                .setInteractive({ useHandCursor: true })
                .setData('resource', resource)
                .setDepth(1)  // 确保星星在数学之灵上方
                .on('pointerdown', () => {
                    this.collectResource(resource);
                });
            
            // 资源点标签（稍微偏移，避免与数学之灵标签重叠）
            this.add.text(resource.x, resource.y - 70, resource.name, {
                fontSize: '14px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setDepth(2);
            
            this.resources.push(resourceSprite);
        });
        
        // 如果区域中还有额外的资源点（不在数学之灵位置的），也创建它们
        currentZone.resources.forEach(resource => {
            // 检查是否已经有数学之灵在这个位置
            const hasSpiritAtLocation = currentZone.mathSpirits.some(spirit => 
                spirit.x === resource.x && spirit.y === resource.y
            );
            
            // 如果没有数学之灵在这个位置，才创建独立的资源点
            if (!hasSpiritAtLocation) {
                const resourceSprite = this.add.rectangle(resource.x, resource.y, 25, 25, 
                    resource.type === 'herb' ? 0x50e3c2 : 0xb8e986)
                    .setInteractive({ useHandCursor: true })
                    .setData('resource', resource)
                    .on('pointerdown', () => {
                        this.collectResource(resource);
                    });
                
                this.add.text(resource.x, resource.y - 40, resource.name, {
                    fontSize: '14px',
                    fill: '#fff',
                    fontFamily: 'Microsoft YaHei',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 8, y: 4 }
                }).setOrigin(0.5);
                
                this.resources.push(resourceSprite);
            }
        });
        
        // 创建UI面板
        this.createUI();
        
        // 键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // 返回主菜单按钮（左上角，古風樣式）
        const returnToMenuButton = this.add.text(50, 30, '返回主頁', {
            fontSize: '22px',
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
        returnToMenuButton.setOrigin(0, 0.5);
        returnToMenuButton.setDepth(100);
        returnToMenuButton.setInteractive({ useHandCursor: true });
        
        // 返回按鈕懸停效果
        returnToMenuButton.on('pointerover', () => {
            returnToMenuButton.setTint(0xFFD700);  // 金色高亮
            returnToMenuButton.setScale(1.1);
            returnToMenuButton.setBackgroundColor('#2a2a1a');
        });
        
        returnToMenuButton.on('pointerout', () => {
            returnToMenuButton.clearTint();
            returnToMenuButton.setScale(1.0);
            returnToMenuButton.setBackgroundColor('#1a1a1a');
        });
        
        // 返回按鈕點擊事件
        returnToMenuButton.on('pointerdown', () => {
            console.log('返回主頁按鈕被點擊');
            // 確認對話框
            if (confirm('確定要返回主菜單嗎？未保存的進度可能會丟失。')) {
                this.scene.start('MainMenuScene');
            }
        });
        
        // 保存按钮
        this.add.text(width - 150, 30, '保存', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#4a90e2',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.saveGame());
        
        // 背包按钮
        this.add.text(width - 150, 80, '背包', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.launch('InventoryScene');
        });
        
        // 炼丹炉按钮
        this.add.text(width - 150, 130, '炼丹炉', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#764ba2',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.launch('CraftingScene');
        });
        
        // 任务按钮
        this.add.text(width - 150, 180, '任务', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#50e3c2',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.toggleTaskPanel();
        });
        
        // 成就按钮
        this.add.text(width - 150, 230, '成就', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#f5a623',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.showAchievements();
        });
        
        // 每日签到按钮
        this.add.text(width - 150, 280, '签到', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#50e3c2',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.showDailyCheckIn();
        });
        
        // 显示连击数（放在签到按钮下方，避免重叠）
        this.comboText = this.add.text(width - 150, 315, '', {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // 技能按钮（调整位置，避免与连击数重叠）
        this.add.text(width - 150, 360, '技能', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#9013FE',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.showSkills();
        });
        
        // 商店按钮
        this.add.text(width - 150, 410, '商店', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#B8E986',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.showShop();
        });
        
        // 限时挑战按钮
        this.add.text(width - 150, 460, '挑战', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#FF6B6B',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.showChallenge();
        });
        
        // 初始化任务面板（隐藏）
        this.taskPanelVisible = false;
        this.taskPanel = null;
        
        // 随机事件触发（每30秒检查一次）
        this.time.addEvent({
            delay: 30000,
            callback: this.checkRandomEvent,
            callbackScope: this,
            loop: true
        });
    }
    
    /**
     * 创建宝藏
     */
    createTreasures(zone) {
        const treasureSystem = window.gameData.treasureSystem;
        const treasures = treasureSystem.getTreasuresForZone(zone.name);
        
        this.treasures = [];
        treasures.forEach(treasure => {
            // 根据稀有度选择颜色
            let color = 0xFFFFFF; // 普通-白色
            if (treasure.rarity === 'rare') color = 0x4A90E2; // 稀有-蓝色
            if (treasure.rarity === 'epic') color = 0xBD10E0; // 史诗-紫色
            
            // 创建宝箱（使用星形表示）
            const treasureSprite = this.add.star(treasure.x, treasure.y, 5, 15, 30, color, 1)
                .setInteractive({ useHandCursor: true })
                .setData('treasure', treasure)
                .setDepth(2)
                .on('pointerdown', () => {
                    this.openTreasure(treasure);
                });
            
            // 添加标签
            this.add.text(treasure.x, treasure.y - 50, treasure.name, {
                fontSize: '14px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setDepth(3);
            
            // 添加闪烁动画
            this.tweens.add({
                targets: treasureSprite,
                alpha: { from: 0.5, to: 1 },
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            
            this.treasures.push(treasureSprite);
        });
    }
    
    /**
     * 打开宝藏
     */
    openTreasure(treasure) {
        const player = window.gameData.player;
        const result = window.gameData.treasureSystem.discoverTreasure(treasure.id, player);
        
        if (result.success) {
            // 显示奖励
            const { width, height } = this.cameras.main;
            const rewardText = this.add.text(width / 2, height / 2, 
                `${result.message}\n获得: ${result.rewards.exp} 修为\n${result.rewards.items.map(i => i.name).join(', ')}`, {
                fontSize: '24px',
                fill: '#FFD700',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: '#000000',
                padding: { x: 30, y: 20 },
                align: 'center'
            }).setOrigin(0.5).setDepth(200);
            
            // 移除宝藏
            const treasureSprite = this.treasures.find(t => t.getData('treasure').id === treasure.id);
            if (treasureSprite) {
                treasureSprite.destroy();
                this.treasures = this.treasures.filter(t => t !== treasureSprite);
            }
            
            // 延迟关闭
            this.time.delayedCall(3000, () => {
                rewardText.destroy();
            });
        }
    }
    
    /**
     * 检查随机事件
     */
    checkRandomEvent() {
        const player = window.gameData.player;
        const event = window.gameData.eventSystem.tryTriggerEvent(player);
        
        if (event) {
            this.showRandomEvent(event);
        }
    }
    
    /**
     * 显示随机事件
     */
    showRandomEvent(event) {
        const { width, height } = this.cameras.main;
        
        // 创建事件弹窗
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 500, 300, 0x000000, 0.9);
        bg.setStrokeStyle(3, event.type === 'positive' ? 0x50e3c2 : event.type === 'negative' ? 0xff6b6b : 0xffd93d);
        
        const title = this.add.text(0, -100, `${event.icon} ${event.title}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const desc = this.add.text(0, -30, event.description, {
            fontSize: '18px',
            fill: '#ddd',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 450 },
            align: 'center'
        }).setOrigin(0.5);
        
        const confirmBtn = this.add.text(0, 100, '确定', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        panel.add([bg, title, desc, confirmBtn]);
        panel.setDepth(200);
        
        confirmBtn.on('pointerdown', () => {
            // 应用事件效果
            window.gameData.eventSystem.applyEventEffect(event, window.gameData.player);
            panel.destroy();
        });
    }
    
    /**
     * 切换任务面板
     */
    toggleTaskPanel() {
        if (this.taskPanelVisible) {
            if (this.taskPanel) {
                this.taskPanel.destroy();
            }
            this.taskPanelVisible = false;
        } else {
            this.showTaskPanel();
        }
    }
    
    /**
     * 显示任务面板
     */
    showTaskPanel() {
        const { width, height } = this.cameras.main;
        const taskSystem = window.gameData.taskSystem;
        const activeTasks = taskSystem.getActiveTasks();
        
        // 创建任务面板
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 600, 500, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0x667eea);
        
        const title = this.add.text(0, -220, '任务列表', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(250, -220, '✕', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            panel.destroy();
            this.taskPanelVisible = false;
        });
        
        panel.add([bg, title, closeBtn]);
        
        // 显示任务列表
        let yOffset = -150;
        activeTasks.slice(0, 5).forEach((task, index) => {
            const progress = task.progress || 0;
            const target = task.target.count || 1;
            const progressText = `${progress}/${target}`;
            
            const taskText = this.add.text(-250, yOffset, `${task.title}`, {
                fontSize: '18px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei'
            });
            
            const descText = this.add.text(-250, yOffset + 25, task.description, {
                fontSize: '14px',
                fill: '#aaa',
                fontFamily: 'Microsoft YaHei',
                wordWrap: { width: 450 }
            });
            
            const progressBarBg = this.add.rectangle(0, yOffset + 50, 450, 20, 0x333333);
            const progressBar = this.add.rectangle(-225 + (progress / target) * 225, yOffset + 50, 
                (progress / target) * 450, 20, 0x50e3c2);
            const progressTextObj = this.add.text(200, yOffset + 50, progressText, {
                fontSize: '14px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            panel.add([taskText, descText, progressBarBg, progressBar, progressTextObj]);
            yOffset += 100;
        });
        
        if (activeTasks.length === 0) {
            const noTaskText = this.add.text(0, 0, '暂无任务', {
                fontSize: '20px',
                fill: '#888',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
            panel.add(noTaskText);
        }
        
        panel.setDepth(200);
        this.taskPanel = panel;
        this.taskPanelVisible = true;
    }
    
    /**
     * 显示成就
     */
    showAchievements() {
        const { width, height } = this.cameras.main;
        const achievementSystem = window.gameData.achievementSystem;
        const unlocked = achievementSystem.getUnlockedAchievements();
        const locked = achievementSystem.getLockedAchievements();
        
        // 创建成就面板
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 600, 500, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xf5a623);
        
        const title = this.add.text(0, -220, '成就系统', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(250, -220, '✕', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            panel.destroy();
        });
        
        panel.add([bg, title, closeBtn]);
        
        // 显示已解锁成就
        let yOffset = -150;
        unlocked.forEach((achievement, index) => {
            const achievementText = this.add.text(-250, yOffset, 
                `${achievement.icon} ${achievement.title}`, {
                fontSize: '18px',
                fill: '#FFD700',
                fontFamily: 'Microsoft YaHei'
            });
            
            const descText = this.add.text(-250, yOffset + 25, achievement.description, {
                fontSize: '14px',
                fill: '#aaa',
                fontFamily: 'Microsoft YaHei'
            });
            
            panel.add([achievementText, descText]);
            yOffset += 70;
        });
        
        // 显示未解锁成就（灰色）
        locked.slice(0, 3).forEach((achievement) => {
            const achievementText = this.add.text(-250, yOffset, 
                `🔒 ${achievement.title}`, {
                fontSize: '18px',
                fill: '#666',
                fontFamily: 'Microsoft YaHei'
            });
            
            panel.add(achievementText);
            yOffset += 50;
        });
        
        panel.setDepth(200);
    }
    
    createGradientBackground() {
        const { width, height } = this.cameras.main;
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
        
        graphics.setDepth(0);
        console.log('✓ GameScene 渐变背景已创建');
    }
    
    createUI() {
        const { width, height } = this.cameras.main;
        const player = window.gameData.player;
        const realmData = player.getCurrentRealmData();
        
        // 玩家信息面板
        const infoPanel = this.add.container(50, height - 150);
        
        // 境界显示
        this.realmText = this.add.text(0, 0, `境界: ${player.realm} ${player.realmLevel}层`, {
            fontSize: '20px',
            fill: realmData.color || '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        });
        
        // 修为显示
        this.expText = this.add.text(0, 50, `修为: ${player.exp} / ${player.exp + player.expToNext}`, {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        });
        
        // 准确率显示
        this.accuracyText = this.add.text(0, 100, `准确率: ${player.getAccuracy()}%`, {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        });
        
        infoPanel.add([this.realmText, this.expText, this.accuracyText]);
    }
    
    update() {
        const player = window.gameData.player;
        const speed = 3;
        
        // 移动控制
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.playerSprite.x -= speed;
            player.x = this.playerSprite.x;
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.playerSprite.x += speed;
            player.x = this.playerSprite.x;
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.playerSprite.y -= speed;
            player.y = this.playerSprite.y;
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.playerSprite.y += speed;
            player.y = this.playerSprite.y;
        }
        
        // 更新UI
        if (this.realmText) {
            const realmData = player.getCurrentRealmData();
            this.realmText.setText(`境界: ${player.realm} ${player.realmLevel}层`)
                .setColor(realmData.color || '#fff');
            this.expText.setText(`修为: ${player.exp} / ${player.exp + player.expToNext}`);
            this.accuracyText.setText(`准确率: ${player.getAccuracy()}%`);
        }
        
        // 更新连击显示
        if (this.comboText) {
            if (player.combo > 1) {
                this.comboText.setText(`连击 x${player.combo}`);
                this.comboText.setVisible(true);
            } else {
                this.comboText.setVisible(false);
            }
        }
    }
    
    startMathChallenge(spirit) {
        window.gameData.currentSpirit = spirit;
        this.scene.launch('MathChallengeScene');
    }
    
    collectResource(resource) {
        const player = window.gameData.player;
        player.addCollectible(resource);
        
        // 更新任务系统
        if (window.gameData.taskSystem) {
            window.gameData.taskSystem.updateTaskProgress('resource_collected', {}, player);
            window.gameData.taskSystem.updateTaskProgress('item_collected', { itemId: resource.id }, player);
        }
        
        // 更新成就系统
        if (window.gameData.achievementSystem) {
            window.gameData.achievementSystem.checkAchievements(player, 'item_collected', {});
        }
        
        // 显示提示
        const text = this.add.text(resource.x, resource.y - 60, `获得 ${resource.name}！`, {
            fontSize: '18px',
            fill: '#50e3c2',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // 移除资源点
        const resourceSprite = this.resources.find(r => r.getData('resource').id === resource.id);
        if (resourceSprite) {
            resourceSprite.destroy();
            this.resources = this.resources.filter(r => r !== resourceSprite);
        }
        
        // 淡出提示
        this.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 30,
            duration: 2000,
            onComplete: () => text.destroy()
        });
    }
    
    async saveGame() {
        const player = window.gameData.player;
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerData: player.toJSON() })
            });
            
            if (response.ok) {
                const text = this.add.text(600, 400, '游戏已保存！', {
                    fontSize: '24px',
                    fill: '#50e3c2',
                    fontFamily: 'Microsoft YaHei',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: { x: 20, y: 10 }
                }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => text.destroy()
                });
            }
        } catch (error) {
            console.error('保存失败:', error);
        }
    }
    
    /**
     * 显示每日签到
     */
    showDailyCheckIn() {
        const { width, height } = this.cameras.main;
        const checkInSystem = window.gameData.dailyCheckIn;
        const info = checkInSystem.getCheckInInfo();
        
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0x50e3c2);
        
        const title = this.add.text(0, -150, '每日签到', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(220, -150, '✕', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => panel.destroy());
        
        const infoText = this.add.text(0, -80, 
            `连续签到: ${info.consecutiveDays} 天\n总签到: ${info.totalCheckIns} 次`, {
            fontSize: '18px',
            fill: '#aaa',
            fontFamily: 'Microsoft YaHei',
            align: 'center'
        }).setOrigin(0.5);
        
        const checkInBtn = this.add.text(0, 50, info.canCheckIn ? '签到' : '今日已签到', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: info.canCheckIn ? '#50e3c2' : '#666',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: info.canCheckIn });
        
        if (info.canCheckIn) {
            checkInBtn.on('pointerdown', () => {
                const result = checkInSystem.checkIn(window.gameData.player);
                if (result.success) {
                    const rewardText = this.add.text(0, 120, 
                        `获得: ${result.rewards.exp} 修为\n${result.rewards.items.map(i => i.name).join(', ')}`, {
                        fontSize: '16px',
                        fill: '#50e3c2',
                        fontFamily: 'Microsoft YaHei',
                        align: 'center'
                    }).setOrigin(0.5);
                    panel.add(rewardText);
                    checkInBtn.setText('今日已签到').setStyle({ backgroundColor: '#666' });
                    checkInBtn.disableInteractive();
                }
            });
        }
        
        panel.add([bg, title, closeBtn, infoText, checkInBtn]);
        panel.setDepth(200);
    }
    
    /**
     * 显示技能系统
     */
    showSkills() {
        const { width, height } = this.cameras.main;
        const skillSystem = window.gameData.skillSystem;
        const skills = skillSystem.getAvailableSkills();
        
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 700, 600, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0x9013FE);
        
        const title = this.add.text(0, -250, `技能系统 (技能点: ${skillSystem.skillPoints})`, {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(320, -250, '✕', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => panel.destroy());
        
        panel.add([bg, title, closeBtn]);
        
        let yOffset = -180;
        skills.forEach((skill, index) => {
            if (index >= 5) return;
            
            const skillText = this.add.text(-300, yOffset, 
                `${skill.name} (Lv.${skill.level}/${skill.maxLevel})`, {
                fontSize: '18px',
                fill: skill.level > 0 ? '#FFD700' : '#fff',
                fontFamily: 'Microsoft YaHei'
            });
            
            const descText = this.add.text(-300, yOffset + 25, skill.description, {
                fontSize: '14px',
                fill: '#aaa',
                fontFamily: 'Microsoft YaHei',
                wordWrap: { width: 400 }
            });
            
            const unlockBtn = this.add.text(200, yOffset + 10, 
                skill.canUnlock ? `解锁 (${skill.cost}点)` : '无法解锁', {
                fontSize: '16px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: skill.canUnlock ? '#9013FE' : '#666',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: skill.canUnlock });
            
            if (skill.canUnlock) {
                unlockBtn.on('pointerdown', () => {
                    const result = skillSystem.unlockSkill(skill.id, window.gameData.player);
                    if (result.success) {
                        panel.destroy();
                        this.showSkills(); // 刷新界面
                    }
                });
            }
            
            panel.add([skillText, descText, unlockBtn]);
            yOffset += 100;
        });
        
        panel.setDepth(200);
    }
    
    /**
     * 显示商店
     */
    showShop() {
        const { width, height } = this.cameras.main;
        const shopSystem = window.gameData.shopSystem;
        const items = shopSystem.getShopItems();
        const player = window.gameData.player;
        
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 700, 600, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xB8E986);
        
        const title = this.add.text(0, -250, '商店', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(320, -250, '✕', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => panel.destroy());
        
        panel.add([bg, title, closeBtn]);
        
        let yOffset = -180;
        items.slice(0, 6).forEach((item, index) => {
            const priceItem = player.collectibles.find(c => c.id === item.price.type);
            const hasEnough = priceItem && (priceItem.quantity || 1) >= item.price.amount;
            
            const itemText = this.add.text(-300, yOffset, item.name, {
                fontSize: '18px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei'
            });
            
            const priceText = this.add.text(-300, yOffset + 25, 
                `价格: ${item.price.amount} ${item.price.type === 'herb_001' ? '青灵草' : '基础矿石'}`, {
                fontSize: '14px',
                fill: hasEnough ? '#50e3c2' : '#ff6b6b',
                fontFamily: 'Microsoft YaHei'
            });
            
            const buyBtn = this.add.text(200, yOffset + 10, '购买', {
                fontSize: '16px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: hasEnough ? '#B8E986' : '#666',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: hasEnough });
            
            if (hasEnough) {
                buyBtn.on('pointerdown', () => {
                    const result = shopSystem.buyItem(item.id, player);
                    if (result.success) {
                        panel.destroy();
                        this.showShop(); // 刷新界面
                    }
                });
            }
            
            panel.add([itemText, priceText, buyBtn]);
            yOffset += 80;
        });
        
        panel.setDepth(200);
    }
    
    /**
     * 显示限时挑战
     */
    showChallenge() {
        const { width, height } = this.cameras.main;
        const challengeSystem = window.gameData.challengeSystem;
        
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFF6B6B);
        
        const title = this.add.text(0, -150, '限时挑战', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(220, -150, '✕', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => panel.destroy());
        
        if (challengeSystem.activeChallenge) {
            const remaining = challengeSystem.getRemainingTime();
            const infoText = this.add.text(0, -50, 
                `进行中...\n剩余时间: ${remaining} 秒\n已解答: ${challengeSystem.activeChallenge.problemsSolved} 题`, {
                fontSize: '18px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                align: 'center'
            }).setOrigin(0.5);
            
            const completeBtn = this.add.text(0, 100, '完成挑战', {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: '#FF6B6B',
                padding: { x: 30, y: 15 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            completeBtn.on('pointerdown', () => {
                const result = challengeSystem.completeChallenge(window.gameData.player);
                if (result.success) {
                    panel.destroy();
                    this.showChallengeResult(result);
                }
            });
            
            panel.add([bg, title, closeBtn, infoText, completeBtn]);
        } else {
            const descText = this.add.text(0, -50, '限时60秒，尽可能多地解答题目！\n准确率越高，奖励越丰富！', {
                fontSize: '18px',
                fill: '#aaa',
                fontFamily: 'Microsoft YaHei',
                align: 'center'
            }).setOrigin(0.5);
            
            const startBtn = this.add.text(0, 100, '开始挑战', {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: '#FF6B6B',
                padding: { x: 30, y: 15 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            startBtn.on('pointerdown', () => {
                challengeSystem.startChallenge(1, 60);
                panel.destroy();
                window.gameData.isChallengeMode = true;
                this.scene.launch('MathChallengeScene');
            });
            
            panel.add([bg, title, closeBtn, descText, startBtn]);
        }
        
        panel.setDepth(200);
    }
    
    /**
     * 显示挑战结果
     */
    showChallengeResult(result) {
        const { width, height } = this.cameras.main;
        
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD93D);
        
        const title = this.add.text(0, -150, '挑战完成！', {
            fontSize: '28px',
            fill: '#FFD93D',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const resultText = this.add.text(0, -50, 
            `解答: ${result.problemsSolved} 题\n准确率: ${result.accuracy}%\n获得修为: ${result.expGained}`, {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            align: 'center'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(0, 150, '确定', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#FF6B6B',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => panel.destroy());
        
        panel.add([bg, title, resultText, closeBtn]);
        panel.setDepth(200);
    }
}

