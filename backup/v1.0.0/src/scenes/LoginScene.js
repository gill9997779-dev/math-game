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
    
    create(data = {}) {
        Logger.info('LoginScene 创建中...', data);
        const { width, height } = this.cameras.main;
        
        // 保存传入的数据
        this.isNewGame = data.isNewGame || false;
        this.loadGame = data.loadGame || false;
        
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
        
        // 副标题（根据模式显示不同文字）
        const subtitleText = this.isNewGame ? '请输入您的用户名（新游戏）' : 
                           this.loadGame ? '请输入您的用户名（继续游戏）' : 
                           '请输入您的用户名';
        const subtitle = this.add.text(width / 2, height * 0.2 + 80, subtitleText, {
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
        
        // 提示文字（根据模式显示不同提示）
        const hintTextContent = this.loadGame ? 
            '请输入您的用户名以加载存档' : 
            '用户名将用于云端保存，建议使用3-20个字符';
        const hintText = this.add.text(width / 2, height * 0.45 + 50, hintTextContent, {
            fontSize: '16px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // 检查是否有保存的用户名
        const savedUsername = localStorage.getItem('game_username');
        
        // 如果是继续游戏模式，自动填充保存的用户名
        if (this.loadGame && savedUsername) {
            this.inputText.setText(savedUsername);
            this.currentUsername = savedUsername;
        } else if (savedUsername && !this.isNewGame) {
            // 如果不是新游戏模式，也填充保存的用户名
            this.inputText.setText(savedUsername);
            this.currentUsername = savedUsername;
        } else {
            this.currentUsername = '';
        }
        
        // 创建隐藏的 HTML input 元素（用于移动端键盘）
        this.createHTMLInput(width, height);
        
        // 键盘输入处理（桌面端备用，只在 HTML input 没有焦点时使用）
        this.input.keyboard.on('keydown', (event) => {
            // 如果 HTML input 有焦点，不处理 Phaser 键盘事件（避免重复输入）
            if (this.htmlInput && document.activeElement === this.htmlInput) {
                return;
            }
            
            if (event.key === 'Backspace') {
                this.currentUsername = this.currentUsername.slice(0, -1);
                this.updateInputDisplay();
            } else if (event.key === 'Enter') {
                this.handleLogin();
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                // 只允许字母、数字、中文和常见符号
                if (this.currentUsername.length < 20) {
                    this.currentUsername += event.key;
                    this.updateInputDisplay();
                }
            }
        });
        
        // 点击输入框聚焦（移动端会弹出键盘）
        inputBg.on('pointerdown', () => {
            this.focusInput();
        });
        
        // 点击输入文本也聚焦
        this.inputText.setInteractive({ useHandCursor: true });
        this.inputText.on('pointerdown', () => {
            this.focusInput();
        });
        
        // 根据模式显示不同的按钮
        if (this.loadGame) {
            // 继续游戏模式：只显示"继续游戏"按钮
            const continueBtn = this.add.text(width / 2, height * 0.6, '继续游戏', {
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
        } else {
            // 新游戏模式：只显示"确认"按钮
            const confirmBtn = this.add.text(width / 2, height * 0.6, '确认', {
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
                this.handleLogin(true);
            });
        }
        
        // 说明文字（根据模式显示不同说明）
        const infoTextContent = this.loadGame ? 
            '提示：请输入您的用户名以加载存档\n按 Enter 键确认，Backspace 删除' :
            '提示：用户名用于区分不同玩家的存档，请妥善保管\n按 Enter 键确认，Backspace 删除';
        const infoText = this.add.text(width / 2, height - 80, infoTextContent, {
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
            // 尝试加载存档（先尝试云端，再尝试本地）
            let saveData = null;
            
            // 1. 先尝试从云端加载
            try {
                const response = await fetch(`/api/load?playerId=${encodeURIComponent(username)}`);
                const result = await response.json();
                
                if (result.success && result.playerData) {
                    saveData = result.playerData;
                    Logger.info('从云端加载存档成功');
                }
            } catch (cloudError) {
                Logger.warn('云端加载失败，尝试本地存储:', cloudError);
            }
            
            // 2. 如果云端没有，尝试从本地存储加载
            if (!saveData) {
                try {
                    const localKey = `game_save_${username}`;
                    const localData = localStorage.getItem(localKey);
                    if (localData) {
                        saveData = JSON.parse(localData);
                        Logger.info('从本地存储加载存档成功');
                    }
                } catch (localError) {
                    Logger.warn('本地存储加载失败:', localError);
                }
            }
            
            // 3. 根据加载结果显示
            if (saveData) {
                // 有存档，加载数据
                Logger.info('找到存档，加载游戏数据');
                this.scene.start('GameScene', { loadData: saveData });
            } else {
                // 没有存档，显示提示并让用户选择
                Logger.info('未找到存档');
                this.showNoSaveDataDialog(username);
            }
        } else {
            // 新游戏：检查用户名是否已存在
            await this.checkUsernameExists(username);
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
     * 检查用户名是否已存在
     */
    async checkUsernameExists(username) {
        let exists = false;
        
        // 1. 先检查云端
        try {
            const response = await fetch(`/api/load?playerId=${encodeURIComponent(username)}`);
            const result = await response.json();
            if (result.success && result.playerData) {
                exists = true;
            }
        } catch (cloudError) {
            Logger.warn('检查云端存档失败:', cloudError);
        }
        
        // 2. 再检查本地存储
        if (!exists) {
            try {
                const localKey = `game_save_${username}`;
                const localData = localStorage.getItem(localKey);
                if (localData) {
                    exists = true;
                }
            } catch (localError) {
                Logger.warn('检查本地存档失败:', localError);
            }
        }
        
        if (exists) {
            // 用户名已存在，显示提示
            this.showUsernameExistsDialog(username);
        } else {
            // 用户名不存在，可以创建新游戏
            this.scene.start('GameScene', { isNewGame: true });
        }
    }
    
    /**
     * 显示用户名已存在的对话框
     */
    showUsernameExistsDialog(username) {
        const { width, height } = this.cameras.main;
        
        // 创建对话框背景（增加高度以容纳垂直排列的按钮）
        const dialogBg = this.add.rectangle(width / 2, height / 2, 600, 420, 0x000000, 0.95);
        dialogBg.setStrokeStyle(3, 0xffa500);
        dialogBg.setDepth(200);
        dialogBg.setInteractive({ useHandCursor: false });
        
        // 标题
        const title = this.add.text(width / 2, height / 2 - 100, '用户名已存在', {
            fontSize: '32px',
            fill: '#ffa500',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(201);
        
        // 提示信息（调整位置，给按钮留出更多空间）
        const message = this.add.text(width / 2, height / 2 - 20, 
            `用户名 "${username}" 已存在存档。\n\n请选择：`, {
            fontSize: '20px',
            fill: '#E8D5B7',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(201);
        
        // 继续游戏按钮（垂直排列，第一个按钮）
        const continueBtn = this.add.text(width / 2, height / 2 + 50, '继续游戏', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#50e3c2',
            padding: { x: 30, y: 12 },
            stroke: '#FFD700',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(201);
        continueBtn.setInteractive({ useHandCursor: true });
        
        continueBtn.on('pointerover', () => {
            continueBtn.setTint(0xcccccc);
            continueBtn.setScale(1.05);
        });
        continueBtn.on('pointerout', () => {
            continueBtn.clearTint();
            continueBtn.setScale(1.0);
        });
        continueBtn.on('pointerdown', async () => {
            // 关闭对话框并加载存档
            dialogBg.destroy();
            title.destroy();
            message.destroy();
            continueBtn.destroy();
            overwriteBtn.destroy();
            cancelBtn.destroy();
            
            // 加载存档
            await this.loadExistingGame(username);
        });
        
        // 覆盖存档按钮（垂直排列，第二个按钮）
        const overwriteBtn = this.add.text(width / 2, height / 2 + 110, '覆盖存档', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            backgroundColor: '#ff6b6b',
            padding: { x: 30, y: 12 },
            stroke: '#FFD700',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(201);
        overwriteBtn.setInteractive({ useHandCursor: true });
        
        overwriteBtn.on('pointerover', () => {
            overwriteBtn.setTint(0xcccccc);
            overwriteBtn.setScale(1.05);
        });
        overwriteBtn.on('pointerout', () => {
            overwriteBtn.clearTint();
            overwriteBtn.setScale(1.0);
        });
        overwriteBtn.on('pointerdown', async () => {
            // 关闭对话框
            dialogBg.destroy();
            title.destroy();
            message.destroy();
            continueBtn.destroy();
            overwriteBtn.destroy();
            cancelBtn.destroy();
            
            // 删除旧存档并创建新游戏
            await this.deleteSaveData(username);
            this.scene.start('GameScene', { isNewGame: true });
        });
        
        // 取消按钮（垂直排列，第三个按钮）
        const cancelBtn = this.add.text(width / 2, height / 2 + 170, '取消', {
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
            continueBtn.destroy();
            overwriteBtn.destroy();
            cancelBtn.destroy();
        });
    }
    
    /**
     * 加载已有存档
     */
    async loadExistingGame(username) {
        let saveData = null;
        
        // 1. 先尝试从云端加载
        try {
            const response = await fetch(`/api/load?playerId=${encodeURIComponent(username)}`);
            const result = await response.json();
            if (result.success && result.playerData) {
                saveData = result.playerData;
                Logger.info('从云端加载存档成功');
            }
        } catch (cloudError) {
            Logger.warn('云端加载失败，尝试本地存储:', cloudError);
        }
        
        // 2. 如果云端没有，尝试从本地存储加载
        if (!saveData) {
            try {
                const localKey = `game_save_${username}`;
                const localData = localStorage.getItem(localKey);
                if (localData) {
                    saveData = JSON.parse(localData);
                    Logger.info('从本地存储加载存档成功');
                }
            } catch (localError) {
                Logger.warn('本地存储加载失败:', localError);
            }
        }
        
        if (saveData) {
            this.scene.start('GameScene', { loadData: saveData });
        } else {
            this.showError('加载存档失败');
        }
    }
    
    /**
     * 删除存档数据
     */
    async deleteSaveData(username) {
        // 删除云端存档（通过保存空数据）
        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    playerData: null,
                    playerId: username
                })
            });
        } catch (error) {
            Logger.warn('删除云端存档失败:', error);
        }
        
        // 删除本地存档
        try {
            const localKey = `game_save_${username}`;
            localStorage.removeItem(localKey);
            Logger.info('本地存档已删除');
        } catch (error) {
            Logger.warn('删除本地存档失败:', error);
        }
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
    
    /**
     * 创建 HTML input 元素（用于移动端键盘）
     */
    createHTMLInput(width, height) {
        // 检查是否已存在
        let htmlInput = document.getElementById('username-input');
        if (htmlInput) {
            htmlInput.remove();
        }
        
        // 创建 input 元素
        htmlInput = document.createElement('input');
        htmlInput.id = 'username-input';
        htmlInput.type = 'text';
        htmlInput.maxLength = 20;
        htmlInput.autocomplete = 'off';
        htmlInput.autocapitalize = 'off';
        htmlInput.spellcheck = false;
        
        // 设置样式（隐藏但可交互）
        // 使用fixed定位，相对于视口，防止键盘弹出时页面滚动
        // 默认状态下，将input移到视口外，完全不可见且不可点击
        htmlInput.style.position = 'fixed';
        htmlInput.style.left = '-9999px';  // 移到视口外
        htmlInput.style.top = '-9999px';   // 移到视口外
        htmlInput.style.width = '1px';     // 最小尺寸
        htmlInput.style.height = '1px';    // 最小尺寸
        htmlInput.style.opacity = '0';
        htmlInput.style.zIndex = '-1';      // 负z-index，确保在最底层
        htmlInput.style.fontSize = '28px';
        htmlInput.style.textAlign = 'center';
        htmlInput.style.color = '#FFFFFF';
        htmlInput.style.backgroundColor = 'transparent';
        htmlInput.style.border = 'none';
        htmlInput.style.outline = 'none';
        htmlInput.style.fontFamily = 'Microsoft YaHei, SimSun, serif';
        // 防止键盘弹出时自动滚动
        htmlInput.style.transform = 'translateZ(0)';
        htmlInput.style.willChange = 'auto';
        // 默认禁用指针事件，防止误触弹出键盘
        htmlInput.style.pointerEvents = 'none';
        // 禁用自动聚焦和Tab键聚焦
        htmlInput.setAttribute('readonly', 'readonly');
        htmlInput.setAttribute('tabindex', '-1');
        htmlInput.setAttribute('disabled', 'disabled');
        // 添加aria-hidden属性，完全隐藏
        htmlInput.setAttribute('aria-hidden', 'true');
        // 添加触摸事件阻止，防止移动端误触
        htmlInput.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });
        htmlInput.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });
        htmlInput.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });
        // 阻止所有焦点事件
        htmlInput.addEventListener('focus', (e) => {
            if (htmlInput.style.pointerEvents === 'none') {
                e.preventDefault();
                e.stopPropagation();
                htmlInput.blur();
            }
        });
        
        // 设置初始值
        htmlInput.value = this.currentUsername;
        
        // 添加到页面
        document.body.appendChild(htmlInput);
        
        // 监听输入事件
        htmlInput.addEventListener('input', (e) => {
            // 限制长度
            if (e.target.value.length > 20) {
                e.target.value = e.target.value.substring(0, 20);
            }
            this.currentUsername = e.target.value;
            this.updateInputDisplay();
        });
        
        // 监听回车键
        htmlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin();
            }
            // 阻止事件冒泡到 Phaser 键盘事件（避免重复处理）
            e.stopPropagation();
        });
        
        // 监听键盘按下事件，阻止事件冒泡
        htmlInput.addEventListener('keypress', (e) => {
            e.stopPropagation();
        });
        
        // 监听失去焦点
        htmlInput.addEventListener('blur', () => {
            // 失去焦点时，立即禁用指针事件和所有属性，防止误触弹出键盘
            if (htmlInput) {
                // 将input移回视口外，完全不可见且不可点击
                htmlInput.style.left = '-9999px';
                htmlInput.style.top = '-9999px';
                htmlInput.style.width = '1px';
                htmlInput.style.height = '1px';
                htmlInput.style.zIndex = '-1';
                htmlInput.style.pointerEvents = 'none';
                htmlInput.setAttribute('readonly', 'readonly');
                htmlInput.setAttribute('disabled', 'disabled');
                htmlInput.setAttribute('tabindex', '-1');
                htmlInput.setAttribute('aria-hidden', 'true');
            }
            // 移除滚动阻止监听器
            if (this.scrollPreventer) {
                window.removeEventListener('scroll', this.scrollPreventer);
                this.scrollPreventer = null;
            }
            // 延迟隐藏，确保移动端键盘完全收起
            setTimeout(() => {
                if (htmlInput && htmlInput.style.opacity === '0') {
                    // 已经隐藏，不需要操作
                }
            }, 100);
        });
        
        this.htmlInput = htmlInput;
    }
    
    /**
     * 聚焦输入框（移动端会弹出键盘）
     */
    focusInput() {
        if (this.htmlInput) {
            // 保存当前滚动位置，防止键盘弹出时页面移动
            const scrollX = window.scrollX || window.pageXOffset || 0;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            
            // 将input移回可见位置（仅在需要输入时）
            const { width, height } = this.cameras.main;
            const inputX = window.innerWidth / 2 - 250;
            const inputY = window.innerHeight * 0.45 - 30;
            this.htmlInput.style.left = `${inputX}px`;
            this.htmlInput.style.top = `${inputY}px`;
            this.htmlInput.style.width = '500px';
            this.htmlInput.style.height = '60px';
            this.htmlInput.style.zIndex = '1000';
            this.htmlInput.removeAttribute('aria-hidden');
            
            // 启用指针事件并移除禁用属性，允许输入
            this.htmlInput.style.pointerEvents = 'auto';
            this.htmlInput.removeAttribute('readonly');
            this.htmlInput.removeAttribute('disabled');
            
            // 阻止键盘弹出时的自动滚动
            const preventScroll = (e) => {
                window.scrollTo(scrollX, scrollY);
            };
            
            // 添加滚动阻止监听器
            window.addEventListener('scroll', preventScroll, { passive: false });
            this.scrollPreventer = preventScroll;
            
            // 延迟聚焦，确保属性已更新
            setTimeout(() => {
                if (this.htmlInput) {
                    // 确保页面不滚动
                    window.scrollTo(scrollX, scrollY);
                    this.htmlInput.focus({ preventScroll: true });
                    // 移动端需要再次延迟才能弹出键盘
                    setTimeout(() => {
                        if (this.htmlInput) {
                            window.scrollTo(scrollX, scrollY);
                            this.htmlInput.focus({ preventScroll: true });
                        }
                    }, 100);
                }
            }, 50);
        }
    }
    
    /**
     * 更新输入显示
     */
    updateInputDisplay() {
        if (this.inputText) {
            this.inputText.setText(this.currentUsername);
        }
        if (this.htmlInput) {
            this.htmlInput.value = this.currentUsername;
        }
    }
    
    shutdown() {
        if (this.dynamicBg) {
            this.dynamicBg.destroy();
        }
        // 移除键盘事件监听
        this.input.keyboard.removeAllListeners();
        // 移除 HTML input 元素（确保完全移除）
        if (this.htmlInput) {
            // 先移除所有事件监听器
            const newInput = this.htmlInput.cloneNode(false);
            this.htmlInput.parentNode?.replaceChild(newInput, this.htmlInput);
            this.htmlInput.remove();
            this.htmlInput = null;
        }
        // 全局检查并移除可能残留的input元素
        const existingInput = document.getElementById('username-input');
        if (existingInput) {
            existingInput.remove();
        }
    }
}

