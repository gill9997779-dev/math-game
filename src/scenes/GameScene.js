// Phaser 从全局对象获取
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
import { CombatPowerSystem } from '../core/CombatPowerSystem.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create(data = {}) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 检测移动设备（在类级别定义）
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 处理从LoginScene传来的数据
        if (data.loadData) {
            // 加载存档数据
            this.loadGameData(data.loadData);
        } else if (data.isNewGame) {
            // 新游戏，创建新玩家
            window.gameData.player = new Player();
        } else if (data.preserveData || data.zoneSwitch) {
            // 地图切换或需要保留数据的情况
            // 如果 window.gameData.player 不存在，尝试从 localStorage 恢复
            if (!window.gameData.player) {
                try {
                    const username = window.gameData.username || window.gameData.playerId || 'default_player';
                    const localKey = `game_save_${username}`;
                    const localData = localStorage.getItem(localKey);
                    if (localData) {
                        const saveData = JSON.parse(localData);
                        if (saveData.playerData) {
                            window.gameData.player = Player.fromJSON(saveData.playerData);
                            Logger.info('从本地存储恢复玩家数据（地图切换）');
                        }
                    }
                } catch (e) {
                    Logger.warn('从本地存储恢复玩家数据失败:', e);
                }
            }
            // 如果还是没有，创建新玩家（不应该发生）
            if (!window.gameData.player) {
                Logger.warn('玩家数据不存在，创建新玩家（这不应该发生）');
                window.gameData.player = new Player();
            }
        } else {
            // 场景重启但没有传递数据的情况（可能是其他原因重启）
            // 尝试从 localStorage 恢复数据
            if (!window.gameData.player) {
                try {
                    const username = window.gameData.username || window.gameData.playerId || 'default_player';
                    const localKey = `game_save_${username}`;
                    const localData = localStorage.getItem(localKey);
                    if (localData) {
                        const saveData = JSON.parse(localData);
                        if (saveData.playerData) {
                            window.gameData.player = Player.fromJSON(saveData.playerData);
                            Logger.info('从本地存储恢复玩家数据（场景重启）');
                        }
                    }
                } catch (e) {
                    Logger.warn('从本地存储恢复玩家数据失败:', e);
                }
            }
        }
        
        // 確保 Player 存在（如果场景重启但玩家数据已存在，保留现有数据）
        if (!window.gameData.player) {
            window.gameData.player = new Player();
        }
        const player = window.gameData.player;
        
        // 确保玩家数据已保存到 window.gameData（防止场景重启时丢失）
        window.gameData.player = player;
        
        // 调试：输出玩家数据
        Logger.debug('GameScene 创建 - 玩家数据:', {
            realm: player.realm,
            exp: player.exp,
            currentZone: player.currentZone
        });
        
        // 初始化区域管理器
        if (!window.gameData.zoneManager) {
            window.gameData.zoneManager = new ZoneManager();
        }
        const zoneManager = window.gameData.zoneManager;
        
        // 初始化任务系统（只在第一次创建时初始化任务，避免重置已有进度）
        if (!window.gameData.taskSystem) {
            window.gameData.taskSystem = new TaskSystem();
            window.gameData.taskSystem.initializeTasks(player);
        } else {
            // 如果任务系统已存在，确保玩家数据已更新到任务系统
            // 但不重新初始化任务（避免重置进度）
            if (window.gameData.taskSystem.tasks.length === 0) {
                // 只有在任务列表为空时才初始化（可能是新加载的存档）
                window.gameData.taskSystem.initializeTasks(player);
            }
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
        
        // 初始化战斗力系统
        if (!window.gameData.combatPowerSystem) {
            window.gameData.combatPowerSystem = new CombatPowerSystem();
        }
        
        // 获取当前区域（必须先获取，因为后面会使用）
        // 如果是从地图切换来的，使用目标地图
        let targetZoneName = data.targetZone || player.currentZone;
        const currentZone = zoneManager.getZone(targetZoneName) || zoneManager.getZone('青石村');
        
        // 验证是否可以进入该地图
        if (!currentZone.canEnter(player)) {
            Logger.warn(`无法进入 ${currentZone.name}，恢复到默认地图`);
            // 如果无法进入，恢复到默认地图
            const defaultZone = zoneManager.getZone('青石村');
            player.currentZone = defaultZone.name;
        } else {
            player.currentZone = currentZone.name;
        }
        
        Logger.info(`当前地图: ${player.currentZone}`);
        
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
        
        // 随机资源系统在 createRandomResources 中创建，不需要单独调用
        
        // 设置背景（优先使用地图专属背景图片，其次使用通用背景，最后使用渐变背景）
        const zoneBackgroundKey = `${currentZone.name}_background`;
        let backgroundKey = null;
        
        // 优先检查地图专属背景
        if (this.textures.exists(zoneBackgroundKey)) {
            backgroundKey = zoneBackgroundKey;
            Logger.debug(`✓ GameScene - 使用地图专属背景: ${zoneBackgroundKey}`);
        } else if (this.textures.exists('game_background')) {
            // 如果没有地图专属背景，使用通用背景
            backgroundKey = 'game_background';
            Logger.debug('✓ GameScene - 使用通用背景图片');
        }
        
        if (backgroundKey) {
            // 使用背景图片，不添加遮罩，让背景图片完全显示
            const bg = this.add.image(width / 2, height / 2, backgroundKey);
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            bg.setScale(Math.max(scaleX, scaleY));
            bg.setDepth(0);
            Logger.debug(`✓ GameScene 背景图片已添加 (${backgroundKey})，尺寸:`, bg.width, bg.height, '缩放:', bg.scaleX, bg.scaleY);
        } else {
            // 使用渐变背景 + 区域颜色遮罩
            Logger.warn(`⚠ GameScene - 地图背景图片不存在 (${zoneBackgroundKey})，使用渐变背景`);
            this.createGradientBackground();
            // 添加区域颜色遮罩
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, currentZone.background, 0.5);
            overlay.setDepth(1);
        }
        
        // 显示区域名称（放在返回主页按钮旁边）
        this.zoneNameText = this.add.text(200, 30, currentZone.name, {
            fontSize: '22px',
            fill: '#E8D5B7',  // 古風米色，与返回按钮保持一致
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: 'rgba(26,26,26,0.8)',
            padding: { x: 15, y: 10 },
            stroke: '#FFD700',  // 金色描邊
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4
            }
        }).setOrigin(0, 0.5).setDepth(100);
        this.zoneNameText.setInteractive({ useHandCursor: true });
        this.zoneNameText.on('pointerdown', () => {
            // 跳转到冒险场景（包含地图选择功能）
            this.scene.pause();
            this.scene.launch('AdventureScene');
        });
        
        // 创建玩家角色（简单表示）
        this.playerSprite = this.add.circle(player.x || width / 2, player.y || height / 2, 20, 0x4a90e2)
            .setInteractive({ useHandCursor: true });
        
        // 创建数学之灵（保留，不修改）
        this.mathSpirits = [];
        currentZone.mathSpirits.forEach(spirit => {
            // 创建数学之灵容器
            const spiritContainer = this.add.container(spirit.x, spirit.y);
            
            // 创建外圈光晕效果（多层渐变）
            const outerGlow = this.add.circle(0, 0, 35, 0xFFD700, 0.3);
            const middleGlow = this.add.circle(0, 0, 28, 0xFFA500, 0.5);
            
            // 创建主图标（使用星形，更美观）
            const spiritIcon = this.add.star(0, 0, 5, 20, 30, 0xFFD700, 1.0);
            spiritIcon.setStrokeStyle(3, 0xFFA500, 1.0);
            
            // 创建内圈（增加层次感）
            const innerCircle = this.add.circle(0, 0, 18, 0xFFFFFF, 0.2);
            
            // 添加脉冲动画效果
            this.tweens.add({
                targets: [outerGlow, middleGlow],
                scale: { from: 1.0, to: 1.2 },
                alpha: { from: 0.3, to: 0.6 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // 添加旋转动画（缓慢旋转）
            this.tweens.add({
                targets: spiritIcon,
                angle: 360,
                duration: 5000,
                repeat: -1,
                ease: 'Linear'
            });
            
            // 将所有元素添加到容器
            spiritContainer.add([outerGlow, middleGlow, spiritIcon, innerCircle]);
            spiritContainer.setInteractive(new Phaser.Geom.Circle(0, 0, 35), Phaser.Geom.Circle.Contains);
            spiritContainer.setData('spirit', spirit);
            spiritContainer.setDepth(50);
            
            // 添加悬停效果
            spiritContainer.on('pointerover', () => {
                spiritContainer.setScale(1.15);
                // 星形图形不支持 setTint，使用 setFillStyle 改变颜色
                spiritIcon.setFillStyle(0xFFFFFF, 1.0);
                spiritIcon.setStrokeStyle(3, 0xFFD700, 1.0);
            });
            spiritContainer.on('pointerout', () => {
                spiritContainer.setScale(1.0);
                // 恢复原始颜色
                spiritIcon.setFillStyle(0xFFD700, 1.0);
                spiritIcon.setStrokeStyle(3, 0xFFA500, 1.0);
            });
            spiritContainer.on('pointerdown', () => {
                this.startMathChallenge(spirit);
            });
            
            // 创建精美的标签（使用更好的样式）
            const labelBg = this.add.rectangle(0, -55, 0, 0, 0x000000, 0.85);
            labelBg.setStrokeStyle(2, 0xFFD700, 1.0);
            
            const labelText = this.add.text(0, -55, spirit.name, {
                fontSize: '18px',
                fill: '#FFD700',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    stroke: true,
                    fill: true
                }
            }).setOrigin(0.5);
            
            // 根据文字宽度调整背景大小
            const textWidth = labelText.width;
            labelBg.setSize(textWidth + 20, 32);
            
            // 添加标签到容器
            spiritContainer.add([labelBg, labelText]);
            
            // 添加难度指示器（小星星）
            if (spirit.difficulty) {
                const difficultyStars = [];
                for (let i = 0; i < spirit.difficulty; i++) {
                    const star = this.add.star(-30 + i * 15, 40, 3, 8, 12, 0xFFD700, 1.0);
                    star.setStrokeStyle(1, 0xFFA500, 1.0);
                    spiritContainer.add(star);
                    difficultyStars.push(star);
                }
            }
            
            this.mathSpirits.push(spiritContainer);
        });
        
        // 初始化随机资源系统
        this.resources = [];
        this.treasures = [];
        this.resourceRefreshTimer = null;
        this.treasureRefreshTimer = null;
        
        // 只在资源秘境中创建和刷新资源、宝箱
        if (currentZone.name === '资源秘境') {
            // 创建随机资源（草和矿石）
            this.createRandomResources(currentZone);
            
            // 创建随机宝箱
            this.createRandomTreasures(currentZone);
            
            // 设置资源刷新定时器（每90秒刷新一个资源，刷新更慢）
            this.resourceRefreshTimer = this.time.addEvent({
                delay: 90000,  // 从30秒改为90秒
                callback: () => {
                    this.refreshRandomResources(currentZone);
                },
                callbackScope: this,
                loop: true
            });
            
            // 设置宝箱刷新定时器（每60秒刷新一次）
            this.treasureRefreshTimer = this.time.addEvent({
                delay: 60000,
                callback: () => {
                    this.refreshRandomTreasures(currentZone);
                },
                callbackScope: this,
                loop: true
            });
        }
        
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
            Logger.debug('返回主頁按鈕被點擊');
            // 確認對話框
            if (confirm('確定要返回主菜單嗎？未保存的進度可能會丟失。')) {
                this.scene.start('MainMenuScene');
            }
        });
        
        // 保存按钮（移动到更靠边的位置）
        this.add.text(width - 80, 30, '保存', {
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
        this.add.text(width - 80, 80, '背包', {
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
        this.add.text(width - 80, 130, '炼丹炉', {
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
        this.add.text(width - 80, 180, '任务', {
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
        this.add.text(width - 80, 230, '成就', {
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
        this.add.text(width - 80, 280, '签到', {
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
        this.comboText = this.add.text(width - 80, 315, '', {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // 技能按钮（调整位置，避免与连击数重叠）
        this.add.text(width - 80, 360, '技能', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#9013FE',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.launch('SkillScene');
        });
        
        // 商店按钮
        this.add.text(width - 80, 410, '商店', {
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
        
        // 冒险按钮（整合所有副本）
        this.add.text(width - 80, 460, '冒险', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#FF6B6B',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('AdventureScene');
        });
        
        // 奇遇按钮（主动触发随机事件）
        this.add.text(width - 80, 510, '奇遇', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#ff6b6b',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.startAdventure();
        });
        
        // 功法按钮（打开攻略系统）
        this.add.text(width - 80, 560, '功法', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#9013FE',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.launch('GuideScene');
        });
        
        // 概念探索按钮（数学概念学习系统）
        this.add.text(width - 80, 610, '概念', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#4A90E2',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.openConceptExploration();
        });
        
        // 艺术工作室按钮（数学艺术创作系统）
        this.add.text(width - 80, 660, '艺术', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#FF6B6B',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.openMathArtStudio();
        });
        
        // 修炼按钮（核心玩法入口）
        this.add.text(width - 80, 710, '修炼', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#9013FE',
            padding: { x: 15, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.showGameModeSelection();
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
     * 创建随机资源（草和矿石）
     */
    createRandomResources(zone) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const resourceCount = 8 + Math.floor(Math.random() * 5); // 8-12个资源
        
        // 清除现有资源
        this.resources.forEach(resource => resource.destroy());
        this.resources = [];
        
        // 避免与数学之灵位置重叠
        const occupiedPositions = zone.mathSpirits.map(s => ({ x: s.x, y: s.y }));
        
        for (let i = 0; i < resourceCount; i++) {
            let x, y;
            let attempts = 0;
            
            // 随机生成位置，确保不与数学之灵重叠
            do {
                x = 100 + Math.random() * (width - 200);
                y = 100 + Math.random() * (height - 200);
                attempts++;
            } while (
                occupiedPositions.some(pos => Math.abs(pos.x - x) < 80 && Math.abs(pos.y - y) < 80) &&
                attempts < 50
            );
            
            // 随机选择资源类型
            const resourceType = Math.random() > 0.5 ? 'herb' : 'ore';
            const resourceId = `resource_${Date.now()}_${i}`;
            const resourceName = resourceType === 'herb' ? '青灵草' : '基础矿石';
            
            const resource = {
                id: resourceId,
                x: x,
                y: y,
                type: resourceType,
                name: resourceName
            };
            
            // 创建资源点（使用更好的视觉效果）
            let resourceSprite;
            if (resourceType === 'herb') {
                // 草：使用绿色圆形，带叶子效果
                resourceSprite = this.add.circle(x, y, 15, 0x50e3c2, 0.9)
                    .setStrokeStyle(2, 0x4a9e8f, 1);
                // 添加叶子装饰
                this.add.circle(x - 8, y - 5, 8, 0x4a9e8f, 0.6);
                this.add.circle(x + 8, y - 5, 8, 0x4a9e8f, 0.6);
            } else {
                // 矿石：使用金色菱形
                resourceSprite = this.add.star(x, y, 4, 12, 20, 0xb8e986, 0.9)
                    .setStrokeStyle(2, 0x9dd876, 1);
            }
            
            resourceSprite
                .setInteractive({ useHandCursor: true })
                .setData('resource', resource)
                .setDepth(1)
                .on('pointerdown', () => {
                    this.collectResource(resource);
                });
            
            // 添加轻微浮动动画
            this.tweens.add({
                targets: resourceSprite,
                y: { from: y - 3, to: y + 3 },
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.resources.push(resourceSprite);
        }
    }
    
    /**
     * 创建单个随机资源
     */
    createSingleRandomResource(zone) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 避免与数学之灵位置重叠
        const occupiedPositions = [
            ...zone.mathSpirits.map(s => ({ x: s.x, y: s.y })),
            ...this.resources.filter(r => r.active).map(r => ({ x: r.x, y: r.y }))
        ];
        
        let x, y;
        let attempts = 0;
        
        // 随机生成位置，确保不与数学之灵和现有资源重叠
        do {
            x = 100 + Math.random() * (width - 200);
            y = 100 + Math.random() * (height - 200);
            attempts++;
        } while (
            occupiedPositions.some(pos => Math.abs(pos.x - x) < 80 && Math.abs(pos.y - y) < 80) &&
            attempts < 50
        );
        
        // 随机选择资源类型
        const resourceType = Math.random() > 0.5 ? 'herb' : 'ore';
        const resourceId = `resource_${Date.now()}_${Math.random()}`;
        const resourceName = resourceType === 'herb' ? '青灵草' : '基础矿石';
        
        const resource = {
            id: resourceId,
            x: x,
            y: y,
            type: resourceType,
            name: resourceName
        };
        
        // 创建资源点（使用更好的视觉效果）
        let resourceSprite;
        const leafDecorations = [];
        
        if (resourceType === 'herb') {
            // 草：使用绿色圆形（去掉叶子装饰，避免留下图块）
            resourceSprite = this.add.circle(x, y, 15, 0x50e3c2, 0.9)
                .setStrokeStyle(2, 0x4a9e8f, 1);
            // 不再添加叶子装饰，避免收集后留下图块
        } else {
            // 矿石：使用金色菱形
            resourceSprite = this.add.star(x, y, 4, 12, 20, 0xb8e986, 0.9)
                .setStrokeStyle(2, 0x9dd876, 1);
        }
        
        // 将叶子装饰保存到资源数据中（虽然现在为空，但保留接口以便将来使用）
        resourceSprite.setData('leafDecorations', leafDecorations);
        
        resourceSprite
            .setInteractive({ useHandCursor: true })
            .setData('resource', resource)
            .setDepth(1)
            .on('pointerdown', () => {
                this.collectResource(resource);
            });
        
        // 添加轻微浮动动画
        this.tweens.add({
            targets: resourceSprite,
            y: { from: y - 3, to: y + 3 },
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.resources.push(resourceSprite);
    }
    
    /**
     * 刷新随机资源（每次只刷新一个）
     */
    refreshRandomResources(zone) {
        // 检查当前资源数量
        const activeResources = this.resources.filter(r => r.active);
        const maxResources = 12; // 最大资源数量
        
        // 如果资源数量少于最大值，创建一个新资源
        if (activeResources.length < maxResources) {
            this.createSingleRandomResource(zone);
        }
    }
    
    /**
     * 创建随机宝箱
     */
    createRandomTreasures(zone) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const treasureCount = 2 + Math.floor(Math.random() * 3); // 2-4个宝箱
        
        // 清除现有宝箱
        this.treasures.forEach(treasure => treasure.destroy());
        this.treasures = [];
        
        // 避免与数学之灵和资源位置重叠
        const occupiedPositions = [
            ...zone.mathSpirits.map(s => ({ x: s.x, y: s.y })),
            ...this.resources.map(r => ({ x: r.x, y: r.y }))
        ];
        
        for (let i = 0; i < treasureCount; i++) {
            let x, y;
            let attempts = 0;
            
            // 随机生成位置
            do {
                x = 100 + Math.random() * (width - 200);
                y = 100 + Math.random() * (height - 200);
                attempts++;
            } while (
                occupiedPositions.some(pos => Math.abs(pos.x - x) < 100 && Math.abs(pos.y - y) < 100) &&
                attempts < 50
            );
            
            // 随机选择稀有度
            const rarityRoll = Math.random();
            let rarity = 'common';
            let color = 0xFFD700; // 金色
            if (rarityRoll > 0.8) {
                rarity = 'epic';
                color = 0xBD10E0; // 紫色
            } else if (rarityRoll > 0.5) {
                rarity = 'rare';
                color = 0x4A90E2; // 蓝色
            }
            
            const treasure = {
                id: `treasure_${Date.now()}_${i}`,
                x: x,
                y: y,
                name: rarity === 'epic' ? '史诗宝箱' : rarity === 'rare' ? '稀有宝箱' : '普通宝箱',
                type: 'chest',
                rarity: rarity,
                rewards: {
                    exp: rarity === 'epic' ? 200 : rarity === 'rare' ? 100 : 30,
                    items: []
                },
                discovered: false
            };
            
            // 创建宝箱（使用更好的视觉效果）
            const treasureSprite = this.add.star(x, y, 5, 18, 35, color, 0.9)
                .setStrokeStyle(3, color, 1)
                .setInteractive({ useHandCursor: true })
                .setData('treasure', treasure)
                .setDepth(2)
                .on('pointerdown', () => {
                    this.openTreasure(treasure);
                });
            
            // 添加闪烁动画
            this.tweens.add({
                targets: treasureSprite,
                alpha: { from: 0.6, to: 1 },
                scale: { from: 0.9, to: 1.1 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // 添加旋转动画（慢速）
            this.tweens.add({
                targets: treasureSprite,
                rotation: Math.PI * 2,
                duration: 10000,
                repeat: -1,
                ease: 'Linear'
            });
            
            this.treasures.push(treasureSprite);
        }
    }
    
    /**
     * 刷新随机宝箱
     */
    refreshRandomTreasures(zone) {
        // 只刷新已打开的宝箱
        const remainingTreasures = this.treasures.filter(t => t.active);
        if (remainingTreasures.length < 2) {
            // 如果剩余宝箱少于2个，创建新的
            this.createRandomTreasures(zone);
        }
    }
    
    /**
     * 打开宝藏
     */
    openTreasure(treasure) {
        const player = window.gameData.player;
        
        // 生成奖励
        const rewards = treasure.rewards;
        player.gainExp(rewards.exp);
        
        // 添加物品到背包
        if (rewards.items && rewards.items.length > 0) {
            rewards.items.forEach(item => {
                player.addCollectible(item);
            });
        } else {
            // 如果没有预设物品，根据稀有度随机生成
            const itemCount = treasure.rarity === 'epic' ? 3 : treasure.rarity === 'rare' ? 2 : 1;
            for (let i = 0; i < itemCount; i++) {
                const itemType = Math.random() > 0.5 ? 'herb' : 'ore';
                const itemId = itemType === 'herb' ? 'herb_001' : 'ore_001';
                const itemName = itemType === 'herb' ? '青灵草' : '基础矿石';
                player.addCollectible({ id: itemId, name: itemName, quantity: 1 });
            }
        }
        
        // 显示奖励
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const itemNames = rewards.items && rewards.items.length > 0 
            ? rewards.items.map(i => i.name).join(', ')
            : '随机材料';
        
        const rewardText = this.add.text(width / 2, height / 2, 
            `打开宝箱！\n获得: ${rewards.exp} 修为\n${itemNames}`, {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#000000',
            padding: { x: 30, y: 20 },
            align: 'center'
        }).setOrigin(0.5).setDepth(200);
        
        // 移除宝藏（带淡出动画）
        const treasureSprite = this.treasures.find(t => t.getData('treasure').id === treasure.id);
        if (treasureSprite) {
            this.tweens.add({
                targets: treasureSprite,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    treasureSprite.destroy();
                    this.treasures = this.treasures.filter(t => t !== treasureSprite);
                }
            });
        }
        
        // 延迟关闭
        this.time.delayedCall(3000, () => {
            rewardText.destroy();
        });
    }
    
    /**
     * 开始奇遇（主动触发随机事件）
     */
    startAdventure() {
        Logger.info('开始奇遇');
        
        const player = window.gameData.player;
        if (!player) {
            Logger.error('玩家数据未初始化');
            return;
        }
        
        const eventSystem = window.gameData.eventSystem;
        if (!eventSystem) {
            Logger.error('事件系统未初始化');
            return;
        }
        
        // 检查冷却时间（至少间隔30秒）
        const now = Date.now();
        if (now - eventSystem.lastEventTime < 30000) {
            const remainingTime = Math.ceil((30000 - (now - eventSystem.lastEventTime)) / 1000);
            // 显示冷却提示（使用简单的文本提示）
            const width = this.cameras.main.width;
        const height = this.cameras.main.height;
            const coolDownText = this.add.text(width / 2, height / 2, `奇遇冷却中，还需等待 ${remainingTime} 秒`, {
                fontSize: '24px',
                fill: '#ffa500',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.9)',
                padding: { x: 20, y: 15 }
            }).setOrigin(0.5).setDepth(300);
            
            this.tweens.add({
                targets: coolDownText,
                alpha: 0,
                duration: 2000,
                onComplete: () => coolDownText.destroy()
            });
            return;
        }
        
        // 从所有可用事件中随机选择一个
        const availableEvents = eventSystem.events.filter(e => {
            return Math.random() <= e.probability;
        });
        
        let selectedEvent;
        if (availableEvents.length === 0) {
            // 如果没有符合概率的事件，从所有事件中随机选择
            const allEvents = eventSystem.events;
            if (allEvents.length === 0) {
                return;
            }
            selectedEvent = allEvents[Math.floor(Math.random() * allEvents.length)];
        } else {
            // 随机选择一个事件
            selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        }
        
        eventSystem.lastEventTime = now;
        this.showAdventureEvent(selectedEvent);
    }
    
    /**
     * 显示奇遇事件
     */
    showAdventureEvent(event) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const player = window.gameData.player;
        
        // 创建对话框背景
        const dialogBg = this.add.rectangle(width / 2, height / 2, 700, 500, 0x000000, 0.95);
        dialogBg.setStrokeStyle(3, 0xff6b6b);
        dialogBg.setDepth(300);
        dialogBg.setInteractive({ useHandCursor: false });
        
        // 标题
        const title = this.add.text(width / 2, height / 2 - 200, `✨ ${event.title} ✨`, {
            fontSize: '32px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(301);
        
        // 事件描述
        const description = this.add.text(width / 2, height / 2 - 80, event.description, {
            fontSize: '20px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5).setDepth(301);
        
        // 显示效果预览
        let effectText = '';
        if (event.effect) {
            if (event.effect.exp) {
                effectText += `修为 ${event.effect.exp > 0 ? '+' : ''}${event.effect.exp}\n`;
            }
            if (event.effect.items) {
                event.effect.items.forEach(item => {
                    const itemName = item.name || item.id;
                    effectText += `${itemName} x${item.quantity}\n`;
                });
            }
            if (event.effect.health) {
                effectText += `生命值 ${event.effect.health > 0 ? '+' : ''}${event.effect.health}\n`;
            }
            if (event.effect.comboBonus) {
                effectText += `连击加成 +${event.effect.comboBonus}\n`;
            }
        }
        
        const effectPreview = this.add.text(width / 2, height / 2 + 50, 
            effectText ? `奖励预览：\n${effectText}` : '获得随机奖励', {
            fontSize: '18px',
            fill: '#50e3c2',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);
        
        // 确认按钮
        const confirmBtn = this.add.text(width / 2, height / 2 + 180, '接受奇遇', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#50e3c2',
            padding: { x: 30, y: 12 },
            stroke: '#FFD700',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(301);
        confirmBtn.setInteractive({ useHandCursor: true });
        
        confirmBtn.on('pointerover', () => {
            confirmBtn.setTint(0xcccccc);
            confirmBtn.setScale(1.05);
        });
        confirmBtn.on('pointerout', () => {
            confirmBtn.clearTint();
            confirmBtn.setScale(1.0);
        });
        confirmBtn.on('pointerdown', () => {
            // 应用事件效果
            const eventSystem = window.gameData.eventSystem;
            if (eventSystem) {
                eventSystem.applyEventEffect(event, player);
            }
            
            // 关闭对话框
            dialogBg.destroy();
            title.destroy();
            description.destroy();
            effectPreview.destroy();
            confirmBtn.destroy();
            
            // 显示获得奖励的提示
            let rewardText = '奇遇完成！';
            if (event.effect) {
                if (event.effect.exp) {
                    rewardText += `\n获得 ${event.effect.exp > 0 ? '+' : ''}${event.effect.exp} 点修为`;
                }
                if (event.effect.items) {
                    event.effect.items.forEach(item => {
                        const itemName = item.name || item.id;
                        rewardText += `\n获得 ${itemName} x${item.quantity}`;
                    });
                }
                if (event.effect.comboBonus) {
                    rewardText += `\n连击加成 +${event.effect.comboBonus}`;
                }
            }
            
            // 显示奖励提示
            const rewardTextObj = this.add.text(width / 2, height / 2, rewardText, {
                fontSize: '24px',
                fill: '#50e3c2',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.9)',
                padding: { x: 20, y: 15 },
                align: 'center'
            }).setOrigin(0.5).setDepth(300);
            
            this.tweens.add({
                targets: rewardTextObj,
                alpha: 0,
                duration: 3000,
                onComplete: () => rewardTextObj.destroy()
            });
        });
    }
    
    /**
     * 检查随机事件（自动触发，保留原有功能）
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const player = window.gameData.player;
        const realmData = player.getCurrentRealmData();
        
        // 玩家信息面板（简化，只显示境界和战斗力）
        const infoPanel = this.add.container(50, height - 100);
        
        // 个人按钮（在境界上方）
        const personalBtn = this.add.text(0, -60, '个人', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 12, y: 8 }
        }).setInteractive({ useHandCursor: true });
        
        personalBtn.on('pointerover', () => {
            personalBtn.setTint(0xcccccc);
            personalBtn.setScale(1.05);
        });
        personalBtn.on('pointerout', () => {
            personalBtn.clearTint();
            personalBtn.setScale(1.0);
        });
        personalBtn.on('pointerdown', () => {
            this.showPersonalInfo();
        });
        
        // 境界显示
        this.realmText = this.add.text(0, 0, `境界: ${player.realm} ${player.realmLevel}层`, {
            fontSize: '20px',
            fill: realmData.color || '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        });
        
        // 战斗力显示（整合修为和准确率）
        if (!window.gameData.combatPowerSystem) {
            window.gameData.combatPowerSystem = new CombatPowerSystem();
        }
        const combatPowerSystem = window.gameData.combatPowerSystem;
        const combatPower = combatPowerSystem.calculateCombatPower(player);
        const powerLevel = combatPowerSystem.getPowerLevel(combatPower);
        
        this.powerText = this.add.text(0, 50, `战斗力: ${combatPower} (${powerLevel.name})`, {
            fontSize: '18px',
            fill: powerLevel.color,
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        });
        
        infoPanel.add([personalBtn, this.realmText, this.powerText]);
    }
    
    update(time, delta) {
        // 检查是否需要显示词条选择场景（境界突破时）
        if (window.gameData.shouldShowPerkSelection && window.gameData.pendingPerkSelectionPlayer) {
            window.gameData.shouldShowPerkSelection = false;
            const player = window.gameData.pendingPerkSelectionPlayer;
            window.gameData.pendingPerkSelectionPlayer = null;
            
            // 暂停当前场景，启动词条选择场景
            this.scene.pause();
            this.scene.launch('PerkSelectionScene', { player: player });
            return; // 暂停后不执行后续逻辑
        }
        
        const player = window.gameData.player;
        if (!player) return;
        
        const speed = 3;
        
        // 移动控制
        if (this.cursors && this.cursors.left.isDown || this.wasd && this.wasd.A.isDown) {
            this.playerSprite.x -= speed;
            player.x = this.playerSprite.x;
        }
        if (this.cursors && this.cursors.right.isDown || this.wasd && this.wasd.D.isDown) {
            this.playerSprite.x += speed;
            player.x = this.playerSprite.x;
        }
        if (this.cursors && this.cursors.up.isDown || this.wasd && this.wasd.W.isDown) {
            this.playerSprite.y -= speed;
            player.y = this.playerSprite.y;
        }
        if (this.cursors && this.cursors.down.isDown || this.wasd && this.wasd.S.isDown) {
            this.playerSprite.y += speed;
            player.y = this.playerSprite.y;
        }
        
        // UI更新节流：移动端每1000ms更新一次，桌面端每500ms更新一次
        const updateInterval = this.isMobile ? 1000 : 500;
        if (!this.lastUIUpdate) {
            this.lastUIUpdate = 0;
        }
        if (time - this.lastUIUpdate > updateInterval) {
            this.lastUIUpdate = time;
            
            // 更新UI
            if (this.realmText) {
                const realmData = player.getCurrentRealmData();
                this.realmText.setText(`境界: ${player.realm} ${player.realmLevel}层`)
                    .setColor(realmData.color || '#fff');
                
                // 更新战斗力（缓存计算结果，避免重复计算）
                if (this.powerText && window.gameData.combatPowerSystem) {
                    if (!this.cachedCombatPower || this.cachedCombatPower.time !== time) {
                        this.cachedCombatPower = {
                            power: window.gameData.combatPowerSystem.calculateCombatPower(player),
                            time: time
                        };
                    }
                    const powerLevel = window.gameData.combatPowerSystem.getPowerLevel(this.cachedCombatPower.power);
                    this.powerText.setText(`战斗力: ${this.cachedCombatPower.power} (${powerLevel.name})`)
                        .setColor(powerLevel.color);
                }
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
    }
    
    /**
     * 显示个人信息面板
     */
    showPersonalInfo() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const player = window.gameData.player;
        
        // 如果已经有面板，先销毁
        if (this.personalInfoPanel) {
            this.personalInfoPanel.destroy();
            this.personalInfoPanel = null;
        }
        
        // 创建面板容器
        const panel = this.add.container(width / 2, height / 2);
        panel.setDepth(500);
        this.personalInfoPanel = panel;
        
        // 背景
        const bg = this.add.rectangle(0, 0, 700, 600, 0x000000, 0.95);
        bg.setStrokeStyle(4, 0x667eea);
        panel.add(bg);
        
        // 标题
        const title = this.add.text(0, -270, '个人信息', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panel.add(title);
        
        // 关闭按钮
        const closeBtn = this.add.text(320, -270, '✕', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setTint(0xff6b6b));
        closeBtn.on('pointerout', () => closeBtn.clearTint());
        closeBtn.on('pointerdown', () => {
            if (this.personalInfoPanel) {
                this.personalInfoPanel.destroy();
                this.personalInfoPanel = null;
            }
        });
        panel.add(closeBtn);
        
        // 获取战斗力系统
        if (!window.gameData.combatPowerSystem) {
            window.gameData.combatPowerSystem = new CombatPowerSystem();
        }
        const combatPowerSystem = window.gameData.combatPowerSystem;
        const combatPower = combatPowerSystem.calculateCombatPower(player);
        const powerLevel = combatPowerSystem.getPowerLevel(combatPower);
        const realmData = player.getCurrentRealmData();
        const accuracy = player.getAccuracy();
        
        // 计算战斗力详细分解
        let basePower = combatPowerSystem.basePower;
        let realmPower = realmData ? realmData.level * 50 : 0;
        let expPower = Math.floor(player.exp / 10);
        let accuracyPower = Math.floor(accuracy / 2);
        let comboPower = Math.floor(player.maxCombo / 5);
        let perkPower = 0;
        if (player.hasPerk('BODY_REFINEMENT')) perkPower += 30;
        if (player.hasPerk('SPIRIT_BOOST')) perkPower += 25;
        if (player.hasPerk('EXP_BOOST')) perkPower += 20;
        let equipmentPower = 0;
        if (player.equippedItems) {
            if (player.equippedItems.weapon) equipmentPower += player.equippedItems.weapon.power || 0;
            if (player.equippedItems.armor) equipmentPower += player.equippedItems.armor.defense || 0;
        }
        
        // 信息内容
        const infoLines = [
            `境界: ${player.realm} ${player.realmLevel}层`,
            `战斗力: ${combatPower} (${powerLevel.name})`,
            `修为: ${player.exp} / ${player.expToNext > 999999 ? '∞' : player.expToNext}`,
            `准确率: ${accuracy}%`,
            `总答题数: ${player.totalProblemsSolved}`,
            `正确答题数: ${player.correctAnswers}`,
            `最大连击: ${player.maxCombo}`,
            '',
            '战斗力详细分解:',
            `  基础战斗力: ${basePower}`,
            `  境界加成: +${realmPower}`,
            `  修为加成: +${expPower}`,
            `  准确率加成: +${accuracyPower}`,
            `  连击加成: +${comboPower}`,
            perkPower > 0 ? `  词条加成: +${perkPower}` : '',
            equipmentPower > 0 ? `  装备加成: +${equipmentPower}` : ''
        ].filter(line => line !== '');
        
        // 显示信息
        let yOffset = -200;
        infoLines.forEach((line, index) => {
            const isTitle = line.includes('战斗力详细分解');
            const isDetail = line.startsWith('  ');
            const color = isTitle ? '#50e3c2' : isDetail ? '#ddd' : '#fff';
            const fontSize = isTitle ? '20px' : isDetail ? '16px' : '18px';
            
            const text = this.add.text(0, yOffset, line, {
                fontSize: fontSize,
                fill: color,
                fontFamily: 'Microsoft YaHei',
                align: 'left'
            }).setOrigin(0, 0.5);
            panel.add(text);
            
            yOffset += isTitle ? 30 : isDetail ? 25 : 28;
        });
        
        // ESC键关闭
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on('down', () => {
            if (this.personalInfoPanel) {
                this.personalInfoPanel.destroy();
                this.personalInfoPanel = null;
                escKey.destroy();
            }
        });
    }
    
    /**
     * 打开概念探索界面
     */
    openConceptExploration() {
        const player = window.gameData.player;
        
        // 创建概念选择面板
        this.createConceptSelectionPanel(player);
    }
    
    /**
     * 打开数学艺术工作室
     */
    openMathArtStudio() {
        Logger.info('打开数学艺术工作室');
        this.scene.start('MathArtStudioScene');
    }
    
    /**
     * 打开核心玩法场景
     */
    openCoreGameplay(mode = 'adventure') {
        Logger.info('打开核心玩法场景 - 模式:', mode);
        this.scene.start('CoreGameplayScene', { 
            mode: mode, 
            difficulty: window.gameData.player.realmLevel || 1 
        });
    }
    
    /**
     * 显示游戏模式选择面板
     */
    showGameModeSelection() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 如果已有面板，先销毁
        if (this.gameModePanel) {
            this.gameModePanel.destroy();
            this.gameModePanel = null;
        }
        
        // 创建面板
        const panel = this.add.container(width / 2, height / 2);
        panel.setDepth(500);
        this.gameModePanel = panel;
        
        // 背景
        const bg = this.add.rectangle(0, 0, 500, 400, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(3, 0x9013FE);
        panel.add(bg);
        
        // 标题
        const title = this.add.text(0, -170, '🧘 选择修炼模式', {
            fontSize: '28px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        panel.add(title);
        
        // 关闭按钮
        const closeBtn = this.add.text(220, -170, '✕', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setTint(0xff6b6b));
        closeBtn.on('pointerout', () => closeBtn.clearTint());
        closeBtn.on('pointerdown', () => {
            panel.destroy();
            this.gameModePanel = null;
        });
        panel.add(closeBtn);
        
        // 模式按钮
        const modes = [
            { id: 'adventure', icon: '🗡️', name: '冒险模式', desc: '探索数学世界，逐步提升' },
            { id: 'challenge', icon: '⏱️', name: '限时挑战', desc: '60秒内尽可能多答题' },
            { id: 'endless', icon: '♾️', name: '无尽模式', desc: '挑战你的极限' },
            { id: 'puzzle', icon: '🧩', name: '解谜模式', desc: '逻辑推理和图案规律' }
        ];
        
        modes.forEach((mode, index) => {
            const y = -80 + index * 70;
            
            const modeBg = this.add.rectangle(0, y, 420, 55, 0x333333, 0.9);
            modeBg.setStrokeStyle(2, 0x555555);
            modeBg.setInteractive({ useHandCursor: true });
            
            const modeIcon = this.add.text(-180, y, mode.icon, {
                fontSize: '28px'
            }).setOrigin(0.5);
            
            const modeName = this.add.text(-100, y - 8, mode.name, {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);
            
            const modeDesc = this.add.text(-100, y + 12, mode.desc, {
                fontSize: '12px',
                fill: '#888888',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0, 0.5);
            
            panel.add([modeBg, modeIcon, modeName, modeDesc]);
            
            // 交互
            modeBg.on('pointerover', () => {
                modeBg.setFillStyle(0x444444, 1);
                modeBg.setStrokeStyle(2, 0x9013FE);
            });
            modeBg.on('pointerout', () => {
                modeBg.setFillStyle(0x333333, 0.9);
                modeBg.setStrokeStyle(2, 0x555555);
            });
            modeBg.on('pointerdown', () => {
                panel.destroy();
                this.gameModePanel = null;
                this.openCoreGameplay(mode.id);
            });
        });
        
        // 入场动画
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * 创建概念选择面板
     */
    createConceptSelectionPanel(player) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 如果已经有面板，先销毁
        if (this.conceptSelectionPanel) {
            this.conceptSelectionPanel.destroy();
            this.conceptSelectionPanel = null;
        }
        
        // 创建面板容器
        const panel = this.add.container(width / 2, height / 2);
        panel.setDepth(500);
        this.conceptSelectionPanel = panel;
        
        // 背景
        const bg = this.add.rectangle(0, 0, 800, 600, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(4, 0x4a90e2);
        panel.add(bg);
        
        // 标题
        const title = this.add.text(0, -270, '🧠 数学概念探索', {
            fontSize: '32px',
            fill: '#4a90e2',
            fontFamily: 'Microsoft YaHei',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panel.add(title);
        
        // 关闭按钮
        const closeBtn = this.add.text(370, -270, '✕', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setTint(0xff6b6b));
        closeBtn.on('pointerout', () => closeBtn.clearTint());
        closeBtn.on('pointerdown', () => {
            if (this.conceptSelectionPanel) {
                this.conceptSelectionPanel.destroy();
                this.conceptSelectionPanel = null;
            }
        });
        panel.add(closeBtn);
        
        // 说明文本
        const description = this.add.text(0, -220, '选择一个数学概念进行深入探索和学习', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        panel.add(description);
        
        // 概念列表
        const concepts = [
            { id: 'peano_axioms', name: '皮亚诺公理', description: '数学的基石，定义自然数系统', category: '算术基础', difficulty: 1 },
            { id: 'irrational_discovery', name: '无理数发现', description: '√2的无理性，数系的扩张', category: '算术基础', difficulty: 2 },
            { id: 'variable_abstraction', name: '变量抽象化', description: '从具体数字到抽象符号的思维跃迁', category: '代数觉醒', difficulty: 3 },
            { id: 'functional_thinking', name: '函数思维', description: '从计算转向关系的抽象思维', category: '代数觉醒', difficulty: 3 },
            { id: 'equation_solving', name: '方程求解', description: '寻找未知数的系统方法', category: '代数觉醒', difficulty: 3 },
            { id: 'euclidean_axioms', name: '欧几里得公理', description: '几何学的逻辑基础', category: '几何洞察', difficulty: 4 },
            { id: 'distance_metrics', name: '距离度量', description: '不同的距离定义，空间的度量', category: '几何洞察', difficulty: 4 },
            { id: 'trigonometric_circle', name: '三角函数圆', description: '单位圆上的三角函数', category: '几何洞察', difficulty: 4 },
            { id: 'epsilon_delta', name: 'ε-δ定义', description: '极限的严格定义，驯服无穷小', category: '极限驯服', difficulty: 5 },
            { id: 'zeno_paradoxes', name: '芝诺悖论', description: '古希腊的无穷悖论，现代极限理论的起点', category: '极限驯服', difficulty: 5 },
            { id: 'continuity_concept', name: '连续性概念', description: '函数的连续性，直觉与严格定义的统一', category: '极限驯服', difficulty: 5 },
            { id: 'derivative_definition', name: '导数定义', description: '瞬时变化率的精确定义', category: '极限驯服', difficulty: 5 },
            { id: 'staircase_paradox', name: '阶梯悖论', description: '收敛类型的微妙差异', category: '悖论解析', difficulty: 6 },
            { id: 'schwarz_lantern', name: '施瓦茨灯笼', description: '三维空间的面积悖论', category: '悖论解析', difficulty: 7 },
            { id: 'real_analysis', name: '实分析基础', description: '实数系统的严格分析', category: '分析精髓', difficulty: 6 },
            { id: 'measure_theory', name: '测度论基础', description: '长度、面积、体积的抽象推广', category: '分析精髓', difficulty: 6 }
        ];
        
        // 创建概念按钮 - 使用滚动布局
        let yOffset = -150;
        const conceptsPerRow = 2;
        const buttonWidth = 320;
        const buttonHeight = 70;
        const rowSpacing = 80;
        
        concepts.forEach((concept, index) => {
            const row = Math.floor(index / conceptsPerRow);
            const col = index % conceptsPerRow;
            
            const xOffset = col === 0 ? -180 : 180;
            const currentY = yOffset + row * rowSpacing;
            
            // 如果超出面板范围，跳过显示（可以后续添加滚动功能）
            if (currentY > 200) return;
            
            const progress = player.getConceptProgress(concept.id);
            const mastered = player.hasConceptMastered(concept.id);
            
            // 根据难度设置颜色
            const difficultyColors = {
                1: 0x4CAF50,  // 绿色 - 简单
                2: 0x8BC34A,  // 浅绿 - 容易
                3: 0xFFC107,  // 黄色 - 中等
                4: 0xFF9800,  // 橙色 - 中上
                5: 0xFF5722,  // 深橙 - 困难
                6: 0xF44336,  // 红色 - 很难
                7: 0x9C27B0   // 紫色 - 极难
            };
            
            const baseColor = mastered ? 0x50e3c2 : (progress > 0 ? difficultyColors[concept.difficulty] : 0x333333);
            
            // 概念按钮背景
            const buttonBg = this.add.rectangle(xOffset, currentY, buttonWidth, buttonHeight, baseColor, 0.9);
            buttonBg.setStrokeStyle(2, mastered ? 0x50e3c2 : 0x666666);
            panel.add(buttonBg);
            
            // 概念名称
            const conceptName = this.add.text(xOffset, currentY - 20, concept.name, {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            panel.add(conceptName);
            
            // 概念类别
            const conceptCategory = this.add.text(xOffset, currentY - 5, `[${concept.category}]`, {
                fontSize: '12px',
                fill: '#cccccc',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
            panel.add(conceptCategory);
            
            // 概念描述
            const conceptDesc = this.add.text(xOffset, currentY + 10, concept.description, {
                fontSize: '11px',
                fill: '#dddddd',
                fontFamily: 'Microsoft YaHei',
                wordWrap: { width: buttonWidth - 20 }
            }).setOrigin(0.5);
            panel.add(conceptDesc);
            
            // 进度和难度显示
            const statusText = mastered ? '✅ 已掌握' : `进度: ${progress}% | 难度: ${'★'.repeat(concept.difficulty)}`;
            const progressText = this.add.text(xOffset, currentY + 25, statusText, {
                fontSize: '12px',
                fill: mastered ? '#50e3c2' : '#f5a623',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
            panel.add(progressText);
            
            // 交互区域
            const interactiveArea = this.add.rectangle(xOffset, currentY, buttonWidth, buttonHeight, 0x000000, 0);
            interactiveArea.setInteractive({ useHandCursor: true });
            panel.add(interactiveArea);
            
            interactiveArea.on('pointerover', () => {
                buttonBg.setStrokeStyle(3, 0x4a90e2);
                buttonBg.setAlpha(1);
            });
            
            interactiveArea.on('pointerout', () => {
                buttonBg.setStrokeStyle(2, mastered ? 0x50e3c2 : 0x666666);
                buttonBg.setAlpha(0.9);
            });
            
            interactiveArea.on('pointerdown', () => {
                // 关闭选择面板
                if (this.conceptSelectionPanel) {
                    this.conceptSelectionPanel.destroy();
                    this.conceptSelectionPanel = null;
                }
                
                // 启动概念探索场景
                this.scene.pause();
                this.scene.launch('ConceptExplorationScene', {
                    conceptId: concept.id,
                    player: player
                });
            });
        });
        
        // 添加滚动提示（如果有更多概念）
        const totalRows = Math.ceil(concepts.length / conceptsPerRow);
        const visibleRows = Math.floor((400) / rowSpacing);
        
        if (totalRows > visibleRows) {
            const scrollHint = this.add.text(0, 250, `显示前${visibleRows * conceptsPerRow}个概念，共${concepts.length}个`, {
                fontSize: '14px',
                fill: '#888888',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
            panel.add(scrollHint);
        }
        
        // ESC键关闭
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on('down', () => {
            if (this.conceptSelectionPanel) {
                this.conceptSelectionPanel.destroy();
                this.conceptSelectionPanel = null;
                escKey.destroy();
            }
        });
    }
    
    startMathChallenge(spirit) {
        window.gameData.currentSpirit = spirit;
        
        // 显示答题模式选择面板
        this.showChallengeModePicker(spirit);
    }
    
    /**
     * 显示答题模式选择面板
     */
    showChallengeModePicker(spirit) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 遮罩
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        overlay.setDepth(500);
        overlay.setInteractive();
        
        // 面板容器
        const panel = this.add.container(width/2, height/2);
        panel.setDepth(501);
        
        // 背景
        const bg = this.add.rectangle(0, 0, 600, 450, 0x1a1a2e, 0.98);
        bg.setStrokeStyle(3, 0x667eea);
        panel.add(bg);
        
        // 标题
        const title = this.add.text(0, -180, `⚔️ 挑战 ${spirit.name}`, {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        panel.add(title);
        
        // 模式选项
        const modes = [
            { 
                key: 'interactive', 
                name: '🎯 限时挑战', 
                desc: '60秒内答对尽可能多的题目\n连击加分，错误扣时间',
                color: 0x50E3C2
            },
            { 
                key: 'classic', 
                name: '📜 经典模式', 
                desc: '传统选择题模式\n答对继续，答错重来',
                color: 0x667EEA
            },
            { 
                key: 'combat', 
                name: '⚡ 弹幕战斗', 
                desc: '躲避错误答案，撞击正确答案\n考验反应和数学能力',
                color: 0xFF6B6B
            }
        ];
        
        modes.forEach((mode, index) => {
            const y = -80 + index * 100;
            
            // 模式按钮背景
            const modeBg = this.add.rectangle(0, y, 500, 80, mode.color, 0.3);
            modeBg.setStrokeStyle(2, mode.color);
            modeBg.setInteractive({ useHandCursor: true });
            panel.add(modeBg);
            
            // 模式名称
            const modeName = this.add.text(-220, y - 15, mode.name, {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);
            panel.add(modeName);
            
            // 模式描述
            const modeDesc = this.add.text(-220, y + 15, mode.desc, {
                fontSize: '14px',
                fill: '#B8B8D1',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0, 0.5);
            panel.add(modeDesc);
            
            // 悬停效果
            modeBg.on('pointerover', () => {
                modeBg.setFillStyle(mode.color, 0.5);
                this.tweens.add({
                    targets: modeBg,
                    scaleX: 1.02,
                    duration: 100
                });
            });
            
            modeBg.on('pointerout', () => {
                modeBg.setFillStyle(mode.color, 0.3);
                this.tweens.add({
                    targets: modeBg,
                    scaleX: 1,
                    duration: 100
                });
            });
            
            // 点击事件
            modeBg.on('pointerdown', () => {
                overlay.destroy();
                panel.destroy();
                this.launchChallengeMode(mode.key, spirit);
            });
        });
        
        // 关闭按钮
        const closeBtn = this.add.text(260, -200, '✕', {
            fontSize: '28px',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        panel.add(closeBtn);
        
        closeBtn.on('pointerover', () => closeBtn.setTint(0xFF6B6B));
        closeBtn.on('pointerout', () => closeBtn.clearTint());
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
        });
        
        // 入场动画
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // ESC关闭
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.once('down', () => {
            overlay.destroy();
            panel.destroy();
        });
    }
    
    /**
     * 启动指定的挑战模式
     */
    launchChallengeMode(mode, spirit) {
        window.gameData.currentSpirit = spirit;
        this.scene.pause();
        
        switch (mode) {
            case 'interactive':
                this.scene.launch('InteractiveMathScene');
                break;
            case 'classic':
                this.scene.launch('MathChallengeScene');
                break;
            case 'combat':
                this.scene.launch('MathCombatScene');
                break;
            default:
                this.scene.launch('InteractiveMathScene');
        }
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
        
        // 移除资源点（带淡出动画）
        const resourceSprite = this.resources.find(r => r.getData('resource').id === resource.id);
        if (resourceSprite) {
            // 获取叶子装饰（如果存在）
            const leafDecorations = resourceSprite.getData('leafDecorations') || [];
            
            // 淡出主资源
            this.tweens.add({
                targets: resourceSprite,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => {
                    // 销毁叶子装饰
                    leafDecorations.forEach(leaf => {
                        if (leaf && leaf.active) {
                            leaf.destroy();
                        }
                    });
                    // 销毁主资源
                    resourceSprite.destroy();
                    this.resources = this.resources.filter(r => r !== resourceSprite);
                    // 不再立即刷新，等待定时器刷新
                }
            });
            
            // 同时淡出叶子装饰
            leafDecorations.forEach(leaf => {
                if (leaf && leaf.active) {
                    this.tweens.add({
                        targets: leaf,
                        alpha: 0,
                        scale: 0,
                        duration: 300
                    });
                }
            });
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
            // 收集所有需要保存的系统数据
            const saveData = {
                playerData: player.toJSON(),
                taskSystem: window.gameData.taskSystem ? window.gameData.taskSystem.toJSON() : null,
                achievementSystem: window.gameData.achievementSystem ? window.gameData.achievementSystem.toJSON() : null,
                skillSystem: window.gameData.skillSystem ? window.gameData.skillSystem.toJSON() : null,
                dailyCheckIn: window.gameData.dailyCheckIn ? window.gameData.dailyCheckIn.toJSON() : null,
                challengeSystem: window.gameData.challengeSystem ? window.gameData.challengeSystem.toJSON() : null,
                treasureSystem: window.gameData.treasureSystem ? window.gameData.treasureSystem.toJSON() : null
            };
            
            const playerId = window.gameData.username || window.gameData.playerId || 'default_player';
            const width = this.cameras.main.width;
        const height = this.cameras.main.height;
            
            // 先尝试保存到云端
            let savedToCloud = false;
            let cloudMessage = '';
            
            try {
                const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        playerData: saveData,
                        playerId: playerId
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    savedToCloud = result.savedToCloudflare || false;
                    cloudMessage = result.message || '';
                }
            } catch (cloudError) {
                console.warn('云端保存失败，使用本地存储:', cloudError);
            }
            
            // 无论云端是否成功，都保存到本地存储作为备用
            try {
                const localKey = `game_save_${playerId}`;
                localStorage.setItem(localKey, JSON.stringify(saveData));
                console.log('✓ 数据已保存到本地存储');
            } catch (localError) {
                console.error('本地存储保存失败:', localError);
            }
            
            // 显示保存结果
            let message = '';
            let color = '#50e3c2'; // 绿色
            
            if (savedToCloud) {
                message = '游戏已保存到云端和本地！';
                color = '#50e3c2';
            } else {
                message = '游戏已保存到本地存储\n（云端未配置，数据仅保存在浏览器中）';
                color = '#ffa500'; // 橙色警告
            }
            
            const text = this.add.text(width / 2, height / 2, message, {
                fontSize: '20px',
                fill: color,
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.9)',
                padding: { x: 20, y: 15 },
                align: 'center',
                wordWrap: { width: 500 }
            }).setOrigin(0.5).setDepth(200);
            
            this.tweens.add({
                targets: text,
                alpha: 0,
                duration: savedToCloud ? 2000 : 4000,
                onComplete: () => text.destroy()
            });
            
        } catch (error) {
            console.error('保存失败:', error);
            const width = this.cameras.main.width;
        const height = this.cameras.main.height;
            const errorText = this.add.text(width / 2, height / 2, `保存失败: ${error.message}`, {
                fontSize: '20px',
                fill: '#ff6b6b',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(200);
            
            this.tweens.add({
                targets: errorText,
                alpha: 0,
                duration: 3000,
                onComplete: () => errorText.destroy()
            });
        }
    }
    
    /**
     * 显示每日签到
     */
    showDailyCheckIn() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
     * 显示地图选择器
     */
    showZoneSelector() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const player = window.gameData.player;
        const zoneManager = window.gameData.zoneManager;
        
        // 解锁符合条件的区域
        zoneManager.unlockZonesForRealm(player.realm);
        
        // 获取所有区域
        const allZones = zoneManager.getAllZones();
        
        // 创建地图选择面板
        const panel = this.add.container(width / 2, height / 2);
        const bg = this.add.rectangle(0, 0, 700, 600, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        
        const title = this.add.text(0, -280, '选择地图', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(320, -280, '✕', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
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
                
                zoneButton.on('pointerdown', () => {
                    // 切换地图
                    player.currentZone = zone.name;
                    // 重新加载场景
                    panel.destroy();
                    this.scene.restart();
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
                fontFamily: 'Microsoft YaHei',
                align: 'left'
            }).setOrigin(0, 0.5);
            
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
                fontFamily: 'Microsoft YaHei',
                backgroundColor: isCurrentZone ? 'rgba(255,215,0,0.2)' : (canEnter ? 'rgba(80,227,194,0.2)' : 'rgba(136,136,136,0.2)'),
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            
            panel.add([zoneButton, zoneInfo, statusLabel]);
            yOffset += 80;
        });
        
        // 如果没有可用的地图，显示提示
        if (allZones.filter(z => z.canEnter(player)).length === 0) {
            const noZoneText = this.add.text(0, 0, '暂无可用地图\n请提升境界解锁更多地图', {
                fontSize: '20px',
                fill: '#888',
                fontFamily: 'Microsoft YaHei',
                align: 'center'
            }).setOrigin(0.5);
            panel.add(noZoneText);
        }
    }
    
    /**
     * 显示挑战结果
     */
    showChallengeResult(result) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
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
    
    /**
     * 加载游戏数据
     */
    async loadGameData(saveData) {
        try {
            // 动态导入所有需要的类
            const { Player } = await import('../core/Player.js');
            const { TaskSystem } = await import('../core/TaskSystem.js');
            const { AchievementSystem } = await import('../core/AchievementSystem.js');
            const { SkillSystem } = await import('../core/SkillSystem.js');
            const { DailyCheckInSystem } = await import('../core/DailyCheckInSystem.js');
            const { ChallengeSystem } = await import('../core/ChallengeSystem.js');
            const { TreasureSystem } = await import('../core/TreasureSystem.js');
            
            // 恢复玩家数据
            if (saveData.playerData) {
                window.gameData.player = Player.fromJSON(saveData.playerData);
            } else {
                // 兼容旧格式（只有 playerData）
                window.gameData.player = Player.fromJSON(saveData);
            }
            
            // 恢复系统数据
            if (saveData.taskSystem) {
                window.gameData.taskSystem = TaskSystem.fromJSON(saveData.taskSystem);
            }
            
            if (saveData.achievementSystem) {
                window.gameData.achievementSystem = AchievementSystem.fromJSON(saveData.achievementSystem);
            }
            
            if (saveData.skillSystem) {
                window.gameData.skillSystem = SkillSystem.fromJSON(saveData.skillSystem);
            }
            
            if (saveData.dailyCheckIn) {
                window.gameData.dailyCheckIn = DailyCheckInSystem.fromJSON(saveData.dailyCheckIn);
            }
            
            if (saveData.challengeSystem) {
                window.gameData.challengeSystem = ChallengeSystem.fromJSON(saveData.challengeSystem);
            }
            
            if (saveData.treasureSystem) {
                window.gameData.treasureSystem = TreasureSystem.fromJSON(saveData.treasureSystem);
            }
            
            console.log('✓ 游戏数据加载成功');
        } catch (error) {
            console.error('加载游戏数据失败:', error);
            // 如果加载失败，创建新玩家
            window.gameData.player = new Player();
        }
    }
}

