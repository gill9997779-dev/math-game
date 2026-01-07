// Phaser 从全局对象获取
import { DynamicBackground } from '../core/DynamicBackground.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 登录/用户名选择场景 - 带虚拟键盘
 * 彻底解决移动设备键盘无法唤起的问题
 */
export class LoginScene extends Scene {
    constructor() {
        super({ key: 'LoginScene' });
        this.currentUsername = '';
        this.virtualKeyboard = null;
        this.usernameDisplay = null;
        this.isKeyboardVisible = true; // 默认显示虚拟键盘
        this.keyboardButtons = [];
    }
    
    create(data = {}) {
        Logger.info('LoginScene 创建中...', data);
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 保存传入的数据
        this.isNewGame = data.isNewGame || false;
        this.loadGame = data.loadGame || false;
        
        // 创建动态背景
        this.dynamicBg = new DynamicBackground(this);
        this.dynamicBg.create();
        
        // 标题
        const title = this.add.text(width / 2, height * 0.08, '數道仙途', {
            fontSize: '36px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#FFA500',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);
        
        // 副标题
        const subtitleText = this.isNewGame ? '请输入您的用户名（新游戏）' : 
                           this.loadGame ? '请输入您的用户名（继续游戏）' : 
                           '请输入您的用户名';
        const subtitle = this.add.text(width / 2, title.y + 50, subtitleText, {
            fontSize: '18px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5).setDepth(100);
        
        // 创建用户名显示区域
        this.createUsernameDisplay();
        
        // 创建虚拟键盘
        this.createVirtualKeyboard();
        
        // 创建功能按钮
        this.createActionButtons();
        
        // 显示使用说明
        this.createInstructions();
    }
    
    /**
     * 创建用户名显示区域
     */
    createUsernameDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 输入框背景
        const inputBg = this.add.rectangle(width / 2, height * 0.25, 400, 50, 0x1a1a1a, 0.9);
        inputBg.setStrokeStyle(2, 0xFFD700);
        inputBg.setDepth(100);
        
        // 输入框文本
        this.usernameDisplay = this.add.text(width / 2, height * 0.25, '', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center'
        }).setOrigin(0.5).setDepth(101);
        
        // 光标
        this.cursor = this.add.text(width / 2 + 10, height * 0.25, '|', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, SimSun, serif'
        }).setOrigin(0.5).setDepth(101);
        
        // 光标闪烁动画
        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 创建虚拟键盘
     */
    createVirtualKeyboard() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 检测移动设备，调整键盘大小和位置
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 根据屏幕尺寸动态调整键盘参数
        const scale = Math.min(width / 1200, height / 800, 1.0);
        const keyboardY = Math.max(height * 0.55, height - 280); // 确保键盘不会太靠下
        
        // 键盘容器
        this.virtualKeyboard = this.add.container(width / 2, keyboardY);
        this.virtualKeyboard.setDepth(100);
        
        // 键盘布局
        const keyboardLayout = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];
        
        // 动态调整按钮尺寸和间距
        const buttonWidth = Math.max(28, 35 * scale);
        const buttonHeight = Math.max(28, 35 * scale);
        const buttonSpacing = Math.max(32, 40 * scale);
        const rowSpacing = Math.max(35, 45 * scale);
        
        // 计算键盘总宽度，确保不超出屏幕
        const maxRowWidth = Math.max(...keyboardLayout.map(row => row.length)) * buttonSpacing;
        const availableWidth = width - 40; // 留出边距
        
        // 如果键盘太宽，进一步缩小
        let finalButtonSpacing = buttonSpacing;
        let finalButtonWidth = buttonWidth;
        
        if (maxRowWidth > availableWidth) {
            const scaleFactor = availableWidth / maxRowWidth;
            finalButtonSpacing = buttonSpacing * scaleFactor;
            finalButtonWidth = buttonWidth * scaleFactor;
        }
        
        // 创建键盘按钮
        keyboardLayout.forEach((row, rowIndex) => {
            const rowWidth = (row.length - 1) * finalButtonSpacing;
            const startX = -rowWidth / 2;
            
            row.forEach((key, keyIndex) => {
                const x = startX + keyIndex * finalButtonSpacing;
                const y = -80 + rowIndex * rowSpacing;
                
                this.createKeyButton(x, y, finalButtonWidth, buttonHeight, key);
            });
        });
        
