/**
 * 日志管理系统
 * 统一管理所有日志输出，支持日志级别控制
 */
export class Logger {
    static levels = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    };
    
    static currentLevel = Logger.levels.INFO; // 默认只显示 INFO 及以上级别
    
    /**
     * 设置日志级别
     * @param {string} level - 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'
     */
    static setLevel(level) {
        if (typeof level === 'string') {
            this.currentLevel = this.levels[level.toUpperCase()] || this.levels.INFO;
        } else {
            this.currentLevel = level;
        }
    }
    
    /**
     * 检查是否应该输出日志
     * @param {number} level - 日志级别
     * @returns {boolean}
     */
    static shouldLog(level) {
        return level >= this.currentLevel;
    }
    
    /**
     * 调试日志（开发环境使用）
     */
    static debug() {
        if (this.shouldLog(this.levels.DEBUG)) {
            const args = Array.prototype.slice.call(arguments);
            console.log.apply(console, ['[DEBUG]'].concat(args));
        }
    }
    
    /**
     * 信息日志
     */
    static info() {
        if (this.shouldLog(this.levels.INFO)) {
            const args = Array.prototype.slice.call(arguments);
            console.log.apply(console, ['[INFO]'].concat(args));
        }
    }
    
    /**
     * 警告日志
     */
    static warn() {
        if (this.shouldLog(this.levels.WARN)) {
            const args = Array.prototype.slice.call(arguments);
            console.warn.apply(console, ['[WARN]'].concat(args));
        }
    }
    
    /**
     * 错误日志（始终显示）
     */
    static error() {
        if (this.shouldLog(this.levels.ERROR)) {
            const args = Array.prototype.slice.call(arguments);
            console.error.apply(console, ['[ERROR]'].concat(args));
        }
    }
    
    /**
     * 根据环境自动设置日志级别
     */
    static init() {
        // 检查是否为生产环境
        const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1' &&
                            !window.location.hostname.includes('dev');
        
        // 检查是否为移动设备（包括iPad）
        function detectMobileDevice() {
            const ua = navigator.userAgent;
            
            // 1. 直接检测移动设备标识
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
                return true;
            }
            
            // 2. 检测iPadOS 13+（User-Agent包含"Macintosh"和"Mobile"）
            if (/Macintosh/i.test(ua) && /Mobile/i.test(ua)) {
                return true;  // iPadOS 13+
            }
            
            // 3. 检测触摸支持（iPad有触摸屏）
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                // 进一步验证：检查屏幕尺寸（移动设备通常较小）
                const isSmallScreen = window.screen.width <= 1366 || window.screen.height <= 1024;
                if (isSmallScreen) {
                    return true;
                }
            }
            
            return false;
        }
        
        const isMobile = detectMobileDevice();
        
        if (isProduction || isMobile) {
            // 生产环境或移动设备：只显示 WARN 和 ERROR，减少性能开销
            this.setLevel('WARN');
        } else {
            // 开发环境（桌面）：显示所有日志
            this.setLevel('DEBUG');
        }
    }
}

// 自动初始化
if (typeof window !== 'undefined') {
    Logger.init();
}

