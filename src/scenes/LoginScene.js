// Phaser 从全局对象获取
import { DynamicBackground } from '../core/DynamicBackground.js';
import { Logger } from '../core/Logger.js';

const { Scene } = Phaser;

/**
 * 登录/用户名选择场景
 * 允许用户输入或选择用户名，用于云端保存
 */
export class LoginScene extends Scene {
    constructor() {
        super({ key: 'LoginScene' });
    }
    
    create() {
        Logger.info('LoginScene 创建中...');
        const { width, height } = this.cameras.main;
        
        // 创建动态背景
        this.dynamicBg = new DynamicBackground(this);
        this.dynamicBg.create();
        
        // 标题
        const title = this.add.text(width / 2, height * 0.2, '數道仙途', {
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
        const subtitle = this.add.text(width / 2, height * 0.2 + 80, '请输入您的用户名', {
            fontSize: '24px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(100);
        
        // 输入框背景
        const inputBg = this.add.rectangle(width / 2, height * 0.45, 500, 60, 0x1a1a1a, 0.9);
        inputBg.setStrokeStyle(3, 0xFFD700);
        inputBg.setDepth(100);
        inputBg.setInteractive({ useHandCursor: true });
        
        // 输入框文本（显示用户名）
        this.inputText = this.add.text(width / 2, height * 0.45, '', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center'
        }).setOrigin(0.5).setDepth(101);
        
        // 提示文字
        const hintText = this.add.text(width / 2, height * 0.45 + 50, '用户名将用于云端保存，建议使用3-20个字符', {
            fontSize: '16px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // 检查是否有保存的用户名
        const savedUsername = localStorage.getItem('game_username');
        if (savedUsername) {
            this.inputText.setText(savedUsername);
            this.currentUsername = savedUsername;
        } else {
            this.currentUsername = '';
        }
        
        // 键盘输入处理
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Backspace') {
                this.currentUsername = this.currentUsername.slice(0, -1);
                this.inputText.setText(this.currentUsername);
            } else if (event.key === 'Enter') {
                this.handleLogin();
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                // 只允许字母、数字、中文和常见符号
                if (this.currentUsername.length < 20) {
                    this.currentUsername += event.key;
                    this.inputText.setText(this.currentUsername);
                }
            }
        });
        
        // 点击输入框聚焦
        inputBg.on('pointerdown', () => {
            // 可以添加输入框聚焦逻辑
        });
        
        // 新游戏按钮（如果是从主菜单"初踏仙途"进入，显示为"确认"）
        const newGameBtnText = this.isNewGame ? '确认' : '新游戏';
        const newGameBtn = this.add.text(width / 2, height * 0.6, newGameBtnText, {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#4a90e2',
            padding: { x: 40, y: 15 },
            stroke: '#FFD700',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4
            }
        }).setOrigin(0.5).setDepth(100);
        newGameBtn.setInteractive({ useHandCursor: true });
        
        newGameBtn.on('pointerover', () => {
            newGameBtn.setTint(0xcccccc);
            newGameBtn.setScale(1.05);
        });
        newGameBtn.on('pointerout', () => {
            newGameBtn.clearTint();
            newGameBtn.setScale(1.0);
        });
        newGameBtn.on('pointerdown', () => {
            this.handleLogin(true);
        });
        
        // 继续游戏按钮（如果有保存的用户名，或者是从主菜单"再續前緣"进入）
        if (savedUsername || this.loadGame) {
            const continueBtn = this.add.text(width / 2, height * 0.6 + 80, '继续游戏', {
                fontSize: '32px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, SimSun, serif',
                backgroundColor: '#50e3c2',
                padding: { x: 40, y: 15 },
                stroke: '#FFD700',
                strokeThickness: 2,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4
                }
            }).setOrigin(0.5).setDepth(100);
            continueBtn.setInteractive({ useHandCursor: true });
            
            continueBtn.on('pointerover', () => {
                continueBtn.setTint(0xcccccc);
                continueBtn.setScale(1.05);
            });
            continueBtn.on('pointerout', () => {
                continueBtn.clearTint();
                continueBtn.setScale(1.0);
            });
            continueBtn.on('pointerdown', () => {
                this.handleLogin(false, true);
            });
            
            // 如果是从主菜单"再續前緣"进入，自动填充用户名并显示继续游戏按钮
            if (this.loadGame && savedUsername) {
                this.currentUsername = savedUsername;
                this.inputText.setText(savedUsername);
            }
        }
        
        // 说明文字
        const infoText = this.add.text(width / 2, height - 80, 
            '提示：用户名用于区分不同玩家的存档，请妥善保管\n按 Enter 键确认，Backspace 删除', {
            fontSize: '16px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5).setDepth(100);
    }
    
    /**
     * 处理登录
     * @param {boolean} isNewGame - 是否是新游戏
     * @param {boolean} loadGame - 是否加载存档
     */
    async handleLogin(isNewGame = false, loadGame = false) {
        // 验证用户名
        const username = this.currentUsername.trim();
        
        if (!username || username.length < 1) {
            this.showError('请输入用户名');
            return;
        }
        
        if (username.length > 20) {
            this.showError('用户名不能超过20个字符');
            return;
        }
        
        // 验证用户名格式（只允许字母、数字、中文和常见符号）
        const usernameRegex = /^[a-zA-Z0-9\u4e00-\u9fa5_\-\.]+$/;
        if (!usernameRegex.test(username)) {
            this.showError('用户名只能包含字母、数字、中文和常见符号');
            return;
        }
        
        // 保存用户名到 localStorage
        localStorage.setItem('game_username', username);
        
        // 设置全局用户名
        window.gameData = window.gameData || {};
        window.gameData.username = username;
        window.gameData.playerId = username; // 使用用户名作为 playerId
        
        Logger.info('用户登录:', username);
        
        if (loadGame) {
            // 尝试加载存档
            try {
                const response = await fetch(`/api/load?playerId=${encodeURIComponent(username)}`);
                const result = await response.json();
                
                if (result.success && result.playerData) {
                    // 有存档，加载数据
                    Logger.info('找到存档，加载游戏数据');
                    this.scene.start('GameScene', { loadData: result.playerData });
                } else {
                    // 没有存档，显示提示并让用户选择
                    Logger.info('未找到存档');
                    this.showNoSaveDataDialog(username);
                }
            } catch (error) {
                Logger.error('加载存档失败:', error);
                // 加载失败，显示错误提示
                this.showError('加载存档失败，请检查网络连接');
            }
        } else {
            // 新游戏
            this.scene.start('GameScene', { isNewGame: true });
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        const { width, height } = this.cameras.main;
        
        // 移除旧的错误提示
        if (this.errorText) {
            this.errorText.destroy();
        }
        
        this.errorText = this.add.text(width / 2, height * 0.45 + 100, message, {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setOrigin(0.5).setDepth(102);
        
        // 3秒后自动消失
        this.time.delayedCall(3000, () => {
            if (this.errorText) {
                this.errorText.destroy();
                this.errorText = null;
            }
        });
    }
    
    /**
     * 显示没有存档的对话框
     */
    showNoSaveDataDialog(username) {
        const { width, height } = this.cameras.main;
        
        // 创建对话框背景
        const dialogBg = this.add.rectangle(width / 2, height / 2, 600, 300, 0x000000, 0.95);
        dialogBg.setStrokeStyle(3, 0xffa500);
        dialogBg.setDepth(200);
        dialogBg.setInteractive({ useHandCursor: false });
        
        // 标题
        const title = this.add.text(width / 2, height / 2 - 80, '未找到存档', {
            fontSize: '32px',
            fill: '#ffa500',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(201);
        
        // 提示信息
        const message = this.add.text(width / 2, height / 2 - 20, 
            `用户名 "${username}" 没有找到存档。\n请先开始新游戏创建存档。`, {
            fontSize: '20px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(201);
        
        // 开始新游戏按钮
        const newGameBtn = this.add.text(width / 2 - 100, height / 2 + 80, '开始新游戏', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#4a90e2',
            padding: { x: 30, y: 12 },
            stroke: '#FFD700',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(201);
        newGameBtn.setInteractive({ useHandCursor: true });
        
        newGameBtn.on('pointerover', () => {
            newGameBtn.setTint(0xcccccc);
            newGameBtn.setScale(1.05);
        });
        newGameBtn.on('pointerout', () => {
            newGameBtn.clearTint();
            newGameBtn.setScale(1.0);
        });
        newGameBtn.on('pointerdown', () => {
            // 关闭对话框并开始新游戏
            dialogBg.destroy();
            title.destroy();
            message.destroy();
            newGameBtn.destroy();
            cancelBtn.destroy();
            this.scene.start('GameScene', { isNewGame: true });
        });
        
        // 取消按钮
        const cancelBtn = this.add.text(width / 2 + 100, height / 2 + 80, '返回', {
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
            // 关闭对话框，返回登录界面
            dialogBg.destroy();
            title.destroy();
            message.destroy();
            newGameBtn.destroy();
            cancelBtn.destroy();
        });
    }
    
    shutdown() {
        if (this.dynamicBg) {
            this.dynamicBg.destroy();
        }
        // 移除键盘事件监听
        this.input.keyboard.removeAllListeners();
    }
}

