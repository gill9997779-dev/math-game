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
    static debug(...args) {
        if (this.shouldLog(this.levels.DEBUG)) {
            console.log('[DEBUG]', ...args);
        }
    }
    
    /**
     * 信息日志
     */
    static info(...args) {
        if (this.shouldLog(this.levels.INFO)) {
            console.log('[INFO]', ...args);
        }
    }
    
    /**
     * 警告日志
     */
    static warn(...args) {
        if (this.shouldLog(this.levels.WARN)) {
            console.warn('[WARN]', ...args);
        }
    }
    
    /**
     * 错误日志（始终显示）
     */
    static error(...args) {
        if (this.shouldLog(this.levels.ERROR)) {
            console.error('[ERROR]', ...args);
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
        
        // 检查是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        ('ontouchstart' in window) ||
                        (navigator.maxTouchPoints > 0);
        
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

