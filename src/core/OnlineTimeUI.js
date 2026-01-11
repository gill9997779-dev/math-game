// 在线时长UI显示组件
import { Logger } from './Logger.js';

/**
 * 在线时长UI组件
 * 功能：
 * - 显示实时在线时长
 * - 显示时长统计面板
 * - 显示里程碑进度
 * - 提供时长奖励界面
 */
export class OnlineTimeUI {
    constructor(scene, timeTracker) {
        this.scene = scene;
        this.timeTracker = timeTracker;
        
        // UI元素
        this.timeDisplay = null;
        this.statsPanel = null;
        this.milestonePanel = null;
        this.isStatsVisible = false;
        
        // 更新定时器
        this.updateTimer = null;
        
        this.init();
    }
    
    /**
     * 初始化UI
     */
    init() {
        this.createTimeDisplay();
        this.startUpdateTimer();
        
        Logger.info('OnlineTimeUI 初始化完成');
    }
    
    /**
     * 创建时长显示
     */
    createTimeDisplay() {
        const width = this.scene.cameras.main.width;
        
        // 时长显示容器（放在屏幕中上方，避免挡住左右两侧的按钮）
        this.timeContainer = this.scene.add.container(width / 2, 30);
        this.timeContainer.setDepth(1000);
        
        // 背景
        this.timeBg = this.scene.add.rectangle(0, 0, 140, 60, 0x1a1a2e, 0.9);
        this.timeBg.setStrokeStyle(2, 0x4a90e2, 0.8);
        this.timeBg.setInteractive({ useHandCursor: true });
        
        // 图标
        this.timeIcon = this.scene.add.text(-50, -15, '⏰', {
            fontSize: '16px'
        }).setOrigin(0.5);
        
        // 标题
        this.timeLabel = this.scene.add.text(-20, -15, '在线时长', {
            fontSize: '12px',
            fill: '#B8E986',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0, 0.5);
        
        // 时长文本
        this.timeText = this.scene.add.text(0, 8, '00:00:00', {
            fontSize: '14px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 状态指示器
        this.statusIndicator = this.scene.add.circle(55, -15, 4, 0x50e3c2, 1);
        
        this.timeContainer.add([
            this.timeBg, 
            this.timeIcon, 
            this.timeLabel, 
            this.timeText, 
            this.statusIndicator
        ]);
        
        // 点击事件
        this.timeBg.on('pointerdown', () => {
            this.toggleStatsPanel();
        });
        
        // 悬停效果
        this.timeBg.on('pointerover', () => {
            this.timeBg.setFillStyle(0x2a2a3e, 1);
            this.timeBg.setStrokeStyle(2, 0x667eea, 1);
        });
        
        this.timeBg.on('pointerout', () => {
            this.timeBg.setFillStyle(0x1a1a2e, 0.9);
            this.timeBg.setStrokeStyle(2, 0x4a90e2, 0.8);
        });
    }
    
    /**
     * 切换统计面板
     */
    toggleStatsPanel() {
        if (this.isStatsVisible) {
            this.hideStatsPanel();
        } else {
            this.showStatsPanel();
        }
    }
    
    /**
     * 显示统计面板
     */
    showStatsPanel() {
        if (this.statsPanel) {
            this.statsPanel.destroy();
        }
        
        this.createStatsPanel();
        this.isStatsVisible = true;
    }
    
    /**
     * 隐藏统计面板
     */
    hideStatsPanel() {
        if (this.statsPanel) {
            this.scene.tweens.add({
                targets: this.statsPanel,
                alpha: 0,
                scale: 0.8,
                duration: 200,
                onComplete: () => {
                    this.statsPanel.destroy();
                    this.statsPanel = null;
                }
            });
        }
        this.isStatsVisible = false;
    }
    
    /**
     * 创建统计面板
     */
    createStatsPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // 面板容器
        this.statsPanel = this.scene.add.container(width / 2, height / 2);
        this.statsPanel.setDepth(2000);
        
        // 背景遮罩
        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setInteractive();
        overlay.on('pointerdown', () => {
            this.hideStatsPanel();
        });
        
        // 面板背景 - 增加高度以容纳所有内容
        const panelBg = this.scene.add.rectangle(0, 0, 600, 600, 0x1a1a2e, 0.95);
        panelBg.setStrokeStyle(3, 0x4a90e2);
        
        // 标题
        const title = this.scene.add.text(0, -270, '📊 在线时长统计', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 关闭按钮
        const closeBtn = this.scene.add.text(280, -270, '✕', {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            this.hideStatsPanel();
        });
        
        this.statsPanel.add([overlay, panelBg, title, closeBtn]);
        
        // 创建统计内容
        this.createStatsContent();
        
        // 入场动画
        this.statsPanel.setScale(0.8);
        this.statsPanel.setAlpha(0);
        this.scene.tweens.add({
            targets: this.statsPanel,
            scale: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * 创建统计内容
     */
    createStatsContent() {
        const stats = this.timeTracker.getFormattedStats();
        const milestones = this.timeTracker.getMilestoneProgress();
        
        let currentY = -220;
        
        // 基础统计 - 改为单列垂直布局
        const basicStats = [
            { label: '总在线时长', value: stats.totalOnlineTime, icon: '🕐' },
            { label: '今日在线', value: stats.dailyOnlineTime, icon: '📅' },
            { label: '本次会话', value: stats.currentSessionTime, icon: '⏱️' },
            { label: '平均每日', value: stats.averageDailyTime, icon: '📊' },
            { label: '游戏天数', value: `${stats.totalDays}天`, icon: '🗓️' }
        ];
        
        basicStats.forEach((stat, index) => {
            const y = currentY + index * 38;
            
            // 图标
            const icon = this.scene.add.text(-240, y, stat.icon, {
                fontSize: '16px'
            }).setOrigin(0.5);
            
            // 标签
            const label = this.scene.add.text(-200, y, stat.label, {
                fontSize: '14px',
                fill: '#CCCCCC',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0, 0.5);
            
            // 数值
            const value = this.scene.add.text(240, y, stat.value, {
                fontSize: '14px',
                fill: '#50E3C2',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(1, 0.5);
            
            this.statsPanel.add([icon, label, value]);
        });
        
        currentY += 200;
        
        // 分隔线
        const divider = this.scene.add.rectangle(0, currentY, 500, 2, 0x4a90e2, 0.3);
        this.statsPanel.add(divider);
        
        currentY += 30;
        
        // 里程碑进度
        const milestoneTitle = this.scene.add.text(0, currentY, '🏆 里程碑进度', {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.statsPanel.add(milestoneTitle);
        currentY += 35;
        
        // 显示前3个里程碑
        milestones.slice(0, 3).forEach((milestone, index) => {
            const y = currentY + index * 50;
            
            // 里程碑图标
            const icon = this.scene.add.text(-240, y, milestone.achieved ? '🏆' : '⏳', {
                fontSize: '16px'
            }).setOrigin(0.5);
            
            // 里程碑名称
            const name = this.scene.add.text(-200, y, milestone.name, {
                fontSize: '13px',
                fill: milestone.achieved ? '#FFD700' : '#CCCCCC',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0, 0.5);
            
            // 进度条背景
            const progressBg = this.scene.add.rectangle(0, y + 15, 400, 10, 0x333333, 0.8);
            
            // 进度条
            const progressWidth = 400 * milestone.progress;
            const progressBar = this.scene.add.rectangle(-200 + progressWidth / 2, y + 15, progressWidth, 8, 
                milestone.achieved ? 0x50e3c2 : 0x4a90e2, 1);
            
            // 进度文本
            const progressText = this.scene.add.text(0, y + 15, 
                milestone.achieved ? '✓ 已完成' : `${Math.floor(milestone.progress * 100)}%`, {
                fontSize: '11px',
                fill: milestone.achieved ? '#50e3c2' : '#FFFFFF',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            
            this.statsPanel.add([icon, name, progressBg, progressBar, progressText]);
        });
    }
    
    /**
     * 启动更新定时器
     */
    startUpdateTimer() {
        this.updateTimer = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }
    
    /**
     * 停止更新定时器
     */
    stopUpdateTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    
    /**
     * 更新显示
     */
    updateDisplay() {
        if (!this.timeText || !this.timeTracker) return;
        
        const stats = this.timeTracker.getTimeStats();
        
        // 更新时长显示
        const hours = Math.floor(stats.currentSessionTime / 3600);
        const minutes = Math.floor((stats.currentSessionTime % 3600) / 60);
        const seconds = stats.currentSessionTime % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeText.setText(timeString);
        
        // 更新状态指示器
        if (stats.isActive) {
            this.statusIndicator.setFillStyle(0x50e3c2, 1); // 绿色：活跃
        } else {
            this.statusIndicator.setFillStyle(0xf5a623, 1); // 橙色：AFK
        }
        
        // 更新统计面板（如果显示中）
        if (this.isStatsVisible && this.statsPanel) {
            // 可以在这里更新统计面板的实时数据
        }
    }
    
    /**
     * 显示里程碑通知
     */
    showMilestoneNotification(milestone) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // 通知容器
        const notification = this.scene.add.container(width / 2, -100);
        notification.setDepth(3000);
        
        // 通知背景
        const notificationBg = this.scene.add.rectangle(0, 0, 400, 80, 0x1a1a2e, 0.95);
        notificationBg.setStrokeStyle(3, 0xFFD700);
        
        // 图标
        const icon = this.scene.add.text(-150, 0, '🏆', {
            fontSize: '32px'
        }).setOrigin(0.5);
        
        // 标题
        const title = this.scene.add.text(-50, -15, milestone.name, {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        // 描述
        const desc = this.scene.add.text(-50, 10, milestone.desc, {
            fontSize: '14px',
            fill: '#CCCCCC',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0, 0.5);
        
        notification.add([notificationBg, icon, title, desc]);
        
        // 动画：从上方滑入
        this.scene.tweens.add({
            targets: notification,
            y: 100,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // 3秒后自动消失
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: notification,
                y: -100,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
    
    /**
     * 设置位置
     */
    setPosition(x, y) {
        if (this.timeContainer) {
            this.timeContainer.x = x;
            this.timeContainer.y = y;
        }
    }
    
    /**
     * 设置可见性
     */
    setVisible(visible) {
        if (this.timeContainer) {
            this.timeContainer.setVisible(visible);
        }
    }
    
    /**
     * 销毁UI
     */
    destroy() {
        this.stopUpdateTimer();
        
        if (this.timeContainer) {
            this.timeContainer.destroy();
        }
        
        if (this.statsPanel) {
            this.statsPanel.destroy();
        }
        
        Logger.info('OnlineTimeUI 已销毁');
    }
}
