// 增强的游戏场景 - 集成iOS原生功能
// Enhanced Game Scene with iOS Native Integration

import { Player } from '../core/Player.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

export class EnhancedGameScene extends Scene {
    constructor() {
        super({ key: 'EnhancedGameScene' });
        
        // iOS特定属性
        this.nativeBridge = null;
        this.hapticEnabled = false;
        this.applePencilSupported = false;
        this.touchInfo = null;
    }
    
    create(data = {}) {
        console.log('🎮 创建增强游戏场景...');
        
        // 初始化原生桥接
        this.initNativeBridge();
        
        // 创建基础UI
        this.createBaseUI();
        
        // 创建iOS增强功能演示
        this.createIOSFeatureDemo();
        
        // 设置输入处理
        this.setupInputHandling();
        
        // 触发场景创建完成的触觉反馈
        this.triggerHaptic('light');
    }
    
    // 初始化原生桥接
    initNativeBridge() {
        this.nativeBridge = window.NativeBridge;
        
        if (this.nativeBridge) {
            this.hapticEnabled = this.nativeBridge.capabilities.hapticFeedback;
            this.applePencilSupported = this.nativeBridge.capabilities.applePencil;
            
            console.log('原生桥接已连接', {
                isNativeApp: this.nativeBridge.isNativeApp,
                isIOS: this.nativeBridge.isIOS,
                hapticEnabled: this.hapticEnabled,
                applePencilSupported: this.applePencilSupported
            });
        } else {
            console.log('原生桥接不可用，使用Web模式');
        }
    }
    
    // 创建基础UI
    createBaseUI() {
        const { width, height } = this.getSafeCameraDimensions();
        
        // 背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f23);
        
        // 标题
        this.add.text(width / 2, 100, '数道仙途 iOS增强版', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#4facfe',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // 状态信息
        const statusY = 180;
        const statusInfo = [
            `设备类型: ${this.nativeBridge?.isIOS ? 'iOS' : '其他'}`,
            `原生应用: ${this.nativeBridge?.isNativeApp ? '是' : '否'}`,
            `触觉反馈: ${this.hapticEnabled ? '支持' : '不支持'}`,
            `Apple Pencil: ${this.applePencilSupported ? '支持' : '不支持'}`,
            `网络状态: ${window.gameData.isOnline ? '在线' : '离线'}`
        ];
        
        statusInfo.forEach((info, index) => {
            this.add.text(width / 2, statusY + index * 30, info, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0.5);
        });
    }
    
    // 创建iOS功能演示
    createIOSFeatureDemo() {
        const { width, height } = this.getSafeCameraDimensions();
        
        // 功能按钮区域
        const buttonY = height / 2;
        const buttonSpacing = 80;
        
        // 触觉反馈测试按钮
        this.createFeatureButton(width / 2 - 150, buttonY, '触觉反馈', () => {
            this.testHapticFeedback();
        });
        
        // 分享功能按钮
        this.createFeatureButton(width / 2, buttonY, '分享进度', () => {
            this.shareProgress();
        });
        
        // 通知测试按钮
        this.createFeatureButton(width / 2 + 150, buttonY, '测试通知', () => {
            this.testNotification();
        });
        
        // Apple Pencil绘图区域
        if (this.applePencilSupported) {
            this.createDrawingArea(width / 2, buttonY + 100);
        }
        
        // 性能监控显示
        this.createPerformanceMonitor(50, height - 150);
    }
    
    // 创建功能按钮
    createFeatureButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 120, 50, 0x4facfe)
            .setInteractive()
            .on('pointerdown', () => {
                // 按钮按下效果
                button.setScale(0.95);
                this.triggerHaptic('medium');
                callback();
            })
            .on('pointerup', () => {
                button.setScale(1);
            })
            .on('pointerover', () => {
                button.setFillStyle(0x00f2fe);
                this.triggerHaptic('light');
            })
            .on('pointerout', () => {
                button.setFillStyle(0x4facfe);
            });
        
