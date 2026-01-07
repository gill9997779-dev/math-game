/**
 * 现代化UI组件库
 * 提供统一的、美观的UI组件
 */

export class UIComponents {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * 创建渐变按钮
     */
    createGradientButton(x, y, text, options = {}) {
        const {
            width = 200,
            height = 50,
            fontSize = '24px',
            colors = [0x667EEA, 0x764BA2],
            textColor = '#FFFFFF',
            onClick = () => {},
            icon = null
        } = options;
        
        const container = this.scene.add.container(x, y);
        
        // 创建渐变背景
        const graphics = this.scene.add.graphics();
        this.drawGradientRect(graphics, -width/2, -height/2, width, height, colors[0], colors[1]);
        
        // 圆角遮罩效果（通过描边模拟）
        graphics.lineStyle(3, 0xFFFFFF, 0.3);
        graphics.strokeRoundedRect(-width/2, -height/2, width, height, 10);
        
        // 文本
        let displayText = text;
        if (icon) {
            displayText = `${icon} ${text}`;
        }
        
        const buttonText = this.scene.add.text(0, 0, displayText, {
            fontSize: fontSize,
            fill: textColor,
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        container.add([graphics, buttonText]);
        
        // 交互区域
        const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);
        
        // 悬停效果
        hitArea.on('pointerover', () => {
            this.scene.tweens.add({
                targets: container,
                scale: 1.05,
                duration: 100
            });
            graphics.clear();
            this.drawGradientRect(graphics, -width/2, -height/2, width, height, colors[1], colors[0]);
            graphics.lineStyle(3, 0xFFFFFF, 0.5);
            graphics.strokeRoundedRect(-width/2, -height/2, width, height, 10);
        });
        
        hitArea.on('pointerout', () => {
            this.scene.tweens.add({
                targets: container,
                scale: 1,
                duration: 100
            });
            graphics.clear();
            this.drawGradientRect(graphics, -width/2, -height/2, width, height, colors[0], colors[1]);
            graphics.lineStyle(3, 0xFFFFFF, 0.3);
            graphics.strokeRoundedRect(-width/2, -height/2, width, height, 10);
        });
        
        hitArea.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: onClick
            });
        });
        
        return container;
    }
    
    /**
     * 绘制渐变矩形
     */
    drawGradientRect(graphics, x, y, width, height, color1, color2, vertical = true) {
        const steps = 20;
        
        for (let i = 0; i < steps; i++) {
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
            
            if (vertical) {
                graphics.fillRect(x, y + (height / steps) * i, width, height / steps + 1);
            } else {
                graphics.fillRect(x + (width / steps) * i, y, width / steps + 1, height);
            }
        }
    }
    
    /**
     * 创建卡片面板
     */
    createCard(x, y, options = {}) {
        const {
            width = 300,
            height = 200,
            title = '',
            bgColor = 0x1a1a2e,
            borderColor = 0x667eea,
            titleColor = '#FFD700'
        } = options;
        
        const container = this.scene.add.container(x, y);
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, width, height, bgColor, 0.95);
        bg.setStrokeStyle(3, borderColor);
        
        // 标题
        let titleText = null;
        if (title) {
            titleText = this.scene.add.text(0, -height/2 + 30, title, {
                fontSize: '24px',
                fill: titleColor,
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
        }
        
        container.add([bg]);
        if (titleText) container.add(titleText);
        
        // 返回容器和内容区域信息
        container.contentY = title ? -height/2 + 60 : -height/2 + 20;
        container.contentHeight = title ? height - 80 : height - 40;
        
        return container;
    }
    
    /**
     * 创建进度条
     */
    createProgressBar(x, y, options = {}) {
        const {
            width = 200,
            height = 20,
            value = 0,
            maxValue = 100,
            bgColor = 0x333333,
            fillColor = 0x50E3C2,
            showText = true,
            textFormat = '{value}/{max}'
        } = options;
        
        const container = this.scene.add.container(x, y);
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, width, height, bgColor, 1);
        bg.setStrokeStyle(2, 0x555555);
        
        // 填充
        const fill = this.scene.add.rectangle(-width/2, 0, 0, height - 4, fillColor, 1);
        fill.setOrigin(0, 0.5);
        
        container.add([bg, fill]);
        
        // 文本
        let text = null;
        if (showText) {
            text = this.scene.add.text(0, 0, '', {
                fontSize: '14px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5);
            container.add(text);
        }
        
        // 更新方法
        container.updateProgress = (newValue, newMax = maxValue) => {
            const ratio = Math.min(newValue / newMax, 1);
            fill.width = (width - 4) * ratio;
            
            if (text) {
                const displayText = textFormat
                    .replace('{value}', Math.floor(newValue))
                    .replace('{max}', Math.floor(newMax))
                    .replace('{percent}', Math.floor(ratio * 100));
                text.setText(displayText);
            }
        };
        
        // 初始化
        container.updateProgress(value, maxValue);
        
        return container;
    }
    
    /**
     * 创建图标按钮
     */
    createIconButton(x, y, icon, options = {}) {
        const {
            size = 50,
            bgColor = 0x667EEA,
            onClick = () => {},
            tooltip = ''
        } = options;
        
        const container = this.scene.add.container(x, y);
        
        // 背景圆形
        const bg = this.scene.add.circle(0, 0, size/2, bgColor, 0.9);
        bg.setStrokeStyle(2, 0xFFFFFF, 0.5);
        
        // 图标
        const iconText = this.scene.add.text(0, 0, icon, {
            fontSize: `${size * 0.5}px`
        }).setOrigin(0.5);
        
        container.add([bg, iconText]);
        
        // 交互
        bg.setInteractive({ useHandCursor: true });
        
        bg.on('pointerover', () => {
            this.scene.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 100
            });
            
            // 显示提示
            if (tooltip && !container.tooltipText) {
                container.tooltipText = this.scene.add.text(0, size/2 + 20, tooltip, {
                    fontSize: '14px',
                    fill: '#FFFFFF',
                    fontFamily: 'Microsoft YaHei, Arial',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: { x: 8, y: 4 }
                }).setOrigin(0.5);
                container.add(container.tooltipText);
            }
        });
        
        bg.on('pointerout', () => {
            this.scene.tweens.add({
                targets: container,
                scale: 1,
                duration: 100
            });
            
            if (container.tooltipText) {
                container.tooltipText.destroy();
                container.tooltipText = null;
            }
        });
        
        bg.on('pointerdown', onClick);
        
        return container;
    }
    
    /**
     * 创建标签页组件
     */
    createTabs(x, y, tabs, options = {}) {
        const {
            tabWidth = 120,
            tabHeight = 40,
            activeColor = 0x667EEA,
            inactiveColor = 0x333333,
            onTabChange = () => {}
        } = options;
        
        const container = this.scene.add.container(x, y);
        const tabButtons = [];
        let activeIndex = 0;
        
        tabs.forEach((tab, index) => {
            const tabX = (index - (tabs.length - 1) / 2) * (tabWidth + 10);
            
            const bg = this.scene.add.rectangle(tabX, 0, tabWidth, tabHeight, 
                index === 0 ? activeColor : inactiveColor, 0.9);
            bg.setStrokeStyle(2, 0xFFFFFF, 0.3);
            
            const text = this.scene.add.text(tabX, 0, tab.label, {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5);
            
            bg.setInteractive({ useHandCursor: true });
            
            bg.on('pointerdown', () => {
                if (activeIndex === index) return;
                
                // 更新所有标签颜色
                tabButtons.forEach((btn, i) => {
                    btn.bg.setFillStyle(i === index ? activeColor : inactiveColor, 0.9);
                });
                
                activeIndex = index;
                onTabChange(index, tab);
            });
            
            container.add([bg, text]);
            tabButtons.push({ bg, text, tab });
        });
        
        return container;
    }
    
    /**
     * 创建通知弹窗
     */
    showNotification(message, options = {}) {
        const {
            type = 'info', // 'info', 'success', 'warning', 'error'
            duration = 3000,
            y = 100
        } = options;
        
        const colors = {
            info: 0x667EEA,
            success: 0x50E3C2,
            warning: 0xFFA500,
            error: 0xFF6B6B
        };
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        const width = this.scene.cameras.main.width;
        
        const container = this.scene.add.container(width / 2, -50);
        container.setDepth(1000);
        
        const bg = this.scene.add.rectangle(0, 0, 400, 60, colors[type], 0.95);
        bg.setStrokeStyle(2, 0xFFFFFF, 0.5);
        
        const text = this.scene.add.text(0, 0, `${icons[type]} ${message}`, {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        container.add([bg, text]);
        
        // 入场动画
        this.scene.tweens.add({
            targets: container,
            y: y,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // 自动消失
        this.scene.time.delayedCall(duration, () => {
            this.scene.tweens.add({
                targets: container,
                y: -50,
                alpha: 0,
                duration: 300,
                onComplete: () => container.destroy()
            });
        });
        
        return container;
    }
    
    /**
     * 创建确认对话框
     */
    showConfirmDialog(title, message, options = {}) {
        const {
            confirmText = '确认',
            cancelText = '取消',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;
        
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // 遮罩
        const overlay = this.scene.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        overlay.setDepth(999);
        overlay.setInteractive();
        
        // 对话框
        const dialog = this.scene.add.container(width/2, height/2);
        dialog.setDepth(1000);
        
        const bg = this.scene.add.rectangle(0, 0, 400, 250, 0x1a1a2e, 0.98);
        bg.setStrokeStyle(3, 0x667eea);
        
        const titleText = this.scene.add.text(0, -80, title, {
            fontSize: '28px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const messageText = this.scene.add.text(0, -20, message, {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            align: 'center',
            wordWrap: { width: 350 }
        }).setOrigin(0.5);
        
        // 按钮
        const confirmBtn = this.createGradientButton(-80, 70, confirmText, {
            width: 120,
            height: 45,
            colors: [0x50E3C2, 0x38A89D],
            onClick: () => {
                overlay.destroy();
                dialog.destroy();
                onConfirm();
            }
        });
        
        const cancelBtn = this.createGradientButton(80, 70, cancelText, {
            width: 120,
            height: 45,
            colors: [0xFF6B6B, 0xE55555],
            onClick: () => {
                overlay.destroy();
                dialog.destroy();
                onCancel();
            }
        });
        
        dialog.add([bg, titleText, messageText, confirmBtn, cancelBtn]);
        
        // 入场动画
        dialog.setScale(0);
        this.scene.tweens.add({
            targets: dialog,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        return { overlay, dialog };
    }
}

export default UIComponents;
