// Native Bridge for iOS App Integration
// 原生桥接系统 - 连接JavaScript和iOS原生功能

class NativeBridge {
    constructor() {
        this.isNativeApp = this.detectNativeApp();
        this.isIOS = this.detectIOS();
        this.capabilities = this.detectCapabilities();
        
        console.log('[NativeBridge] 初始化完成', {
            isNativeApp: this.isNativeApp,
            isIOS: this.isIOS,
            capabilities: this.capabilities
        });
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    // 检测是否在原生应用中运行
    detectNativeApp() {
        return !!(window.webkit && 
                 window.webkit.messageHandlers && 
                 window.webkit.messageHandlers.nativeApp);
    }
    
    // 检测是否为iOS设备
    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }
    
    // 检测设备能力
    detectCapabilities() {
        const capabilities = {
            hapticFeedback: this.isIOS && 'vibrate' in navigator,
            notifications: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            webShare: 'share' in navigator,
            deviceMotion: 'DeviceMotionEvent' in window,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            touchForce: 'TouchEvent' in window && 'force' in Touch.prototype,
            applePencil: this.isIOS && 'TouchEvent' in window
        };
        
        return capabilities;
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 监听来自原生应用的消息
        if (this.isNativeApp) {
            window.addEventListener('message', (event) => {
                this.handleNativeMessage(event.data);
            });
        }
        
        // 监听设备方向变化
        if (this.capabilities.deviceOrientation) {
            window.addEventListener('orientationchange', () => {
                this.handleOrientationChange();
            });
        }
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.handleNetworkChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleNetworkChange(false);
        });
    }
    
    // 发送消息到原生应用
    sendMessage(action, data = {}) {
        if (!this.isNativeApp) {
            console.log('[NativeBridge] 模拟原生功能:', action, data);
            return this.simulateNativeFeature(action, data);
        }
        
        try {
            const message = {
                action: action,
                timestamp: Date.now(),
                ...data
            };
            
            window.webkit.messageHandlers.nativeApp.postMessage(message);
            console.log('[NativeBridge] 消息已发送:', message);
            return true;
        } catch (error) {
            console.error('[NativeBridge] 发送消息失败:', error);
            return false;
        }
    }
    
    // 模拟原生功能（用于Web环境测试）
    simulateNativeFeature(action, data) {
        switch (action) {
            case 'hapticFeedback':
                return this.simulateHapticFeedback(data.type);
            case 'showNotification':
                return this.simulateNotification(data);
            case 'shareProgress':
                return this.simulateShare(data);
            case 'saveToPhotos':
                return this.simulateSaveToPhotos(data);
            default:
                console.log('[NativeBridge] 未知的模拟功能:', action);
                return false;
        }
    }
    
    // 触觉反馈
    triggerHaptic(type = 'light') {
        const success = this.sendMessage('hapticFeedback', { type });
        
        if (!success && this.capabilities.hapticFeedback) {
            // Web环境下的触觉反馈模拟
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                success: [10, 50, 10],
                warning: [20, 100, 20],
                error: [50, 100, 50]
            };
            
            if (navigator.vibrate && patterns[type]) {
                navigator.vibrate(patterns[type]);
            }
        }
        
        return success;
    }
    
    // 模拟触觉反馈
    simulateHapticFeedback(type) {
        if (this.capabilities.hapticFeedback) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                success: [10, 50, 10],
                warning: [20, 100, 20],
                error: [50, 100, 50]
            };
            
            if (navigator.vibrate && patterns[type]) {
                navigator.vibrate(patterns[type]);
                return true;
            }
        }
        return false;
    }
    
    // 推送通知
    scheduleNotification(title, body, options = {}) {
        const notificationData = {
            title,
            body,
            badge: options.badge || 1,
            sound: options.sound || 'default',
            delay: options.delay || 0,
            repeat: options.repeat || false,
            identifier: options.identifier || `notification_${Date.now()}`
        };
        
        return this.sendMessage('showNotification', notificationData);
    }
    
    // 模拟通知
    simulateNotification(data) {
        if (this.capabilities.notifications) {
            if (Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.body,
                    icon: '/icons/icon-96.png',
                    badge: '/icons/icon-96.png'
                });
                return true;
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(data.title, {
                            body: data.body,
                            icon: '/icons/icon-96.png'
                        });
                    }
                });
            }
        }
        return false;
    }
    
    // 分享功能
    shareProgress(text, url = '', title = '数道仙途') {
        const shareData = {
            title,
            text,
            url: url || window.location.href
        };
        
        // 优先使用原生分享
        if (this.sendMessage('shareProgress', shareData)) {
            return true;
        }
        
        // 使用Web Share API
        if (this.capabilities.webShare) {
            navigator.share(shareData).catch(error => {
                console.log('[NativeBridge] Web分享取消或失败:', error);
            });
            return true;
        }
        
        // 降级到复制到剪贴板
        return this.copyToClipboard(`${title}\n${text}\n${shareData.url}`);
    }
    
    // 模拟分享
    simulateShare(data) {
        if (this.capabilities.webShare) {
            navigator.share(data).catch(error => {
                console.log('[NativeBridge] 分享取消:', error);
            });
            return true;
        }
        
        // 降级处理
        return this.copyToClipboard(`${data.title}\n${data.text}\n${data.url}`);
    }
    
    // 复制到剪贴板
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('[NativeBridge] 已复制到剪贴板');
                return true;
            }).catch(error => {
                console.error('[NativeBridge] 复制失败:', error);
                return false;
            });
        } else {
            // 降级方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    }
    
    // 保存到相册
    saveToPhotos(imageData, filename = 'math_achievement.png') {
        return this.sendMessage('saveToPhotos', {
            imageData,
            filename,
            mimeType: 'image/png'
        });
    }
    
    // 模拟保存到相册
    simulateSaveToPhotos(data) {
        // Web环境下触发下载
        const link = document.createElement('a');
        link.download = data.filename;
        link.href = data.imageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    }
    
    // 获取设备信息
    getDeviceInfo() {
        const info = {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenWidth: screen.width,
            screenHeight: screen.height,
            pixelRatio: window.devicePixelRatio,
            isNativeApp: this.isNativeApp,
            isIOS: this.isIOS,
            capabilities: this.capabilities
        };
        
        if (this.isNativeApp) {
            this.sendMessage('getDeviceInfo', {}, (response) => {
                Object.assign(info, response);
            });
        }
        
        return info;
    }
    
    // 设置应用徽章
    setBadge(count = 0) {
        return this.sendMessage('setBadge', { count });
    }
    
    // 清除应用徽章
    clearBadge() {
        return this.setBadge(0);
    }
    
    // 处理来自原生应用的消息
    handleNativeMessage(data) {
        console.log('[NativeBridge] 收到原生消息:', data);
        
        switch (data.type) {
            case 'deviceInfo':
                this.handleDeviceInfo(data.payload);
                break;
            case 'orientationChange':
                this.handleOrientationChange(data.payload);
                break;
            case 'memoryWarning':
                this.handleMemoryWarning();
                break;
            case 'appStateChange':
                this.handleAppStateChange(data.payload);
                break;
            default:
                console.log('[NativeBridge] 未处理的消息类型:', data.type);
        }
    }
    
    // 处理设备信息
    handleDeviceInfo(info) {
        console.log('[NativeBridge] 设备信息更新:', info);
        // 可以根据设备信息调整游戏设置
        if (window.gameData) {
            window.gameData.deviceInfo = info;
        }
    }
    
    // 处理方向变化
    handleOrientationChange(orientation) {
        console.log('[NativeBridge] 设备方向变化:', orientation);
        
        // 通知游戏场景调整布局
        if (window.game && window.game.scene) {
            window.game.scene.scenes.forEach(scene => {
                if (scene.handleOrientationChange) {
                    scene.handleOrientationChange(orientation);
                }
            });
        }
    }
    
    // 处理内存警告
    handleMemoryWarning() {
        console.warn('[NativeBridge] 收到内存警告，开始清理');
        
        // 清理游戏缓存
        if (window.game && window.game.cache) {
            // 清理音频缓存
            window.game.cache.audio.entries.clear();
            // 清理JSON缓存
            window.game.cache.json.entries.clear();
        }
        
        // 强制垃圾回收
        if (window.gc) {
            window.gc();
        }
        
        // 通知游戏场景进行内存优化
        if (window.game && window.game.scene) {
            window.game.scene.scenes.forEach(scene => {
                if (scene.handleMemoryWarning) {
                    scene.handleMemoryWarning();
                }
            });
        }
    }
    
    // 处理应用状态变化
    handleAppStateChange(state) {
        console.log('[NativeBridge] 应用状态变化:', state);
        
        switch (state) {
            case 'background':
                // 应用进入后台，暂停游戏
                if (window.game && window.game.scene) {
                    window.game.scene.pause();
                }
                break;
            case 'foreground':
                // 应用回到前台，恢复游戏
                if (window.game && window.game.scene) {
                    window.game.scene.resume();
                }
                break;
        }
    }
    
    // 处理网络状态变化
    handleNetworkChange(isOnline) {
        console.log('[NativeBridge] 网络状态变化:', isOnline ? '在线' : '离线');
        
        // 更新游戏数据中的网络状态
        if (window.gameData) {
            window.gameData.isOnline = isOnline;
        }
        
        // 通知游戏场景网络状态变化
        if (window.game && window.game.scene) {
            window.game.scene.scenes.forEach(scene => {
                if (scene.handleNetworkChange) {
                    scene.handleNetworkChange(isOnline);
                }
            });
        }
        
        // 如果网络恢复，尝试同步数据
        if (isOnline && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                if (registration.sync) {
                    registration.sync.register('background-sync');
                }
            });
        }
    }
    
    // Apple Pencil 支持检测
    detectApplePencil(event) {
        if (this.capabilities.applePencil && event.touches) {
            for (let touch of event.touches) {
                if (touch.touchType === 'stylus') {
                    return {
                        isApplePencil: true,
                        force: touch.force || 0,
                        altitudeAngle: touch.altitudeAngle || 0,
                        azimuthAngle: touch.azimuthAngle || 0
                    };
                }
            }
        }
        return { isApplePencil: false };
    }
    
    // 获取触摸信息（包括Apple Pencil）
    getTouchInfo(event) {
        const touchInfo = {
            touches: [],
            isApplePencil: false
        };
        
        if (event.touches) {
            for (let touch of event.touches) {
                const info = {
                    x: touch.clientX,
                    y: touch.clientY,
                    force: touch.force || 0,
                    radiusX: touch.radiusX || 0,
                    radiusY: touch.radiusY || 0,
                    touchType: touch.touchType || 'direct'
                };
                
                if (touch.touchType === 'stylus') {
                    touchInfo.isApplePencil = true;
                    info.altitudeAngle = touch.altitudeAngle || 0;
                    info.azimuthAngle = touch.azimuthAngle || 0;
                }
                
                touchInfo.touches.push(info);
            }
        }
        
        return touchInfo;
    }
}

// 创建全局实例
window.NativeBridge = new NativeBridge();

// 导出类
export default NativeBridge;