        this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        return button;
    }
    
    // 测试触觉反馈
    testHapticFeedback() {
        const hapticTypes = ['light', 'medium', 'heavy', 'success', 'warning', 'error'];
        let currentIndex = 0;
        
        const testNext = () => {
            if (currentIndex < hapticTypes.length) {
                const type = hapticTypes[currentIndex];
                console.log(`测试触觉反馈: ${type}`);
                this.triggerHaptic(type);
                
                // 显示当前测试的类型
                this.showMessage(`触觉反馈: ${type}`, 1000);
                
                currentIndex++;
                setTimeout(testNext, 1200);
            } else {
                this.showMessage('触觉反馈测试完成！', 2000);
            }
        };
        
        testNext();
    }
    
    // 分享进度
    shareProgress() {
        const player = window.gameData.player || { level: 1, realm: '炼气' };
        const shareText = `我在数道仙途中达到了${player.realm}境界第${player.level}层！快来一起修炼数学吧！`;
        
        if (this.nativeBridge) {
            this.nativeBridge.shareProgress(shareText);
            this.showMessage('分享成功！', 2000);
            this.triggerHaptic('success');
        } else {
            // Web环境下的分享
            if (navigator.share) {
                navigator.share({
                    title: '数道仙途',
                    text: shareText,
                    url: window.location.href
                }).then(() => {
                    this.showMessage('分享成功！', 2000);
                }).catch(() => {
                    this.showMessage('分享取消', 1000);
                });
            } else {
                // 复制到剪贴板
                navigator.clipboard.writeText(shareText).then(() => {
                    this.showMessage('已复制到剪贴板！', 2000);
                });
            }
        }
    }
    
    // 测试通知
    testNotification() {
        if (this.nativeBridge) {
            this.nativeBridge.scheduleNotification(
                '数道仙途提醒',
                '你的修仙之路还在继续，快来完成今日的数学挑战吧！',
                { delay: 5000 } // 5秒后显示
            );
            this.showMessage('通知已安排（5秒后）', 2000);
            this.triggerHaptic('success');
        } else {
            // Web通知
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification('数道仙途提醒', {
                        body: '你的修仙之路还在继续！',
                        icon: '/icons/icon-96.png'
                    });
                    this.showMessage('通知已发送！', 2000);
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('数道仙途提醒', {
                                body: '你的修仙之路还在继续！',
                                icon: '/icons/icon-96.png'
                            });
                            this.showMessage('通知已发送！', 2000);
                        }
                    });
                }
            } else {
                this.showMessage('浏览器不支持通知', 2000);
            }
        }
    }
    
    // 创建Apple Pencil绘图区域
    createDrawingArea(x, y) {
        const drawingArea = this.add.rectangle(x, y, 300, 150, 0x1a1a2e, 0.8)
            .setStrokeStyle(2, 0x4facfe);
        
        this.add.text(x, y - 60, 'Apple Pencil 绘图区域', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#4facfe'
        }).setOrigin(0.5);
        
        // 绘图图形容器
        this.drawingGraphics = this.add.graphics();
        this.isDrawing = false;
        this.lastDrawPoint = null;
        
        // 设置绘图区域交互
        drawingArea.setInteractive();
        
        drawingArea.on('pointerdown', (pointer, localX, localY) => {
            this.startDrawing(pointer, localX + x - 150, localY + y - 75);
        });
        
        drawingArea.on('pointermove', (pointer, localX, localY) => {
            this.continueDrawing(pointer, localX + x - 150, localY + y - 75);
        });
        
        drawingArea.on('pointerup', () => {
            this.stopDrawing();
        });
        
        // 清除按钮
        this.createFeatureButton(x + 120, y + 100, '清除', () => {
            this.clearDrawing();
        });
    }
    
    // 开始绘图
    startDrawing(pointer, x, y) {
        this.isDrawing = true;
        this.lastDrawPoint = { x, y };
        
        // 检测Apple Pencil
        if (this.nativeBridge && pointer.event) {
            this.touchInfo = this.nativeBridge.getTouchInfo(pointer.event);
            if (this.touchInfo.isApplePencil) {
                console.log('检测到Apple Pencil绘图');
                this.triggerHaptic('light');
            }
        }
    }
    
    // 继续绘图
    continueDrawing(pointer, x, y) {
        if (!this.isDrawing || !this.lastDrawPoint) return;
        
        // 根据压力调整线条粗细（Apple Pencil支持）
        let lineWidth = 2;
        if (this.touchInfo && this.touchInfo.isApplePencil && pointer.event.touches) {
            const touch = pointer.event.touches[0];
            if (touch && touch.force) {
                lineWidth = 1 + touch.force * 4; // 1-5像素
            }
        }
        
        // 绘制线条
        this.drawingGraphics.lineStyle(lineWidth, 0x4facfe, 0.8);
        this.drawingGraphics.beginPath();
        this.drawingGraphics.moveTo(this.lastDrawPoint.x, this.lastDrawPoint.y);
        this.drawingGraphics.lineTo(x, y);
        this.drawingGraphics.strokePath();
        
        this.lastDrawPoint = { x, y };
    }
    
    // 停止绘图
    stopDrawing() {
        this.isDrawing = false;
        this.lastDrawPoint = null;
        this.touchInfo = null;
    }
    
    // 清除绘图
    clearDrawing() {
        if (this.drawingGraphics) {
            this.drawingGraphics.clear();
            this.triggerHaptic('medium');
        }
    }
    
    // 创建性能监控显示
    createPerformanceMonitor(x, y) {
        this.performanceText = this.add.text(x, y, '', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        // 定期更新性能信息
        this.time.addEvent({
            delay: 1000,
            callback: this.updatePerformanceDisplay,
            callbackScope: this,
            loop: true
        });
    }
    
    // 更新性能显示
    updatePerformanceDisplay() {
        const metrics = window.gameData.performanceMetrics;
        const performanceInfo = [
            `FPS: ${metrics.fps}`,
            `内存: ${metrics.memoryUsage}MB`,
            `加载时间: ${metrics.loadTime}ms`
        ].join('\n');
        
        if (this.performanceText) {
            this.performanceText.setText(performanceInfo);
        }
    }
    
    // 设置输入处理
    setupInputHandling() {
        // 键盘输入
        this.input.keyboard.on('keydown', (event) => {
            switch (event.code) {
                case 'KeyH':
                    this.testHapticFeedback();
                    break;
                case 'KeyS':
                    this.shareProgress();
                    break;
                case 'KeyN':
                    this.testNotification();
                    break;
                case 'Escape':
                    this.scene.start('MainMenuScene');
                    break;
            }
        });
        
        // 手势识别（移动端）
        if (this.nativeBridge && this.nativeBridge.isIOS) {
            this.setupGestureRecognition();
        }
    }
    
    // 设置手势识别
    setupGestureRecognition() {
        let touchStartTime = 0;
        let touchStartPos = null;
        
        this.input.on('pointerdown', (pointer) => {
            touchStartTime = Date.now();
            touchStartPos = { x: pointer.x, y: pointer.y };
        });
        
        this.input.on('pointerup', (pointer) => {
            const touchDuration = Date.now() - touchStartTime;
            const touchDistance = Phaser.Math.Distance.Between(
                touchStartPos.x, touchStartPos.y,
                pointer.x, pointer.y
            );
            
            // 长按检测
            if (touchDuration > 1000 && touchDistance < 50) {
                this.handleLongPress(pointer);
            }
            
            // 快速点击检测
            if (touchDuration < 200 && touchDistance < 20) {
                this.handleQuickTap(pointer);
            }
        });
    }
    
    // 处理长按
    handleLongPress(pointer) {
        console.log('检测到长按手势');
        this.triggerHaptic('heavy');
        this.showMessage('长按手势识别', 1000);
    }
    
    // 处理快速点击
    handleQuickTap(pointer) {
        console.log('检测到快速点击');
        this.triggerHaptic('light');
    }
    
    // 触发触觉反馈
    triggerHaptic(type = 'light') {
        if (this.nativeBridge && this.hapticEnabled) {
            this.nativeBridge.triggerHaptic(type);
        }
    }
    
    // 显示消息
    showMessage(text, duration = 2000) {
        const { width, height } = this.getSafeCameraDimensions();
        
        const messageText = this.add.text(width / 2, height - 100, text, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#4facfe',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // 淡入效果
        messageText.setAlpha(0);
        this.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // 自动消失
        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: messageText,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    messageText.destroy();
                }
            });
        });
    }
    
    // 安全获取相机尺寸
    getSafeCameraDimensions() {
        if (!this.cameras || !this.cameras.main) {
            return { width: 800, height: 600 };
        }
        return {
            width: this.cameras.main.width,
            height: this.cameras.main.height
        };
    }
    
    // 处理网络状态变化
    handleNetworkChange(isOnline) {
        console.log('网络状态变化:', isOnline ? '在线' : '离线');
        this.showMessage(
            isOnline ? '网络已连接' : '网络已断开',
            2000
        );
        this.triggerHaptic(isOnline ? 'success' : 'warning');
    }
    
    // 处理内存警告
    handleMemoryWarning() {
        console.warn('收到内存警告，开始清理');
        
        // 清理绘图缓存
        if (this.drawingGraphics) {
            this.drawingGraphics.clear();
        }
        
        // 清理不必要的纹理
        this.textures.each((texture) => {
            if (!texture.source[0].image.complete) {
                this.textures.remove(texture.key);
            }
        });
        
        this.showMessage('内存优化完成', 2000);
        this.triggerHaptic('medium');
    }
    
    // 场景销毁时的清理
    destroy() {
        // 清理事件监听
        if (this.input.keyboard) {
            this.input.keyboard.removeAllListeners();
        }
        
        // 清理绘图
        if (this.drawingGraphics) {
            this.drawingGraphics.destroy();
        }
        
        super.destroy();
    }
}

export default EnhancedGameScene;