        // 创建特殊按键
        this.createSpecialKeys(finalButtonWidth, buttonHeight, finalButtonSpacing, rowSpacing);
    }
    
    /**
     * 创建键盘按钮
     */
    createKeyButton(x, y, width, height, key) {
        // 按钮背景
        const buttonBg = this.add.rectangle(x, y, width, height, 0x2a2a2a, 0.9);
        buttonBg.setStrokeStyle(1, 0x555555);
        buttonBg.setInteractive({ useHandCursor: true });
        
        // 按钮文字
        const buttonText = this.add.text(x, y, key, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 按钮容器
        const button = this.add.container(0, 0, [buttonBg, buttonText]);
        this.virtualKeyboard.add(button);
        
        // 添加交互事件
        buttonBg.on('pointerdown', () => {
            this.onKeyPress(key);
            // 按下效果
            buttonBg.setFillStyle(0x4a4a4a);
            buttonText.setTint(0xFFD700);
        });
        
        buttonBg.on('pointerup', () => {
            // 恢复正常状态
            buttonBg.setFillStyle(0x2a2a2a);
            buttonText.clearTint();
        });
        
        buttonBg.on('pointerout', () => {
            // 恢复正常状态
            buttonBg.setFillStyle(0x2a2a2a);
            buttonText.clearTint();
        });
        
        // 悬停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x3a3a3a);
        });
        
        this.keyboardButtons.push({ bg: buttonBg, text: buttonText, key: key });
    }
    
    /**
     * 创建特殊按键
     */
    createSpecialKeys(buttonWidth = 35, buttonHeight = 35, buttonSpacing = 40, rowSpacing = 45) {
        // 特殊按键的Y位置（在最后一行下方）
        const specialKeysY = -80 + 3 * rowSpacing + 10;
        
        // 根据按钮宽度调整特殊按键的尺寸和位置
        const spaceWidth = Math.max(100, buttonWidth * 3);
        const backspaceWidth = Math.max(70, buttonWidth * 2);
        const clearWidth = Math.max(50, buttonWidth * 1.5);
        
        // 计算按键位置，确保居中且不重叠
        const totalWidth = spaceWidth + backspaceWidth + clearWidth + 20; // 20是间距
        const startX = -totalWidth / 2;
        
        // 空格键
        const spaceButton = this.createSpecialButton(
            startX + spaceWidth / 2, 
            specialKeysY, 
            spaceWidth, 
            buttonHeight, 
            '空格', 
            () => {
                this.onKeyPress(' ');
            }
        );
        
        // 退格键
        const backspaceButton = this.createSpecialButton(
            startX + spaceWidth + 10 + backspaceWidth / 2, 
            specialKeysY, 
            backspaceWidth, 
            buttonHeight, 
            '退格', 
            () => {
                this.onBackspace();
            }
        );
        
        // 清空键
        const clearButton = this.createSpecialButton(
            startX + spaceWidth + backspaceWidth + 20 + clearWidth / 2, 
            specialKeysY, 
            clearWidth, 
            buttonHeight, 
            '清空', 
            () => {
                this.onClear();
            }
        );
    }
    
    /**
     * 创建特殊按钮
     */
    createSpecialButton(x, y, width, height, text, callback) {
        // 按钮背景
        const buttonBg = this.add.rectangle(x, y, width, height, 0x4a4a4a, 0.9);
        buttonBg.setStrokeStyle(1, 0x777777);
        buttonBg.setInteractive({ useHandCursor: true });
        
        // 按钮文字
        const buttonText = this.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 按钮容器
        const button = this.add.container(0, 0, [buttonBg, buttonText]);
        this.virtualKeyboard.add(button);
        
        // 添加交互事件
        buttonBg.on('pointerdown', () => {
            callback();
            // 按下效果
            buttonBg.setFillStyle(0x6a6a6a);
            buttonText.setTint(0xFFD700);
        });
        
        buttonBg.on('pointerup', () => {
            // 恢复正常状态
            buttonBg.setFillStyle(0x4a4a4a);
            buttonText.clearTint();
        });
        
        buttonBg.on('pointerout', () => {
            // 恢复正常状态
            buttonBg.setFillStyle(0x4a4a4a);
            buttonText.clearTint();
        });
        
        // 悬停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x5a5a5a);
        });
        
        return button;
    }
    
    /**
     * 处理按键输入
     */
    onKeyPress(key) {
        if (this.currentUsername.length < 20) { // 限制用户名长度
            this.currentUsername += key;
            this.updateUsernameDisplay();
        }
    }
    
    /**
     * 处理退格
     */
    onBackspace() {
        if (this.currentUsername.length > 0) {
            this.currentUsername = this.currentUsername.slice(0, -1);
            this.updateUsernameDisplay();
        }
    }
    
    /**
     * 处理清空
     */
    onClear() {
        this.currentUsername = '';
        this.updateUsernameDisplay();
    }
    
    /**
     * 更新用户名显示
     */
    updateUsernameDisplay() {
        if (this.usernameDisplay) {
            this.usernameDisplay.setText(this.currentUsername);
            
            // 更新光标位置
            const textWidth = this.usernameDisplay.width;
            this.cursor.x = this.usernameDisplay.x + textWidth / 2 + 10;
        }
    }
    
    /**
     * 创建功能按钮
     */
    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 确保按钮不会与键盘重叠，动态调整位置
        const buttonY = Math.min(height * 0.9, height - 50);
        
        // 确认按钮
        const confirmButton = this.add.rectangle(width / 2 - 100, buttonY, 120, 40, 0x4CAF50, 0.9);
        confirmButton.setStrokeStyle(2, 0x45a049);
        confirmButton.setInteractive({ useHandCursor: true });
        confirmButton.setDepth(100);
        
        const confirmText = this.add.text(width / 2 - 100, buttonY, '确认', {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        // 取消按钮
        const cancelButton = this.add.rectangle(width / 2 + 100, buttonY, 120, 40, 0xf44336, 0.9);
        cancelButton.setStrokeStyle(2, 0xe53935);
        cancelButton.setInteractive({ useHandCursor: true });
        cancelButton.setDepth(100);
        
        const cancelText = this.add.text(width / 2 + 100, buttonY, '返回', {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        // 按钮事件
        confirmButton.on('pointerdown', () => {
            this.onConfirm();
        });
        
        cancelButton.on('pointerdown', () => {
            this.onCancel();
        });
        
        // 悬停效果
        confirmButton.on('pointerover', () => {
            confirmButton.setFillStyle(0x66BB6A);
        });
        
        confirmButton.on('pointerout', () => {
            confirmButton.setFillStyle(0x4CAF50);
        });
        
        cancelButton.on('pointerover', () => {
            cancelButton.setFillStyle(0xef5350);
        });
        
        cancelButton.on('pointerout', () => {
            cancelButton.setFillStyle(0xf44336);
        });
    }
    
    /**
     * 创建使用说明
     */
    createInstructions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 动态调整说明文字位置，避免与键盘重叠
        const instructionY = Math.min(height * 0.35, height * 0.25 + 80);
        
        const instructions = this.add.text(width / 2, instructionY, 
            '使用虚拟键盘输入用户名\n支持数字和字母，最多20个字符', {
            fontSize: '14px',
            fill: '#B8E986',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // 添加键盘切换按钮（可选功能）
        this.createKeyboardToggle();
    }
    
    /**
     * 创建键盘显示/隐藏切换按钮
     */
    createKeyboardToggle() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 切换按钮位置
        const toggleY = Math.min(height * 0.4, height * 0.25 + 120);
        
        this.keyboardToggle = this.add.text(width / 2, toggleY, '隐藏键盘', {
            fontSize: '12px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });
        
        this.keyboardToggle.on('pointerdown', () => {
            this.toggleKeyboard();
        });
        
        this.keyboardToggle.on('pointerover', () => {
            this.keyboardToggle.setTint(0xcccccc);
        });
        
        this.keyboardToggle.on('pointerout', () => {
            this.keyboardToggle.clearTint();
        });
    }
    
    /**
     * 切换键盘显示/隐藏
     */
    toggleKeyboard() {
        this.isKeyboardVisible = !this.isKeyboardVisible;
        
        if (this.isKeyboardVisible) {
            this.virtualKeyboard.setVisible(true);
            this.keyboardToggle.setText('隐藏键盘');
        } else {
            this.virtualKeyboard.setVisible(false);
            this.keyboardToggle.setText('显示键盘');
        }
    }
    
    /**
     * 确认按钮处理
     */
    onConfirm() {
        if (this.currentUsername.trim().length === 0) {
            this.showError('请输入用户名');
            return;
        }
        
        if (this.currentUsername.trim().length < 2) {
            this.showError('用户名至少需要2个字符');
            return;
        }
        
        // 保存用户名并继续游戏
        window.gameData = window.gameData || {};
        window.gameData.username = this.currentUsername.trim();
        
        Logger.info('用户名设置完成:', window.gameData.username);
        
        // 根据模式进入不同场景
        if (this.isNewGame) {
            this.scene.start('GameScene', { isNewGame: true });
        } else if (this.loadGame) {
            this.loadPlayerData();
        } else {
            this.scene.start('GameScene');
        }
    }
    
    /**
     * 取消按钮处理
     */
    onCancel() {
        this.scene.start('MainMenuScene');
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 移除旧的错误提示
        if (this.errorText) {
            this.errorText.destroy();
        }
        
        this.errorText = this.add.text(width / 2, height * 0.4, message, {
            fontSize: '16px',
            fill: '#ff6b6b',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
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
     * 加载玩家数据
     */
    async loadPlayerData() {
        try {
            const response = await fetch('/api/load', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId: this.currentUsername.trim()
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.playerData) {
                    // 加载成功，进入游戏
                    this.scene.start('GameScene', { 
                        loadedData: data.playerData,
                        isLoadGame: true 
                    });
                } else {
                    this.showError('未找到存档数据，将开始新游戏');
                    setTimeout(() => {
                        this.scene.start('GameScene', { isNewGame: true });
                    }, 2000);
                }
            } else {
                throw new Error('网络请求失败');
            }
        } catch (error) {
            console.error('加载存档失败:', error);
            this.showError('加载存档失败，将开始新游戏');
            setTimeout(() => {
                this.scene.start('GameScene', { isNewGame: true });
            }, 2000);
        }
    }
    
    shutdown() {
        if (this.dynamicBg) {
            this.dynamicBg.destroy();
        }
        
        // 清理键盘按钮
        this.keyboardButtons = [];
        
        // 清理其他资源
        if (this.errorText) {
            this.errorText.destroy();
        }
    }
}