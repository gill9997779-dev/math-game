// Phaser 从全局对象获取
import { ProblemBank } from '../core/MathProblem.js';
import { Logger } from '../core/Logger.js';

const { Scene } = Phaser;

/**
 * 数学战斗场景 - 弹幕躲避 + 答题
 * 玩家控制角色躲避错误答案和天雷，撞击正确答案
 */
export class MathCombatScene extends Scene {
    constructor() {
        super({ key: 'MathCombatScene' });
    }
    
    create(data) {
        try {
            Logger.info('MathCombatScene 创建中...');
            const { width, height } = this.cameras.main;
            this.width = width;
            this.height = height;
            
            // 获取玩家数据和当前数学之灵
            this.playerData = window.gameData.player;
            if (!this.playerData) {
                Logger.error('玩家数据未初始化');
                this.showErrorAndReturn('玩家数据未初始化');
                return;
            }
            
            this.currentSpirit = window.gameData.currentSpirit || { name: '加法之灵', difficulty: 1 };
            Logger.info('当前数学之灵:', this.currentSpirit);
            
            // 战斗状态
            this.score = 0;
            this.targetScore = 5; // 答对5题算过关
            this.currentProblem = null;
            this.currentSolution = null;
            this.fallingObjects = [];
            this.isGameOver = false;
            this.isVictory = false;
            
            // 创建背景（流动的云层效果）
            this.createBackground();
            
            // 创建玩家（御剑飞行）
            this.createPlayer();
            
            // 创建劫云（显示题目）
            this.createCloud();
            
            // 创建UI
            this.createUI();
            
            // 设置控制
            this.setupControls();
            
            // 初始化掉落物组（物理组）
            this.fallingObjectsGroup = this.physics.add.group();
            this.fallingObjects = [];
            this.fallingContainers = [];
            
            // 启动第一题
            this.startNewProblem();
            
            // 碰撞检测改为手动检测（在 update 中）
            // 因为 Container 和 Text 的物理体可能不兼容，使用手动碰撞检测更可靠
            this.collisionDetected = new Set(); // 用于防止重复碰撞
            
            // 调试：检查物理世界状态
            Logger.debug('物理世界初始化:', {
                player: this.player,
                playerBody: this.player ? this.player.body : null,
                fallingObjectsGroup: this.fallingObjectsGroup,
                groupSize: this.fallingObjectsGroup.getChildren().length
            });
            
            Logger.info('MathCombatScene 创建完成');
        } catch (error) {
            Logger.error('MathCombatScene 创建失败:', error);
            this.showErrorAndReturn('场景初始化失败: ' + error.message);
        }
    }
    
