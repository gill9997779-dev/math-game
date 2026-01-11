// 在线时长记录系统
import { Logger } from './Logger.js';

/**
 * 在线时长追踪器
 * 功能：
 * - 记录总在线时长
 * - 记录每日在线时长
 * - 记录连续在线时长
 * - 提供时长奖励
 * - 统计分析功能
 */
export class OnlineTimeTracker {
    constructor() {
        this.sessionStartTime = null;
        this.totalOnlineTime = 0; // 总在线时长（秒）
        this.dailyOnlineTime = 0; // 今日在线时长（秒）
        this.currentSessionTime = 0; // 当前会话时长（秒）
        this.lastActiveTime = Date.now();
        this.isActive = true;
        this.afkThreshold = 5 * 60 * 1000; // 5分钟无操作视为AFK
        
        // 时长记录
        this.timeRecords = {
            daily: {}, // 每日时长记录 { '2024-01-01': 3600 }
            weekly: {}, // 每周时长记录
            monthly: {} // 每月时长记录
        };
        
        // 里程碑奖励
        this.milestones = [
            { time: 30 * 60, reward: { exp: 50, coins: 10 }, name: '初学者', desc: '在线30分钟' },
            { time: 60 * 60, reward: { exp: 100, coins: 25 }, name: '专注者', desc: '在线1小时' },
            { time: 2 * 60 * 60, reward: { exp: 200, coins: 50 }, name: '勤奋者', desc: '在线2小时' },
            { time: 4 * 60 * 60, reward: { exp: 400, coins: 100 }, name: '学霸', desc: '在线4小时' },
            { time: 8 * 60 * 60, reward: { exp: 800, coins: 200 }, name: '修炼狂人', desc: '在线8小时' }
        ];
        
        this.achievedMilestones = new Set();
        
        // 定时器
        this.updateTimer = null;
        this.saveTimer = null;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化时长追踪器
     */
    init() {
        this.loadTimeData();
        this.startSession();
        this.setupEventListeners();
        this.startTimers();
        
        Logger.info('OnlineTimeTracker 初始化完成');
    }
    
    /**
     * 开始新会话
     */
    startSession() {
        this.sessionStartTime = Date.now();
        this.currentSessionTime = 0;
        this.lastActiveTime = Date.now();
        this.isActive = true;
        
        Logger.info('开始新的在线会话');
    }
    
    /**
     * 结束当前会话
     */
    endSession() {
        if (this.sessionStartTime) {
            const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            this.addOnlineTime(sessionDuration);
            this.saveTimeData();
            
            Logger.info(`会话结束，本次在线时长: ${this.formatTime(sessionDuration)}`);
        }
        
        this.stopTimers();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听用户活动
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            }, { passive: true });
        });
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });
        
        // 监听页面卸载
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // 监听页面失焦/获焦
        window.addEventListener('blur', () => {
            this.handlePageHidden();
        });
        
        window.addEventListener('focus', () => {
            this.handlePageVisible();
        });
    }
    
    /**
     * 更新用户活动状态
     */
    updateActivity() {
        this.lastActiveTime = Date.now();
        
        if (!this.isActive) {
            this.isActive = true;
            this.sessionStartTime = Date.now() - this.currentSessionTime * 1000;
            Logger.info('用户重新活跃，恢复时长记录');
        }
    }
    
    /**
     * 处理页面隐藏
     */
    handlePageHidden() {
        if (this.isActive) {
            this.pauseTracking();
        }
    }
    
    /**
     * 处理页面显示
     */
    handlePageVisible() {
        this.resumeTracking();
    }
    
    /**
     * 暂停时长追踪
     */
    pauseTracking() {
        if (this.sessionStartTime && this.isActive) {
            const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            this.currentSessionTime = sessionDuration;
            this.isActive = false;
            
            Logger.info('暂停时长追踪');
        }
    }
    
    /**
     * 恢复时长追踪
     */
    resumeTracking() {
        if (!this.isActive) {
            this.sessionStartTime = Date.now() - this.currentSessionTime * 1000;
            this.lastActiveTime = Date.now();
            this.isActive = true;
            
            Logger.info('恢复时长追踪');
        }
    }
    
    /**
     * 启动定时器
     */
    startTimers() {
        // 每秒更新一次时长
        this.updateTimer = setInterval(() => {
            this.updateTime();
        }, 1000);
        
        // 每5分钟保存一次数据
        this.saveTimer = setInterval(() => {
            this.saveTimeData();
        }, 5 * 60 * 1000);
    }
    
    /**
     * 停止定时器
     */
    stopTimers() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }
    
    /**
     * 更新时长
     */
    updateTime() {
        if (!this.isActive || !this.sessionStartTime) return;
        
        // 检查是否AFK
        const timeSinceLastActivity = Date.now() - this.lastActiveTime;
        if (timeSinceLastActivity > this.afkThreshold) {
            this.pauseTracking();
            return;
        }
        
        // 更新当前会话时长
        this.currentSessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        
        // 检查里程碑
        this.checkMilestones();
    }
    
    /**
     * 添加在线时长
     */
    addOnlineTime(seconds) {
        this.totalOnlineTime += seconds;
        this.dailyOnlineTime += seconds;
        
        // 更新日期记录
        const today = this.getDateString();
        if (!this.timeRecords.daily[today]) {
            this.timeRecords.daily[today] = 0;
        }
        this.timeRecords.daily[today] += seconds;
        
        // 更新周记录
        const week = this.getWeekString();
        if (!this.timeRecords.weekly[week]) {
            this.timeRecords.weekly[week] = 0;
        }
        this.timeRecords.weekly[week] += seconds;
        
        // 更新月记录
        const month = this.getMonthString();
        if (!this.timeRecords.monthly[month]) {
            this.timeRecords.monthly[month] = 0;
        }
        this.timeRecords.monthly[month] += seconds;
    }
    
    /**
     * 检查里程碑奖励
     */
    checkMilestones() {
        const currentTotal = this.totalOnlineTime + this.currentSessionTime;
        
        this.milestones.forEach((milestone, index) => {
            const milestoneKey = `milestone_${index}`;
            
            if (currentTotal >= milestone.time && !this.achievedMilestones.has(milestoneKey)) {
                this.achievedMilestones.add(milestoneKey);
                this.grantMilestoneReward(milestone);
            }
        });
    }
    
    /**
     * 授予里程碑奖励
     */
    grantMilestoneReward(milestone) {
        Logger.info(`达成在线时长里程碑: ${milestone.name} - ${milestone.desc}`);
        
        // 发放奖励
        if (window.gameData && window.gameData.player) {
            const player = window.gameData.player;
            
            if (milestone.reward.exp) {
                player.gainExp(milestone.reward.exp);
            }
            
            if (milestone.reward.coins) {
                player.coins = (player.coins || 0) + milestone.reward.coins;
            }
        }
        
        // 显示奖励通知
        this.showMilestoneNotification(milestone);
    }
    
    /**
     * 显示里程碑通知
     */
    showMilestoneNotification(milestone) {
        // 如果有当前场景，显示通知
        if (window.game && window.game.scene && window.game.scene.scenes.length > 0) {
            const currentScene = window.game.scene.scenes.find(scene => scene.scene.isActive());
            
            if (currentScene && typeof currentScene.showNotification === 'function') {
                currentScene.showNotification({
                    title: `🏆 ${milestone.name}`,
                    message: milestone.desc,
                    type: 'milestone',
                    duration: 5000
                });
            }
        }
        
        // 浏览器通知（如果用户允许）
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`数道仙途 - ${milestone.name}`, {
                body: milestone.desc,
                icon: '/favicon.ico'
            });
        }
    }
    
    /**
     * 获取当前在线时长统计
     */
    getTimeStats() {
        const currentSession = this.isActive ? this.currentSessionTime : 0;
        const today = this.getDateString();
        const todayTotal = (this.timeRecords.daily[today] || 0) + currentSession;
        
        return {
            totalOnlineTime: this.totalOnlineTime + currentSession,
            dailyOnlineTime: todayTotal,
            currentSessionTime: currentSession,
            isActive: this.isActive,
            lastActiveTime: this.lastActiveTime,
            milestones: this.getMilestoneProgress(),
            records: {
                daily: this.timeRecords.daily,
                weekly: this.timeRecords.weekly,
                monthly: this.timeRecords.monthly
            }
        };
    }
    
    /**
     * 获取里程碑进度
     */
    getMilestoneProgress() {
        const currentTotal = this.totalOnlineTime + this.currentSessionTime;
        
        return this.milestones.map((milestone, index) => {
            const milestoneKey = `milestone_${index}`;
            const achieved = this.achievedMilestones.has(milestoneKey);
            const progress = Math.min(currentTotal / milestone.time, 1.0);
            
            return {
                ...milestone,
                achieved,
                progress,
                timeRemaining: achieved ? 0 : milestone.time - currentTotal
            };
        });
    }
    
    /**
     * 获取格式化的时长统计
     */
    getFormattedStats() {
        const stats = this.getTimeStats();
        
        return {
            totalOnlineTime: this.formatTime(stats.totalOnlineTime),
            dailyOnlineTime: this.formatTime(stats.dailyOnlineTime),
            currentSessionTime: this.formatTime(stats.currentSessionTime),
            averageDailyTime: this.formatTime(this.getAverageDailyTime()),
            longestSession: this.formatTime(this.getLongestSession()),
            totalDays: this.getTotalDays(),
            isActive: stats.isActive
        };
    }
    
    /**
     * 格式化时间显示
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}秒`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}分${remainingSeconds}秒`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            
            if (hours < 24) {
                return `${hours}小时${minutes}分${remainingSeconds}秒`;
            } else {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                return `${days}天${remainingHours}小时${minutes}分`;
            }
        }
    }
    
    /**
     * 获取平均每日在线时长
     */
    getAverageDailyTime() {
        const dailyTimes = Object.values(this.timeRecords.daily);
        if (dailyTimes.length === 0) return 0;
        
        const total = dailyTimes.reduce((sum, time) => sum + time, 0);
        return Math.floor(total / dailyTimes.length);
    }
    
    /**
     * 获取最长单次会话时长
     */
    getLongestSession() {
        // 这里可以扩展记录每次会话的时长
        return Math.max(this.currentSessionTime, this.dailyOnlineTime);
    }
    
    /**
     * 获取总游戏天数
     */
    getTotalDays() {
        return Object.keys(this.timeRecords.daily).length;
    }
    
    /**
     * 获取日期字符串
     */
    getDateString(date = new Date()) {
        return date.toISOString().split('T')[0];
    }
    
    /**
     * 获取周字符串
     */
    getWeekString(date = new Date()) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }
    
    /**
     * 获取月字符串
     */
    getMonthString(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return `${year}-${month.toString().padStart(2, '0')}`;
    }
    
    /**
     * 获取周数
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    /**
     * 保存时长数据
     */
    saveTimeData() {
        try {
            const data = {
                totalOnlineTime: this.totalOnlineTime,
                timeRecords: this.timeRecords,
                achievedMilestones: Array.from(this.achievedMilestones),
                lastSaveTime: Date.now()
            };
            
            // 保存到本地存储
            const username = window.gameData?.username || 'default';
            localStorage.setItem(`onlineTime_${username}`, JSON.stringify(data));
            
            // 如果有云端保存功能，也保存到云端
            this.saveToCloud(data);
            
        } catch (error) {
            Logger.error('保存在线时长数据失败:', error);
        }
    }
    
    /**
     * 加载时长数据
     */
    loadTimeData() {
        try {
            const username = window.gameData?.username || 'default';
            const savedData = localStorage.getItem(`onlineTime_${username}`);
            
            if (savedData) {
                const data = JSON.parse(savedData);
                
                this.totalOnlineTime = data.totalOnlineTime || 0;
                this.timeRecords = data.timeRecords || { daily: {}, weekly: {}, monthly: {} };
                this.achievedMilestones = new Set(data.achievedMilestones || []);
                
                // 重置今日时长（新的一天）
                const today = this.getDateString();
                this.dailyOnlineTime = this.timeRecords.daily[today] || 0;
                
                Logger.info('在线时长数据加载成功');
            }
            
        } catch (error) {
            Logger.error('加载在线时长数据失败:', error);
        }
    }
    
    /**
     * 保存到云端
     */
    async saveToCloud(data) {
        try {
            if (window.gameData?.username) {
                const response = await fetch('/api/save-online-time', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        playerId: window.gameData.username,
                        timeData: data
                    })
                });
                
                if (response.ok) {
                    Logger.debug('在线时长数据已保存到云端');
                }
            }
        } catch (error) {
            Logger.debug('云端保存失败，仅保存到本地:', error.message);
        }
    }
    
    /**
     * 请求通知权限
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                Logger.info('通知权限状态:', permission);
            });
        }
    }
    
    /**
     * 销毁追踪器
     */
    destroy() {
        this.endSession();
        this.stopTimers();
        
        // 移除事件监听器
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.removeEventListener(event, this.updateActivity);
        });
        
        Logger.info('OnlineTimeTracker 已销毁');
    }
}
