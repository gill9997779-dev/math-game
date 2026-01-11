/**
 * 场景基类 - 所有场景继承此类
 * 提供统一的初始化、清理、布局方法
 */
import * as Layout from './LayoutConfig.js';

const Scene = Phaser.Scene;

export class BaseScene extends Scene {
    constructor(config) {
        super(config);
        this.uiElements = [];  // 存储所有UI元素，便于清理
        this.isModal = false;  // 是否是弹窗场景
    }
    
    /**
     * 场景初始化 - 子类必须调用 super.init()
     */
    init(data) {
        this.sceneData = data || {};
    }
    
    /**
     * 场景创建前的准备工作
     */
    preCreate() {
        // 清理旧元素
        this.clearUI();
        
        // 获取画布尺寸
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }
    
    /**
     * 清理所有UI元素
     */
    clearUI() {
        this.uiElements.forEach(el => {
            if (el && el.destroy) {
                el.destroy();
            }
        });
        this.uiElements = [];
    }
    
    /**
     * 添加UI元素并追踪
     */
    addUI(element) {
        this.uiElements.push(element);
        return element;
    }
    
    /**
     * 创建标准背景（弹窗用）
     */
    createModalBackground(alpha = 0.9) {
        const bg = this.add.rectangle(
            this.centerX, this.centerY,
            this.width, this.height,
            Layout.COLORS.BG_OVERLAY, alpha
        );
        bg.setDepth(Layout.DEPTH.MODAL_OVERLAY);
        return this.addUI(bg);
    }
    
    /**
     * 创建面板背景
     */
    createPanel(x, y, width, height, options = {}) {
        const {
            fillColor = Layout.COLORS.BG_PANEL,
            borderColor = Layout.COLORS.PRIMARY,
            borderWidth = 2,
            alpha = 0.95,
            depth = Layout.DEPTH.MODAL_CONTENT
        } = options;
        
        const panel = this.add.rectangle(x, y, width, height, fillColor, alpha);
        panel.setStrokeStyle(borderWidth, borderColor);
        panel.setDepth(depth);
        return this.addUI(panel);
    }
    
    /**
     * 创建标题文本
     */
    createTitle(text, y = 50) {
        const title = this.add.text(this.centerX, y, text, {
            fontSize: Layout.FONTS.SIZE_TITLE,
            fill: Layout.COLORS.TEXT_GOLD,
            fontFamily: Layout.FONTS.FAMILY,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        title.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        return this.addUI(title);
    }
    
    /**
     * 创建副标题
     */
    createSubtitle(text, y = 90) {
        const subtitle = this.add.text(this.centerX, y, text, {
            fontSize: Layout.FONTS.SIZE_SUBTITLE,
            fill: Layout.COLORS.TEXT_GRAY,
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        subtitle.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        return this.addUI(subtitle);
    }
    
    /**
     * 创建标准按钮
     */
    createButton(x, y, text, options = {}) {
        const {
            size = 'STANDARD',
            type = 'primary',
            onClick = null,
            depth = Layout.DEPTH.UI_BUTTONS
        } = options;
        
        const btnConfig = Layout.BUTTON[size] || Layout.BUTTON.STANDARD;
        
        // 按钮颜色
        const colors = {
            primary: { bg: Layout.COLORS.PRIMARY, hover: 0x7788ff },
            secondary: { bg: 0x444444, hover: 0x555555 },
            success: { bg: Layout.COLORS.SUCCESS, hover: 0x60f3d2 },
            danger: { bg: Layout.COLORS.DANGER, hover: 0xff8888 },
            accent: { bg: 0x9013FE, hover: 0xa033ff }
        };
        const color = colors[type] || colors.primary;
        
        // 创建按钮背景
        const btnBg = this.add.rectangle(x, y, btnConfig.width, btnConfig.height, color.bg);
        btnBg.setStrokeStyle(1, 0xffffff);
        btnBg.setDepth(depth);
        btnBg.setInteractive({ useHandCursor: true });
        
        // 创建按钮文字
        const btnText = this.add.text(x, y, text, {
            fontSize: btnConfig.fontSize,
            fill: '#ffffff',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        btnText.setDepth(depth + 1);
        
        // 交互效果
        btnBg.on('pointerover', () => btnBg.setFillStyle(color.hover));
        btnBg.on('pointerout', () => btnBg.setFillStyle(color.bg));
        
        if (onClick) {
            btnBg.on('pointerdown', onClick);
        }
        
        this.addUI(btnBg);
        this.addUI(btnText);
        
        return { bg: btnBg, text: btnText };
    }
    
    /**
     * 创建关闭/返回按钮
     */
    createCloseButton(y = null, text = '返回 (ESC)') {
        const btnY = y || (this.height - 50);
        
        const btn = this.createButton(this.centerX, btnY, text, {
            size: 'STANDARD',
            type: 'secondary',
            onClick: () => this.closeScene()
        });
        
        // ESC键关闭
        this.input.keyboard.on('keydown-ESC', () => this.closeScene());
        
        return btn;
    }
    
    /**
     * 关闭场景
     */
    closeScene() {
        this.clearUI();
        this.scene.stop();
        
        // 尝试恢复GameScene
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.scene.isPaused()) {
            gameScene.scene.resume();
        }
    }
    
    /**
     * 显示提示消息
     */
    showToast(message, type = 'info', duration = 2000) {
        const colors = {
            info: Layout.COLORS.PRIMARY,
            success: Layout.COLORS.SUCCESS,
            warning: Layout.COLORS.WARNING,
            error: Layout.COLORS.DANGER
        };
        
        const toast = this.add.text(this.centerX, 100, message, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: Layout.FONTS.FAMILY,
            backgroundColor: `#${(colors[type] || colors.info).toString(16).padStart(6, '0')}`,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        toast.setDepth(Layout.DEPTH.TOAST);
        toast.setAlpha(0);
        
        // 动画
        this.tweens.add({
            targets: toast,
            alpha: 1,
            y: 80,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(duration, () => {
                    this.tweens.add({
                        targets: toast,
                        alpha: 0,
                        y: 60,
                        duration: 200,
                        onComplete: () => toast.destroy()
                    });
                });
            }
        });
    }
    
    /**
     * 场景销毁时清理
     */
    shutdown() {
        this.clearUI();
    }
}