    /**
     * 显示错误并返回
     */
    showErrorAndReturn(message) {
        const { width, height } = this.cameras.main;
        
        // 创建错误提示
        const errorBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        errorBg.setDepth(100);
        
        const errorText = this.add.text(width / 2, height / 2 - 50, message, {
            fontSize: '32px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center',
            wordWrap: { width: width - 100 }
        });
        errorText.setOrigin(0.5);
        errorText.setDepth(101);
        
        const returnBtn = this.add.text(width / 2, height / 2 + 100, '返回 (ESC)', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#666666',
            padding: { x: 30, y: 12 }
        });
        returnBtn.setOrigin(0.5);
        returnBtn.setDepth(101);
        returnBtn.setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerdown', () => {
            this.endCombat(false);
        });
        
        this.input.keyboard.once('keydown-ESC', () => {
            this.endCombat(false);
        });
    }
    
    createBackground() {
        // 创建渐变背景（模拟天空）
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x2d2d44, 0x2d2d44, 1);
        graphics.fillRect(0, 0, this.width, this.height);
        graphics.setDepth(0);
        
        // 创建流动的云层（使用粒子或简单图形，降低透明度，避免被误认为掉落物）
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.circle(
                Phaser.Math.Between(0, this.width),
                Phaser.Math.Between(0, this.height),
                Phaser.Math.Between(30, 60),
                0xffffff,
                0.05  // 降低透明度，更不明显
            );
            cloud.setDepth(1);
            cloud.setAlpha(0.05); // 确保透明度很低
            this.clouds.push(cloud);
        }
    }
    
    createPlayer() {
        // 创建玩家（使用简单的图形，后续可以替换为图片）
        // 先创建一个容器来组合多个图形
        const playerContainer = this.add.container(this.width / 2, this.height - 100);
        
        // 绘制玩家外观（御剑飞行的修仙者）
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x4A90E2); // 蓝色（剑光）
        playerGraphics.fillRect(-25, -25, 50, 50);
        playerGraphics.fillStyle(0xFFD700); // 金色（人物）
        playerGraphics.fillCircle(0, 0, 15);
        
        // 将图形添加到容器
        playerContainer.add(playerGraphics);
        playerContainer.setSize(50, 50);
        
        // 启用物理
        this.physics.world.enable(playerContainer);
        // 设置碰撞区域（确保足够大，容易碰撞）
        playerContainer.body.setSize(100, 100); // 大幅增大碰撞区域（从60改为100）
        playerContainer.body.setOffset(-50, -50); // 居中碰撞区域
        playerContainer.body.setAllowGravity(false);
        playerContainer.setDepth(11); // 玩家图层（在背景和云层之上，在掉落物之下）
        
        // 设置碰撞边界
        playerContainer.body.setCollideWorldBounds(true);
        
        // 确保物理体激活
        if (playerContainer.body) {
            playerContainer.body.enable = true;
        }
        
        this.player = playerContainer;
        
        // 调试：输出玩家位置
        Logger.debug('玩家创建完成:', {
            x: this.player.x,
            y: this.player.y,
            width: this.width,
            height: this.height,
            playerDepth: this.player.depth,
            hasBody: !!this.player.body,
            bodyEnable: this.player.body ? this.player.body.enable : false
        });
        
        // 玩家生命值显示
        this.playerHealth = this.playerData.currentHealth || this.playerData.maxHealth || 100;
    }
    
    createCloud() {
        // 劫云位置（屏幕顶部）
        const cloudY = 80;
        
        // 创建劫云背景
        const cloudBg = this.add.rectangle(this.width / 2, cloudY, 400, 80, 0x333333, 0.8);
        cloudBg.setStrokeStyle(3, 0x9013FE);
        cloudBg.setDepth(5);
        
        // 题目文本
        this.cloudText = this.add.text(this.width / 2, cloudY - 10, '天劫凝聚中...', {
            fontSize: '28px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(6);
        
        // 提示文本
        this.hintText = this.add.text(this.width / 2, cloudY + 25, '撞击正确答案，躲避错误答案和天雷！', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(6);
    }
    
    createUI() {
        // 分数显示
        this.scoreText = this.add.text(20, 20, `答对: ${this.score}/${this.targetScore}`, {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei'
        }).setDepth(10);
        
        // 生命值显示
        this.healthText = this.add.text(20, 60, `生命: ${this.playerHealth}`, {
            fontSize: '24px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei'
        }).setDepth(10);
        
        // 连击显示
        this.comboText = this.add.text(20, 100, `连击: ${this.playerData.combo || 0}`, {
            fontSize: '20px',
            fill: '#50e3c2',
            fontFamily: 'Microsoft YaHei'
        }).setDepth(10);
        
        // 调试按钮仅在开发环境显示
        if (Logger.currentLevel === Logger.levels.DEBUG) {
            const debugBtn = this.add.rectangle(this.width - 150, 30, 120, 40, 0xff6b6b, 0.9);
            debugBtn.setStrokeStyle(2, 0xffffff);
            debugBtn.setInteractive({ useHandCursor: true, pixelPerfect: false });
            debugBtn.setDepth(20);
            
            const debugText = this.add.text(this.width - 150, 30, '测试掉落', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold'
            }).setOrigin(0.5).setDepth(21);
            debugText.setInteractive({ useHandCursor: true, pixelPerfect: false });
            
            const debugHandler = () => {
                Logger.debug('手动触发掉落物生成');
                if (this.spawnFallingAnswer) {
                    this.spawnFallingAnswer();
                } else {
                    Logger.error('spawnFallingAnswer 方法不存在！');
                }
            };
            
            debugBtn.on('pointerdown', debugHandler);
            debugText.on('pointerdown', debugHandler);
            
            debugBtn.on('pointerover', () => {
                debugBtn.setFillStyle(0xff4444, 1.0);
            });
            debugBtn.on('pointerout', () => {
                debugBtn.setFillStyle(0xff6b6b, 0.9);
            });
        }
    }
    
    setupControls() {
        // 初始化触摸控制变量
        this.touchLeft = false;
        this.touchRight = false;
        
        // 键盘控制
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
            
            // ESC键返回
            this.input.keyboard.on('keydown-ESC', () => {
                if (!this.isGameOver && !this.isVictory) {
                    this.endCombat(false);
                }
            });
        } else {
            Logger.warn('键盘输入未初始化');
            this.cursors = null;
            this.wasdKeys = null;
        }
        
        // 移动端触摸控制
        this.setupTouchControls();
        
        Logger.debug('控制设置完成:', {
            hasCursors: !!this.cursors,
            hasWasdKeys: !!this.wasdKeys,
            touchLeft: this.touchLeft,
            touchRight: this.touchRight
        });
    }
    
    setupTouchControls() {
        // 检测是否为移动设备（改进检测逻辑）
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouch = this.sys.game.device && this.sys.game.device.input && this.sys.game.device.input.touch;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 总是创建虚拟按钮（桌面端也可以使用鼠标点击）
        this.createVirtualButtons();
        
        // 如果是移动设备，启用触摸滑动控制
        if (isMobile || hasTouch || isTouchDevice) {
            this.setupTouchSwipe();
        }
    }
    
    createVirtualButtons() {
        const buttonSize = 100; // 增大按钮尺寸（从70改为100）
        const buttonY = this.height - 120;  // 调整位置，避免与UI元素重叠
        const buttonSpacing = 150; // 增大间距（从120改为150）
        
        // 初始化触摸状态
        this.touchLeft = false;
        this.touchRight = false;
        
        Logger.debug('创建虚拟按钮 - 屏幕尺寸:', this.width, this.height, '按钮位置:', buttonSpacing, buttonY);
        
        // 左移按钮（使用矩形，更容易点击）
        const leftButton = this.add.rectangle(buttonSpacing, buttonY, buttonSize, buttonSize, 0x4A90E2, 0.8);
        leftButton.setStrokeStyle(3, 0xffffff);
        leftButton.setInteractive({ useHandCursor: true, pixelPerfect: false });
        leftButton.setDepth(20);
        
        const leftIcon = this.add.text(buttonSpacing, buttonY, '←', {
            fontSize: '60px', // 增大图标字体（从40改为60）
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(21);
        leftIcon.setInteractive({ useHandCursor: true });
        
        // 右移按钮
        const rightButton = this.add.rectangle(this.width - buttonSpacing, buttonY, buttonSize, buttonSize, 0x4A90E2, 0.8);
        rightButton.setStrokeStyle(3, 0xffffff);
        rightButton.setInteractive({ useHandCursor: true, pixelPerfect: false });
        rightButton.setDepth(20);
        
        const rightIcon = this.add.text(this.width - buttonSpacing, buttonY, '→', {
            fontSize: '60px', // 增大图标字体（从40改为60）
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(21);
        rightIcon.setInteractive({ useHandCursor: true });
        
        // 左按钮事件（按钮和图标都响应）
        const leftButtonHandler = () => {
            this.touchLeft = true;
            leftButton.setFillStyle(0x2d5aa0, 0.9);
        };
        
        const leftButtonRelease = () => {
            this.touchLeft = false;
            leftButton.setFillStyle(0x4A90E2, 0.8);
        };
        
        leftButton.on('pointerdown', leftButtonHandler);
        leftButton.on('pointerup', leftButtonRelease);
        leftButton.on('pointerout', leftButtonRelease);
        leftIcon.on('pointerdown', leftButtonHandler);
        leftIcon.on('pointerup', leftButtonRelease);
        leftIcon.on('pointerout', leftButtonRelease);
        
        // 右按钮事件
        const rightButtonHandler = () => {
            this.touchRight = true;
            rightButton.setFillStyle(0x2d5aa0, 0.9);
        };
        
        const rightButtonRelease = () => {
            this.touchRight = false;
            rightButton.setFillStyle(0x4A90E2, 0.8);
        };
        
        rightButton.on('pointerdown', rightButtonHandler);
        rightButton.on('pointerup', rightButtonRelease);
        rightButton.on('pointerout', rightButtonRelease);
        rightIcon.on('pointerdown', rightButtonHandler);
        rightIcon.on('pointerup', rightButtonRelease);
        rightIcon.on('pointerout', rightButtonRelease);
        
        // 存储按钮引用（用于清理）
        this.virtualButtons = [leftButton, rightButton, leftIcon, rightIcon];
    }
    
    setupTouchSwipe() {
        // 触摸滑动控制
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouching = false;
        
        this.input.on('pointerdown', (pointer) => {
            // 排除虚拟按钮区域
            const buttonY = this.height - 80;
            const buttonSpacing = 100;
            const buttonSize = 60;
            
            const isInButtonArea = 
                (pointer.y > buttonY - buttonSize && pointer.y < buttonY + buttonSize) &&
                ((pointer.x > buttonSpacing - buttonSize && pointer.x < buttonSpacing + buttonSize) ||
                 (pointer.x > this.width - buttonSpacing - buttonSize && pointer.x < this.width - buttonSpacing + buttonSize));
            
            if (!isInButtonArea && pointer.y > this.height / 2) {
                // 只在屏幕下半部分响应滑动
                touchStartX = pointer.x;
                touchStartY = pointer.y;
                isTouching = true;
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (isTouching && pointer.isDown) {
                const deltaX = pointer.x - touchStartX;
                const threshold = 10; // 滑动阈值
                
                if (Math.abs(deltaX) > threshold) {
                    if (deltaX > 0) {
                        // 向右滑动
                        this.touchRight = true;
                        this.touchLeft = false;
                    } else {
                        // 向左滑动
                        this.touchLeft = true;
                        this.touchRight = false;
                    }
                }
            }
        });
        
        this.input.on('pointerup', () => {
            isTouching = false;
            this.touchLeft = false;
            this.touchRight = false;
        });
    }
    
    update() {
        if (this.isGameOver || this.isVictory) return;
        
        // 背景云层缓慢移动（制造速度感，但不循环，避免看起来像掉落物）
        this.clouds.forEach((cloud, index) => {
            cloud.y += 0.3; // 减慢移动速度
            // 移除循环逻辑，让云层自然消失，避免看起来像掉落物
            if (cloud.y > this.height + 100) {
                cloud.y = Phaser.Math.Between(-200, -100); // 从更上方重新开始
                cloud.x = Phaser.Math.Between(0, this.width);
            }
        });
        
        // 玩家移动（支持键盘和触摸）
        if (this.player && this.player.body) {
            // 确保物理体已激活
            if (!this.player.body.enable) {
                this.player.body.enable = true;
            }
            
            this.player.body.setVelocityX(0);
            
            // 键盘控制（检查 cursors 和 wasdKeys 是否存在）
            let moveLeft = false;
            let moveRight = false;
            
            if (this.cursors) {
                moveLeft = this.cursors.left.isDown || false;
                moveRight = this.cursors.right.isDown || false;
            }
            
            if (this.wasdKeys) {
                moveLeft = moveLeft || (this.wasdKeys.A && this.wasdKeys.A.isDown) || false;
                moveRight = moveRight || (this.wasdKeys.D && this.wasdKeys.D.isDown) || false;
            }
            
            // 触摸控制
            const touchLeft = this.touchLeft || false;
            const touchRight = this.touchRight || false;
            
            if (moveLeft || touchLeft) {
                this.player.body.setVelocityX(-400);
            } else if (moveRight || touchRight) {
                this.player.body.setVelocityX(400);
            }
        } else {
            // 如果玩家或物理体不存在，记录警告
            if (!this.player) {
                Logger.warn('玩家对象不存在，无法移动');
            } else if (!this.player.body) {
                Logger.warn('玩家物理体不存在，无法移动');
            }
        }
        
        // 手动碰撞检测（确保玩家和掉落物在同一图层和物理空间）
        if (!this.player) {
            // 玩家未创建，跳过碰撞检测
            return;
        }
        
        if (!this.player.body) {
            Logger.warn('玩家没有物理体！');
            return;
        }
        
        if (!this.player.body.enable) {
            Logger.warn('玩家物理体未激活！');
            return;
        }
        
        if (!this.fallingObjectsGroup) {
            Logger.warn('掉落物组不存在！');
            return;
        }
        
        // 获取玩家的实际世界坐标（考虑 Container 的子对象）
        const playerX = this.player.x;
        const playerY = this.player.y;
        const playerRadius = 50; // 大幅增大玩家碰撞半径（从35改为50）
        
        const fallingObjects = this.fallingObjectsGroup.getChildren();
        
        // 每5帧输出一次玩家位置（用于调试）
        if (this.frameCount === undefined) {
            this.frameCount = 0;
        }
        this.frameCount++;
        if (this.frameCount % 60 === 0) { // 每秒输出一次（假设60fps）
            Logger.debug('玩家位置:', {
                x: playerX.toFixed(2),
                y: playerY.toFixed(2),
                fallingObjectsCount: fallingObjects.length
            });
        }
        
        // 每帧检查所有掉落物
        fallingObjects.forEach((obj, index) => {
            // 检查对象是否有效
            if (!obj) {
                return;
            }
            
            // 检查对象是否还在场景中（更宽松的检查，不检查 scene）
            if (!obj.active) {
                return;
            }
            
            // 确保对象可见
            if (!obj.visible) {
                obj.setVisible(true);
                obj.setAlpha(1.0);
            }
            
            // 同步背景圆形位置（确保背景跟随文本移动）
            if (obj.bgCircle) {
                if (!obj.bgCircle.active) {
                    obj.bgCircle.setActive(true);
                }
                if (!obj.bgCircle.visible) {
                    obj.bgCircle.setVisible(true);
                    obj.bgCircle.setAlpha(1.0);
                }
                obj.bgCircle.x = obj.x;
                obj.bgCircle.y = obj.y;
            }
            
            // 清理掉出屏幕的物体（包括背景圆形）
            if (obj.y > this.height + 100) {
                if (this.collisionDetected) {
                    this.collisionDetected.delete(obj);
                }
                
                // 先销毁背景圆形
                if (obj.bgCircle) {
                    try {
                        if (obj.bgCircle.active) {
                            obj.bgCircle.setActive(false);
                            obj.bgCircle.setVisible(false);
                        }
                        obj.bgCircle.destroy();
                    } catch (e) {
                        Logger.warn('销毁背景圆形失败:', e);
                    }
                    obj.bgCircle = null;
                }
                
                // 从数组中移除
                if (this.fallingObjects) {
                    const arrIndex = this.fallingObjects.indexOf(obj);
                    if (arrIndex > -1) {
                        this.fallingObjects.splice(arrIndex, 1);
                    }
                }
                
                // 从物理组中移除
                if (this.fallingObjectsGroup && obj.active) {
                    this.fallingObjectsGroup.remove(obj, true, true);
                }
                
                // 最后销毁对象
                if (obj.active) {
                    obj.setActive(false);
                    obj.setVisible(false);
                }
                obj.destroy();
                return;
            }
            
            // 确保掉落物有物理体，如果没有则尝试重新启用
            if (!obj.body) {
                try {
                    this.physics.world.enable(obj);
                    obj.body.setVelocityY(Phaser.Math.Between(150, 250));
                } catch (e) {
                    Logger.warn(`掉落物 ${index} 无法启用物理体:`, e);
                    return;
                }
            }
            
            if (!obj.body.enable) {
                obj.body.enable = true;
            }
            
            // 确保物理体在移动
            if (obj.body.velocity.y === 0 || obj.body.velocity.y === undefined) {
                obj.body.setVelocityY(Phaser.Math.Between(150, 250));
            }
            
            // 获取掉落物的实际世界坐标
            const objX = obj.x;
            const objY = obj.y;
            const objBodyY = obj.body ? obj.body.y : objY;
            const objRadius = 50; // 大幅增大掉落物碰撞半径（从35改为50）
            
            // 调试：输出掉落物位置信息（每60帧输出一次，只输出前3个，且y坐标大于0的）
            if (this.frameCount % 60 === 0 && index < 3 && objY > 0) {
                Logger.debug(`掉落物 ${index} 位置:`, {
                    objText: obj.text || '无文本',
                    objX: objX.toFixed(2),
                    objY: objY.toFixed(2),
                    bodyY: objBodyY.toFixed(2),
                    bodyVelocityY: obj.body ? obj.body.velocity.y.toFixed(2) : 'N/A',
                    playerY: playerY.toFixed(2),
                    distanceY: Math.abs(objY - playerY).toFixed(2),
                    isMoving: obj.body && obj.body.velocity.y > 0
                });
            }
            
            // 强制输出：如果掉落物y坐标在100-200之间（说明在下落），输出一次
            if (objY > 100 && objY < 200 && !obj._debugLogged) {
                obj._debugLogged = true;
                Logger.debug(`掉落物 ${index} 开始下落:`, {
                    objText: obj.text || '无文本',
                    objY: objY.toFixed(2),
                    bodyY: objBodyY.toFixed(2),
                    velocityY: obj.body ? obj.body.velocity.y.toFixed(2) : 'N/A'
                });
            }
            
            // 计算距离（使用世界坐标）
            const dx = objX - playerX;
            const dy = objY - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 调试：当距离很近时输出信息（降低阈值，更容易触发）
            if (distance < 150 && !this.collisionDetected.has(obj)) {
                Logger.debug('接近碰撞:', {
                    objText: obj.text || '无文本',
                    distance: distance.toFixed(2),
                    playerPos: { x: playerX.toFixed(2), y: playerY.toFixed(2) },
                    objPos: { x: objX.toFixed(2), y: objY.toFixed(2) },
                    bodyPos: { x: obj.body ? obj.body.x.toFixed(2) : 'N/A', y: objBodyY.toFixed(2) },
                    playerDepth: this.player.depth,
                    objDepth: obj.depth,
                    playerInScene: this.player.scene === this,
                    objInScene: obj.scene === this,
                    velocityY: obj.body ? obj.body.velocity.y.toFixed(2) : 'N/A'
                });
            }
            
            // 碰撞检测（圆形碰撞）
            if (distance < playerRadius + objRadius) {
                // 碰撞发生！
                Logger.debug('碰撞检测触发', {
                    objText: obj.text,
                    objType: obj.answerType,
                    distance: distance.toFixed(2),
                    playerPos: { x: playerX.toFixed(2), y: playerY.toFixed(2) },
                    objPos: { x: objX.toFixed(2), y: objY.toFixed(2) },
                    playerDepth: this.player.depth,
                    objDepth: obj.depth
                });
                
                // 防止重复碰撞
                if (!this.collisionDetected.has(obj)) {
                    this.collisionDetected.add(obj);
                    this.handleCollision(this.player, obj);
                }
            }
        });
        
        // 更新UI
        this.updateUI();
    }
    
    updateUI() {
        this.scoreText.setText(`答对: ${this.score}/${this.targetScore}`);
        this.healthText.setText(`生命: ${this.playerHealth}`);
        this.comboText.setText(`连击: ${this.playerData.combo || 0}`);
    }
    
    startNewProblem() {
        Logger.debug('startNewProblem 开始');
        Logger.debug('isGameOver:', this.isGameOver, 'isVictory:', this.isVictory);
        
        if (this.isGameOver || this.isVictory) {
            Logger.debug('游戏已结束，不启动新题目');
            return;
        }
        
        // 检查是否有【莽夫道】词条
        let difficulty = this.currentSpirit.difficulty || 1;
        if (this.playerData.hasPerk('MANG_FU')) {
            difficulty = 1; // 题目变为极简
        }
        
        Logger.debug('生成题目 - 区域:', this.playerData.currentZone, '难度:', difficulty, '数学之灵:', this.currentSpirit.name);
        
        // 生成题目
        const problemBank = new ProblemBank();
        this.currentProblem = problemBank.getProblem(
            this.playerData.currentZone || '青石村',
            difficulty,
            this.currentSpirit.name
        );
        
        Logger.debug('题目生成结果:', {
            problem: this.currentProblem.problem,
            correctAnswer: this.currentProblem.correctAnswer,
            options: this.currentProblem.options,
            hasOptions: !!this.currentProblem.options && this.currentProblem.options.length > 0
        });
        
        if (!this.currentProblem || !this.currentProblem.correctAnswer) {
            Logger.error('题目生成失败！');
            return;
        }
        
        this.currentSolution = this.currentProblem.correctAnswer;
        
        // 显示题目
        let questionText = this.currentProblem.problem;
        
        // 检查是否有【残卷道】词条
        if (this.playerData.hasPerk('CAN_JUAN')) {
            // 把 "3 + 5 = ?" 显示为 "3 + ? = 8" 或 "? + 5 = 8" (填空题)
            const parts = questionText.split('=');
            if (parts.length === 2) {
                const leftPart = parts[0].trim();
                const answer = this.currentSolution;
                
                // 根据运算符类型，随机选择替换哪个数字
                let newLeftPart = leftPart;
                
                // 匹配数字和运算符：例如 "3 × 6" 或 "3 + 5"
                const match = leftPart.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
                if (match) {
                    const num1 = parseInt(match[1]);
                    const operator = match[2];
                    const num2 = parseInt(match[3]);
                    
                    // 随机选择替换第一个或第二个数字
                    if (Math.random() > 0.5) {
                        // 替换第一个数字：? + 5 = 8
                        newLeftPart = `? ${operator} ${num2}`;
                    } else {
                        // 替换第二个数字：3 + ? = 8
                        newLeftPart = `${num1} ${operator} ?`;
                    }
                } else {
                    // 如果没有匹配到，使用原来的简单替换（但只替换第一个数字）
                    newLeftPart = leftPart.replace(/^\d+/, '?');
                }
                
                questionText = `${newLeftPart} = ${answer}`;
            }
        } else {
            // 如果没有残卷道词条，保持原样（题目已经包含 ?）
            // questionText 已经是 "3 + 5 = ?" 的格式，不需要再添加
        }
        
        this.cloudText.setText(questionText);
        Logger.debug('题目已显示:', questionText);
        
        // 启动掉落计时器
        if (this.dropTimer) {
            Logger.debug('移除旧计时器');
            this.dropTimer.remove();
        }
        
        Logger.debug('创建掉落计时器 - 延迟: 800ms, 循环: true');
        this.dropTimer = this.time.addEvent({
            delay: 800, // 每0.8秒掉落一个
            callback: () => {
                Logger.debug('计时器回调触发 - spawnFallingAnswer');
                this.spawnFallingAnswer();
            },
            loop: true
        });
        
        Logger.debug('计时器已创建:', this.dropTimer);
        
        // 立即测试生成一个掉落物（用于调试）
        Logger.debug('立即测试生成掉落物...');
        this.time.delayedCall(500, () => {
            Logger.debug('延迟500ms后测试生成掉落物');
            if (this.spawnFallingAnswer) {
                this.spawnFallingAnswer();
            } else {
                Logger.error('spawnFallingAnswer 方法不存在！');
            }
        });
        
        Logger.debug('startNewProblem 完成');
    }
    
    spawnFallingAnswer() {
        Logger.debug('spawnFallingAnswer 开始');
        Logger.debug('isGameOver:', this.isGameOver, 'isVictory:', this.isVictory);
        Logger.debug('currentProblem:', this.currentProblem);
        Logger.debug('currentSolution:', this.currentSolution);
        
        if (this.isGameOver || this.isVictory) {
            Logger.debug('游戏已结束，不生成掉落物');
            return;
        }
        
        if (!this.currentProblem) {
            Logger.error('错误：currentProblem 为空！');
            return;
        }
        
        if (this.currentSolution === null || this.currentSolution === undefined) {
            Logger.error('错误：currentSolution 为空！');
            return;
        }
        
        // 随机掉落位置
        const x = Phaser.Math.Between(50, this.width - 50);
        Logger.debug('掉落位置 x:', x, '屏幕宽度:', this.width);
        
        // 随机决定是正确答案、错误答案、还是天雷
        const rand = Math.random();
        let content = '';
        let type = ''; // 'correct', 'wrong', 'trap'
        let color = 0xff0000;
        
        if (rand < 0.25) {
            // 25% 概率是正确答案（降低正确答案概率）
            content = String(this.currentSolution);
            type = 'correct';
            color = 0x00ff00; // 绿色
        } else if (rand < 0.70) {
            // 45% 概率是错误答案（增加错误答案概率）
            const wrongOptions = this.currentProblem.options.filter(opt => {
                // 处理数字比较（考虑浮点数精度）
                if (typeof opt === 'number' && typeof this.currentSolution === 'number') {
                    return Math.abs(opt - this.currentSolution) > 0.01;
                }
                return opt !== this.currentSolution;
            });
            if (wrongOptions.length > 0) {
                content = String(wrongOptions[Phaser.Math.Between(0, wrongOptions.length - 1)]);
            } else {
                // 如果没有错误选项，生成一个随机错误答案（范围更大）
                const offset = Phaser.Math.Between(-20, 20);
                // 确保错误答案不为0且不等于正确答案
                let wrongAnswer = parseInt(this.currentSolution) + offset;
                if (wrongAnswer === parseInt(this.currentSolution) || wrongAnswer === 0) {
                    wrongAnswer = parseInt(this.currentSolution) + (offset > 0 ? 10 : -10);
                }
                content = String(wrongAnswer);
            }
            type = 'wrong';
            color = 0xff0000; // 更鲜艳的红色
        } else {
            // 30% 概率是天雷（增加天雷概率）
            content = '雷';
            type = 'trap';
            color = 0xffaa00; // 更鲜艳的橙黄色
        }
        
        // 创建掉落实体 - 使用文本 + 背景圆形，确保可见
        // 根据类型设置文本样式
        let textStyle = {
            fontSize: '40px', // 增大字体，更容易看到
            fontFamily: 'Microsoft YaHei',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 5, // 增大描边
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                stroke: true,
                fill: true
            }
        };
        
        // 根据类型设置颜色（使用更明显的对比色）
        let bgColor = 0x000000;
        if (type === 'correct') {
            textStyle.fill = '#00FF00'; // 亮绿色（更鲜艳）
            bgColor = 0x00AA00; // 亮绿色背景（更明显）
        } else if (type === 'wrong') {
            textStyle.fill = '#FF0000'; // 亮红色（更鲜艳）
            bgColor = 0xAA0000; // 亮红色背景（更明显）
        } else {
            textStyle.fill = '#FFAA00'; // 亮橙黄色（天雷，更明显）
            bgColor = 0xAA6600; // 亮橙黄色背景（更明显）
        }
        
        // 创建背景圆形（确保可见性）- 使用更明显的颜色和更大的尺寸
        const bgCircle = this.add.circle(x, -50, 45, bgColor, 1.0); // 完全不透明
        bgCircle.setStrokeStyle(5, textStyle.fill, 1); // 更粗的边框
        bgCircle.setDepth(10); // 在文本下方
        bgCircle.setVisible(true);
        bgCircle.setAlpha(1.0);
        bgCircle.setActive(true);
        
        // 创建文本（直接作为物理体）- 使用更大的字体
        const text = this.add.text(x, -50, content, textStyle);
        text.setOrigin(0.5);
        text.setDepth(12); // 确保在最上层，高于玩家和背景
        text.setVisible(true);
        text.setAlpha(1.0);
        text.setActive(true);
        
        // 强制刷新显示
        text.setScale(1.0);
        bgCircle.setScale(1.0);
        
        // 将背景圆形添加到文本对象的数据中，以便一起销毁
        text.bgCircle = bgCircle;
        
        Logger.debug('掉落物创建:', {
            content: content,
            type: type,
            x: x,
            y: -50,
            textVisible: text.visible,
            textAlpha: text.alpha,
            bgVisible: bgCircle.visible,
            bgAlpha: bgCircle.alpha
        });
        
        // 启用物理（对文本启用）
        let velocityY = 200; // 默认速度
        try {
            // 确保物理世界存在
            if (!this.physics || !this.physics.world) {
                Logger.error('物理世界不存在！');
                return;
            }
            
            this.physics.world.enable(text);
            
            // 设置碰撞区域（确保足够大，容易碰撞）
            text.body.setSize(100, 100); // 大幅增大碰撞区域（从80改为100）
            text.body.setOffset(-50, -50); // 居中碰撞区域
            text.body.setAllowGravity(false);
            text.body.setCollideWorldBounds(false);
            text.body.setImmovable(false);
            
            // 确保物理体是动态的（可以移动）
            text.body.moves = true;
            
            // 设置速度
            velocityY = Phaser.Math.Between(150, 250);
            text.body.setVelocityY(velocityY);
            
            Logger.debug('物理体已启用:', {
                velocityY: velocityY,
                bodyVelocityY: text.body.velocity.y,
                bodyEnable: text.body.enable,
                bodyActive: text.body.active,
                moves: text.body.moves
            });
            
            // 确保物理体激活
            if (text.body) {
                text.body.enable = true;
                text.body.active = true;
            }
        } catch (error) {
            Logger.error('启用物理失败:', error);
            Logger.error('错误堆栈:', error.stack);
        }
        
        // 存储类型信息到文本对象（用于碰撞检测）
        text.answerType = type;
        text.answerValue = content;
        text.answerContent = content;
        
        // 检查是否有【天机道】词条（质数暴击）
        if (this.playerData.hasPerk('TIAN_JI') && type === 'correct') {
            const numValue = parseInt(content);
            if (this.isPrime(numValue)) {
                text.setFill('#ffd700'); // 质数变金色
                text.isPrimeBonus = true;
            }
        }
        
        // 添加到组和列表（使用文本作为物理体）
        try {
            // 确保文本对象是活跃的
            text.setActive(true);
            text.setVisible(true);
            bgCircle.setActive(true);
            bgCircle.setVisible(true);
            
            // 添加到物理组
            if (this.fallingObjectsGroup) {
                this.fallingObjectsGroup.add(text);
            } else {
                Logger.error('fallingObjectsGroup 不存在！');
            }
            
            // 添加到普通数组（用于遍历）
            if (!this.fallingObjects) {
                this.fallingObjects = [];
            }
            this.fallingObjects.push(text);
            
            Logger.debug('掉落物已创建并添加到组:', {
                content: content,
                type: type,
                groupSize: this.fallingObjectsGroup ? this.fallingObjectsGroup.getChildren().length : 0,
                arraySize: this.fallingObjects.length,
                textVisible: text.visible,
                bgVisible: bgCircle.visible,
                velocityY: text.body ? text.body.velocity.y : 'N/A'
            });
        } catch (error) {
            Logger.error('添加到组失败:', error);
            Logger.error('错误堆栈:', error.stack);
            // 即使添加失败，也要确保对象可见
            text.setVisible(true);
            bgCircle.setVisible(true);
        }
    }
    
    handleCollision(player, obj) {
        if (this.isGameOver || this.isVictory) return;
        
        const type = obj.answerType;
        const content = obj.answerContent || obj.answerValue || obj.text || '未知';
        
        Logger.debug('碰撞检测触发', {
            type: type,
            content: content,
            objType: obj.constructor.name,
            hasAnswerType: !!obj.answerType,
            objText: obj.text,
            objActive: obj.active,
            objVisible: obj.visible
        });
        
        // 从碰撞检测集合中移除（如果存在）
        if (this.collisionDetected) {
            this.collisionDetected.delete(obj);
        }
        
        // 销毁碰到的物体（文本本身和背景圆形）- 确保完全清理
        if (obj) {
            // 先销毁背景圆形（如果存在）
            if (obj.bgCircle) {
                try {
                    if (obj.bgCircle.active) {
                        obj.bgCircle.setActive(false);
                        obj.bgCircle.setVisible(false);
                    }
                    obj.bgCircle.destroy();
                } catch (e) {
                    Logger.warn('销毁背景圆形失败:', e);
                }
                obj.bgCircle = null; // 清除引用
            }
            
            // 从数组中移除
            if (this.fallingObjects) {
                const index = this.fallingObjects.indexOf(obj);
                if (index > -1) {
                    this.fallingObjects.splice(index, 1);
                }
            }
            
            // 从物理组中移除
            if (this.fallingObjectsGroup && obj.active) {
                this.fallingObjectsGroup.remove(obj, true, true);
            }
            
            // 最后销毁文本对象
            if (obj.active) {
                obj.setActive(false);
                obj.setVisible(false);
            }
            obj.destroy();
        }
        
        if (type === 'correct') {
            // 答对了！
            this.score++;
            this.playerData.combo = (this.playerData.combo || 0) + 1;
            if (this.playerData.combo > this.playerData.maxCombo) {
                this.playerData.maxCombo = this.playerData.combo;
            }
            
            // 质数暴击奖励
            let expGain = 20;
            if (obj.isPrimeBonus) {
                expGain *= 2; // 双倍修为
                this.cameras.main.flash(200, 255, 215, 0); // 金色闪光
            }
            
            // 计算修为（考虑词条效果）
            if (this.playerData.hasPerk('MANG_FU')) {
                expGain = Math.floor(expGain * 0.8); // 修为获取减少20%
            }
            
            // 给予修为
            const leveledUp = this.playerData.gainExp(expGain);
            
            // 检查是否有【残卷道】词条（答对回血）
            if (this.playerData.hasPerk('CAN_JUAN')) {
                this.playerHealth = Math.min(this.playerHealth + 5, this.playerData.maxHealth);
            }
            
            // 视觉反馈
            this.cameras.main.shake(100, 0.005);
            
            // 显示获得修为提示
            const expText = this.add.text(player.x, player.y - 30, `+${expGain}修为`, {
                fontSize: '18px',
                fill: '#50e3c2',
                fontFamily: 'Microsoft YaHei'
            });
            this.tweens.add({
                targets: expText,
                y: player.y - 80,
                alpha: 0,
                duration: 1000,
                onComplete: () => expText.destroy()
            });
            
            // 停止掉落，清空屏幕
            if (this.dropTimer) {
                this.dropTimer.remove();
            }
            
            // 清理所有掉落物（包括背景圆形）- 确保完全清理
            const allObjects = this.fallingObjectsGroup.getChildren().slice(); // 复制数组避免迭代时修改
            allObjects.forEach(obj => {
                if (obj) {
                    // 先销毁背景圆形
                    if (obj.bgCircle) {
                        try {
                            if (obj.bgCircle.active) {
                                obj.bgCircle.setActive(false);
                                obj.bgCircle.setVisible(false);
                            }
                            obj.bgCircle.destroy();
                        } catch (e) {
                            console.warn('销毁背景圆形失败:', e);
                        }
                        obj.bgCircle = null;
                    }
                    
                    // 从物理组中移除
                    if (obj.active) {
                        this.fallingObjectsGroup.remove(obj, true, true);
                    }
                    
                    // 销毁对象
                    if (obj.active) {
                        obj.setActive(false);
                        obj.setVisible(false);
                    }
                    obj.destroy();
                }
            });
            this.fallingObjectsGroup.clear(true, true);
            this.fallingObjects = [];
            
            // 检查是否过关
            if (this.score >= this.targetScore) {
                this.victory();
            } else if (leveledUp) {
                // 如果升级了，先显示升级提示，然后继续
                this.showLevelUp();
                this.time.delayedCall(1000, () => {
                    this.startNewProblem();
                });
            } else {
                // 下一题
                this.startNewProblem();
            }
            
        } else {
            // 答错了或撞到天雷
            this.playerData.combo = 0; // 重置连击
            
            let damage = 10;
            if (type === 'trap') {
                damage = 15; // 天雷伤害更高
            }
            
            this.playerHealth -= damage;
            
            // 视觉反馈
            this.cameras.main.shake(200, 0.02);
            this.cameras.main.flash(200, 255, 0, 0); // 红色闪光
            
            // 显示伤害提示
            const damageText = this.add.text(player.x, player.y - 30, `-${damage}`, {
                fontSize: '24px',
                fill: '#ff6b6b',
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold'
            });
            this.tweens.add({
                targets: damageText,
                y: player.y - 80,
                alpha: 0,
                duration: 1000,
                onComplete: () => damageText.destroy()
            });
            
            // 检查是否死亡
            if (this.playerHealth <= 0) {
                this.playerHealth = 0;
                this.gameOver();
            }
        }
        
        // 更新玩家数据
        this.playerData.currentHealth = this.playerHealth;
    }
    
    showLevelUp() {
        const levelUpText = this.add.text(this.width / 2, this.height / 2, '境界提升！', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(20);
        
        this.tweens.add({
            targets: levelUpText,
            scale: 1.5,
            alpha: 0,
            duration: 1500,
            onComplete: () => levelUpText.destroy()
        });
    }
    
    victory() {
        if (this.isVictory) return;
        this.isVictory = true;
        
        if (this.dropTimer) {
            this.dropTimer.remove();
        }
        
        // 清理所有掉落物（包括背景圆形）
        const allObjects = this.fallingObjectsGroup.getChildren().slice();
        allObjects.forEach(obj => {
            if (obj) {
                // 先销毁背景圆形
                if (obj.bgCircle) {
                    try {
                        if (obj.bgCircle.active) {
                            obj.bgCircle.setActive(false);
                            obj.bgCircle.setVisible(false);
                        }
                        obj.bgCircle.destroy();
                    } catch (e) {
                        Logger.warn('销毁背景圆形失败:', e);
                    }
                    obj.bgCircle = null;
                }
                
                // 停止移动
                if (obj.body) {
                    obj.body.setVelocityY(0);
                }
                
                // 从物理组中移除
                if (obj.active) {
                    this.fallingObjectsGroup.remove(obj, true, true);
                }
                
                // 销毁对象
                if (obj.active) {
                    obj.setActive(false);
                    obj.setVisible(false);
                }
                obj.destroy();
            }
        });
        this.fallingObjectsGroup.clear(true, true);
        this.fallingObjects = [];
        
        // 显示胜利界面
        const victoryBg = this.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, 0x000000, 0.8);
        victoryBg.setDepth(15);
        
        const victoryText = this.add.text(this.width / 2, this.height / 2 - 50, '渡劫成功！', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(16);
        
        const scoreText = this.add.text(this.width / 2, this.height / 2 + 20, `答对 ${this.score} 题`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(16);
        
        const continueBtn = this.add.text(this.width / 2, this.height / 2 + 100, '返回 (ESC)', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(16);
        
        continueBtn.on('pointerdown', () => {
            this.endCombat(true);
        });
        
        this.input.keyboard.once('keydown-ESC', () => {
            this.endCombat(true);
        });
    }
    
    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        if (this.dropTimer) {
            this.dropTimer.remove();
        }
        
        // 清理所有掉落物（包括背景圆形）
        const allObjects = this.fallingObjectsGroup.getChildren().slice();
        allObjects.forEach(obj => {
            if (obj) {
                // 先销毁背景圆形
                if (obj.bgCircle) {
                    try {
                        if (obj.bgCircle.active) {
                            obj.bgCircle.setActive(false);
                            obj.bgCircle.setVisible(false);
                        }
                        obj.bgCircle.destroy();
                    } catch (e) {
                        Logger.warn('销毁背景圆形失败:', e);
                    }
                    obj.bgCircle = null;
                }
                
                // 停止移动
                if (obj.body) {
                    obj.body.setVelocityY(0);
                }
                
                // 从物理组中移除
                if (obj.active) {
                    this.fallingObjectsGroup.remove(obj, true, true);
                }
                
                // 销毁对象
                if (obj.active) {
                    obj.setActive(false);
                    obj.setVisible(false);
                }
                obj.destroy();
            }
        });
        this.fallingObjectsGroup.clear(true, true);
        this.fallingObjects = [];
        
        // 显示失败界面
        const gameOverBg = this.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, 0x000000, 0.9);
        gameOverBg.setDepth(15);
        
        const gameOverText = this.add.text(this.width / 2, this.height / 2 - 50, '走火入魔...', {
            fontSize: '48px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(16);
        
        const scoreText = this.add.text(this.width / 2, this.height / 2 + 20, `答对 ${this.score} 题`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(16);
        
        const continueBtn = this.add.text(this.width / 2, this.height / 2 + 100, '返回 (ESC)', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(16);
        
        continueBtn.on('pointerdown', () => {
            this.endCombat(false);
        });
        
        this.input.keyboard.once('keydown-ESC', () => {
            this.endCombat(false);
        });
    }
    
    endCombat(victory) {
        // 清理虚拟按钮
        if (this.virtualButtons) {
            this.virtualButtons.forEach(btn => {
                if (btn && btn.destroy) {
                    btn.destroy();
                }
            });
            this.virtualButtons = [];
        }
        
        // 更新玩家数据
        this.playerData.currentHealth = this.playerHealth;
        this.playerData.totalProblemsSolved += this.score;
        this.playerData.correctAnswers += this.score;
        this.playerData.totalAnswers += this.score;
        
        // 触发任务和成就更新
        if (window.gameData.taskSystem) {
            for (let i = 0; i < this.score; i++) {
                window.gameData.taskSystem.updateTaskProgress('problem_solved', {}, this.playerData);
            }
        }
        
        if (window.gameData.achievementSystem) {
            window.gameData.achievementSystem.checkAchievements(this.playerData, 'solve_count', {});
        }
        
        // 返回之前的场景（可能是 GameScene 或 AdventureScene）
        this.scene.stop();
        
        // 先尝试恢复 AdventureScene（如果是从冒险页面启动的）
        const adventureScene = this.scene.get('AdventureScene');
        if (adventureScene && adventureScene.scene.isPaused()) {
            adventureScene.scene.resume();
            return;
        }
        
        // 如果没有 AdventureScene，尝试恢复 GameScene
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.scene.isPaused()) {
            gameScene.scene.resume();
        } else if (gameScene) {
            // 如果 GameScene 在运行但没有暂停，直接返回
            // 这种情况不应该发生，但作为后备
        }
    }
    
    /**
     * 判断是否为质数
     */
    isPrime(num) {
        if (num < 2) return false;
        if (num === 2) return true;
        if (num % 2 === 0) return false;
        
        for (let i = 3; i * i <= num; i += 2) {
            if (num % i === 0) return false;
        }
        return true;
    }
}

