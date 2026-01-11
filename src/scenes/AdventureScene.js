/**
 * 冒险场景 - 使用BaseScene重构
 */
import { BaseScene } from '../core/BaseScene.js';
import * as Layout from '../core/LayoutConfig.js';

export class AdventureScene extends BaseScene {
    constructor() {
        super({ key: 'AdventureScene' });
        this.isModal = true;
        this.dialogElements = [];
    }
    
    create() {
        this.preCreate();
        
        this.player = window.gameData?.player;
        this.zoneManager = window.gameData?.zoneManager;
        
        // 布局参数
        this.layout = {
            headerY: 60,
            subtitleY: 100,
            buttonStartY: 170,
            buttonHeight: 90,
            buttonGap: 15,
            buttonWidth: this.width - 200
        };
        
        // 创建UI
        this.createBackground();
        this.createHeader();
        this.createAdventureButtons();
        this.createCloseButton(this.height - 50);
    }
    
    createBackground() {
        this.createModalBackground(0.95);
        this.createPanel(this.centerX, this.centerY, this.width - 60, this.height - 40, {
            borderColor: 0x9b59b6
        });
    }
    
    createHeader() {
        this.createTitle('⚔ 冒险秘境', this.layout.headerY);
        this.createSubtitle('选择你的冒险方式', this.layout.subtitleY);
    }
    
    createAdventureButtons() {
        const buttons = [
            { name: '🗺 地图选择', desc: '选择不同的区域进行探索和挑战', color: 0x9b59b6, action: () => this.showZoneSelector() },
            { name: '💥 弹幕战斗', desc: '与数学之灵战斗，躲避错误答案', color: 0x4a90e2, action: () => this.startMathCombat() },
            { name: '⏱ 限时挑战', desc: '在限定时间内解答尽可能多的题目', color: 0x50e3c2, action: () => this.startTimeChallenge() },
            { name: '🏆 天梯排位', desc: '挑战天梯，提升段位，争夺排行榜', color: 0xffa500, action: () => this.showLadder() }
        ];
        
        buttons.forEach((btn, index) => {
            const y = this.layout.buttonStartY + index * (this.layout.buttonHeight + this.layout.buttonGap) + this.layout.buttonHeight / 2;
            this.createAdventureButton(btn, y);
        });
    }
    
    createAdventureButton(config, y) {
        const w = this.layout.buttonWidth;
        const h = this.layout.buttonHeight;
        
        // 按钮背景
        const btnBg = this.add.rectangle(this.centerX, y, w, h, 0x1a1a2e, 0.9);
        btnBg.setStrokeStyle(3, config.color);
        btnBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        btnBg.setInteractive({ useHandCursor: true });
        this.addUI(btnBg);
        
        // 按钮名称
        const name = this.add.text(this.centerX - w/2 + 30, y - 15, config.name, {
            fontSize: '24px',
            fill: `#${config.color.toString(16).padStart(6, '0')}`,
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        name.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(name);
        
        // 按钮描述
        const desc = this.add.text(this.centerX - w/2 + 30, y + 18, config.desc, {
            fontSize: '14px',
            fill: '#aaa',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        desc.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(desc);
        
        // 箭头
        const arrow = this.add.text(this.centerX + w/2 - 40, y, '→', {
            fontSize: '28px',
            fill: `#${config.color.toString(16).padStart(6, '0')}`
        }).setOrigin(0.5);
        arrow.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(arrow);
        
        // 交互
        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x2a2a4e, 0.95);
            btnBg.setScale(1.02);
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x1a1a2e, 0.9);
            btnBg.setScale(1.0);
        });
        btnBg.on('pointerdown', config.action);
    }

    
    // ========== 地图选择 ==========
    showZoneSelector() {
        this.clearDialog();
        
        if (!this.zoneManager) {
            this.showToast('区域管理器未初始化', 'error');
            return;
        }
        
        // 解锁符合条件的区域
        this.zoneManager.unlockZonesForRealm(this.player.realm);
        const zones = this.zoneManager.getAllZones();
        
        // 创建对话框
        this.createDialog('🗺 选择地图', 700, 500);
        
        let y = this.centerY - 150;
        zones.forEach(zone => {
            const canEnter = zone.canEnter(this.player);
            const isCurrent = zone.name === this.player.currentZone;
            this.createZoneItem(zone, y, canEnter, isCurrent);
            y += 70;
        });
    }
    
    createZoneItem(zone, y, canEnter, isCurrent) {
        const w = 620;
        const bgColor = isCurrent ? 0x3a3a2e : (canEnter ? 0x1e1e3e : 0x1a1a1a);
        const borderColor = isCurrent ? Layout.COLORS.ACCENT : (canEnter ? Layout.COLORS.SUCCESS : 0x444444);
        
        const itemBg = this.add.rectangle(this.centerX, y, w, 60, bgColor, 0.9);
        itemBg.setStrokeStyle(2, borderColor);
        itemBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        this.dialogElements.push(itemBg);
        
        // 地图名称
        const name = this.add.text(this.centerX - w/2 + 20, y - 10, zone.name, {
            fontSize: '18px',
            fill: isCurrent ? '#FFD700' : (canEnter ? '#fff' : '#666'),
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        name.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(name);
        
        // 要求信息
        const info = this.add.text(this.centerX - w/2 + 20, y + 12, `境界要求: ${zone.realmRequired} | 难度: ${zone.difficulty}`, {
            fontSize: '12px',
            fill: '#888',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        info.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(info);
        
        // 状态标签
        let statusText = isCurrent ? '当前' : (canEnter ? '进入' : '未解锁');
        let statusColor = isCurrent ? '#FFD700' : (canEnter ? '#50e3c2' : '#666');
        
        const status = this.add.text(this.centerX + w/2 - 60, y, statusText, {
            fontSize: '14px',
            fill: statusColor,
            fontFamily: Layout.FONTS.FAMILY,
            backgroundColor: isCurrent ? '#3a3a1e' : (canEnter ? '#1e3a2e' : '#1a1a1a'),
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        status.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(status);
        
        // 可进入的地图添加点击事件
        if (canEnter && !isCurrent) {
            itemBg.setInteractive({ useHandCursor: true });
            itemBg.on('pointerover', () => itemBg.setFillStyle(0x2a2a4e, 0.95));
            itemBg.on('pointerout', () => itemBg.setFillStyle(bgColor, 0.9));
            itemBg.on('pointerdown', () => this.switchZone(zone));
        }
    }
    
    async switchZone(zone) {
        this.player.currentZone = zone.name;
        window.gameData.player = this.player;
        
        // 保存数据
        try {
            const gameScene = this.scene.get('GameScene');
            if (gameScene?.saveGame) {
                await gameScene.saveGame();
            }
        } catch (e) {
            console.warn('保存失败:', e);
        }
        
        this.clearDialog();
        this.closeScene();
        this.scene.start('GameScene', { zoneSwitch: true, targetZone: zone.name });
    }
    
    // ========== 弹幕战斗 ==========
    startMathCombat() {
        if (!this.zoneManager) {
            this.showToast('区域管理器未初始化', 'error');
            return;
        }
        
        const currentZone = this.zoneManager.getZone(this.player.currentZone) || this.zoneManager.getZone('青石村');
        const spirits = currentZone?.mathSpirits || [];
        
        if (spirits.length === 0) {
            this.showToast('当前区域没有可挑战的数学之灵', 'warning');
            return;
        }
        
        this.showSpiritSelector(spirits, currentZone);
    }
    
    showSpiritSelector(spirits, zone) {
        this.clearDialog();
        this.createDialog(`💥 选择数学之灵 - ${zone.name}`, 650, 400);
        
        let y = this.centerY - 100;
        spirits.forEach(spirit => {
            this.createSpiritItem(spirit, y);
            y += 70;
        });
    }
    
    createSpiritItem(spirit, y) {
        const w = 580;
        
        const itemBg = this.add.rectangle(this.centerX, y, w, 60, 0x1e1e3e, 0.9);
        itemBg.setStrokeStyle(2, 0x4a90e2);
        itemBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        itemBg.setInteractive({ useHandCursor: true });
        this.dialogElements.push(itemBg);
        
        // 名称
        const name = this.add.text(this.centerX - w/2 + 20, y - 8, spirit.name, {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        name.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(name);
        
        // 难度
        const stars = '★'.repeat(spirit.difficulty || 1);
        const diff = this.add.text(this.centerX - w/2 + 20, y + 12, `难度: ${stars}`, {
            fontSize: '12px',
            fill: '#f5a623',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        diff.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(diff);
        
        // 挑战按钮
        const btn = this.add.text(this.centerX + w/2 - 60, y, '挑战', {
            fontSize: '14px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY,
            backgroundColor: '#4a90e2',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);
        btn.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(btn);
        
        itemBg.on('pointerover', () => itemBg.setFillStyle(0x2a2a4e, 0.95));
        itemBg.on('pointerout', () => itemBg.setFillStyle(0x1e1e3e, 0.9));
        itemBg.on('pointerdown', () => {
            window.gameData.currentSpirit = spirit;
            this.clearDialog();
            this.scene.pause();
            this.scene.launch('MathCombatScene');
        });
    }
    
    // ========== 限时挑战 ==========
    startTimeChallenge() {
        const challengeSystem = window.gameData?.challengeSystem;
        if (!challengeSystem) {
            this.showToast('挑战系统未初始化', 'error');
            return;
        }
        
        if (challengeSystem.activeChallenge) {
            this.showToast('已有进行中的挑战', 'warning');
            return;
        }
        
        this.showDifficultySelector();
    }
    
    showDifficultySelector() {
        this.clearDialog();
        this.createDialog('⏱ 选择挑战难度', 500, 380);
        
        const difficulties = [
            { name: '简单', difficulty: 1, time: 90, color: 0x50e3c2 },
            { name: '普通', difficulty: 2, time: 60, color: 0x4a90e2 },
            { name: '困难', difficulty: 3, time: 45, color: 0xffa500 },
            { name: '极难', difficulty: 4, time: 30, color: 0xff6b6b }
        ];
        
        let y = this.centerY - 100;
        difficulties.forEach(diff => {
            this.createDifficultyItem(diff, y);
            y += 60;
        });
    }
    
    createDifficultyItem(diff, y) {
        const btn = this.add.text(this.centerX, y, `${diff.name} (${diff.time}秒)`, {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY,
            backgroundColor: `#${diff.color.toString(16).padStart(6, '0')}`,
            padding: { x: 40, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        this.dialogElements.push(btn);
        
        btn.on('pointerover', () => btn.setScale(1.05));
        btn.on('pointerout', () => btn.setScale(1.0));
        btn.on('pointerdown', () => {
            const challengeSystem = window.gameData.challengeSystem;
            challengeSystem.startChallenge(diff.difficulty, diff.time);
            window.gameData.isChallengeMode = true;
            this.clearDialog();
            this.scene.pause();
            this.scene.launch('MathChallengeScene');
        });
    }
    
    // ========== 数学挑战 ==========
    startMathChallenge() {
        if (!this.zoneManager) {
            this.showToast('区域管理器未初始化', 'error');
            return;
        }
        
        const currentZone = this.zoneManager.getZone(this.player.currentZone) || this.zoneManager.getZone('青石村');
        const spirits = currentZone?.mathSpirits || [];
        
        if (spirits.length === 0) {
            this.showToast('当前区域没有可挑战的数学之灵', 'warning');
            return;
        }
        
        window.gameData.currentSpirit = spirits[0];
        this.scene.pause();
        this.scene.launch('MathChallengeScene');
    }
    
    // ========== 天梯排位 ==========
    showLadder() {
        this.clearDialog();
        
        // 获取或初始化天梯数据
        if (!this.player.ladderData) {
            this.player.ladderData = {
                rank: '青铜',
                stars: 0,
                points: 0,
                wins: 0,
                losses: 0,
                streak: 0
            };
        }
        
        const ladder = this.player.ladderData;
        const ranks = this.getLadderRanks();
        const currentRankInfo = ranks.find(r => r.name === ladder.rank) || ranks[0];
        
        this.createDialog('🏆 天梯排位', 700, 550);
        
        // 当前段位信息
        const rankY = this.centerY - 180;
        
        // 段位图标背景
        const rankBg = this.add.rectangle(this.centerX, rankY, 120, 120, currentRankInfo.color, 0.3);
        rankBg.setStrokeStyle(3, currentRankInfo.color);
        rankBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        this.dialogElements.push(rankBg);
        
        // 段位名称
        const rankName = this.add.text(this.centerX, rankY, currentRankInfo.icon + '\n' + ladder.rank, {
            fontSize: '24px',
            fill: `#${currentRankInfo.color.toString(16).padStart(6, '0')}`,
            fontFamily: Layout.FONTS.FAMILY,
            align: 'center'
        }).setOrigin(0.5);
        rankName.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(rankName);
        
        // 星星显示
        const starsY = rankY + 80;
        const maxStars = currentRankInfo.starsNeeded;
        const starsText = '★'.repeat(ladder.stars) + '☆'.repeat(maxStars - ladder.stars);
        const stars = this.add.text(this.centerX, starsY, starsText, {
            fontSize: '28px',
            fill: '#FFD700'
        }).setOrigin(0.5);
        stars.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(stars);
        
        // 统计信息
        const statsY = starsY + 50;
        const statsText = `积分: ${ladder.points} | 胜: ${ladder.wins} | 负: ${ladder.losses} | 连胜: ${ladder.streak}`;
        const stats = this.add.text(this.centerX, statsY, statsText, {
            fontSize: '16px',
            fill: '#aaa',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        stats.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(stats);
        
        // 段位列表
        const listY = statsY + 50;
        const listTitle = this.add.text(this.centerX, listY, '段位一览', {
            fontSize: '18px',
            fill: '#50e3c2',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        listTitle.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(listTitle);
        
        let y = listY + 35;
        ranks.forEach(rank => {
            const isCurrent = rank.name === ladder.rank;
            const rankItem = this.add.text(this.centerX, y, 
                `${rank.icon} ${rank.name} (${rank.starsNeeded}星晋级)`, {
                fontSize: '14px',
                fill: isCurrent ? '#FFD700' : '#888',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5);
            rankItem.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
            this.dialogElements.push(rankItem);
            y += 25;
        });
        
        // 开始匹配按钮
        const matchBtn = this.add.text(this.centerX, this.centerY + 200, '开始匹配', {
            fontSize: '22px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY,
            backgroundColor: '#ffa500',
            padding: { x: 40, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        matchBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.dialogElements.push(matchBtn);
        
        matchBtn.on('pointerover', () => matchBtn.setScale(1.05));
        matchBtn.on('pointerout', () => matchBtn.setScale(1.0));
        matchBtn.on('pointerdown', () => this.startLadderMatch());
    }
    
    getLadderRanks() {
        return [
            { name: '青铜', icon: '🥉', color: 0xcd7f32, starsNeeded: 3, pointsPerWin: 30 },
            { name: '白银', icon: '🥈', color: 0xc0c0c0, starsNeeded: 4, pointsPerWin: 25 },
            { name: '黄金', icon: '🥇', color: 0xffd700, starsNeeded: 4, pointsPerWin: 20 },
            { name: '铂金', icon: '💎', color: 0x00ffff, starsNeeded: 5, pointsPerWin: 18 },
            { name: '钻石', icon: '💠', color: 0x00bfff, starsNeeded: 5, pointsPerWin: 15 },
            { name: '大师', icon: '👑', color: 0x9400d3, starsNeeded: 6, pointsPerWin: 12 },
            { name: '王者', icon: '🏆', color: 0xff4500, starsNeeded: 0, pointsPerWin: 10 }
        ];
    }
    
    startLadderMatch() {
        this.clearDialog();
        
        // 显示匹配动画
        const matchingText = this.add.text(this.centerX, this.centerY, '正在匹配对手...', {
            fontSize: '24px',
            fill: '#ffa500',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        matchingText.setDepth(Layout.DEPTH.TOAST);
        
        // 模拟匹配延迟
        this.time.delayedCall(1500, () => {
            matchingText.destroy();
            
            // 设置天梯模式
            window.gameData.isLadderMode = true;
            window.gameData.ladderQuestionCount = 5; // 每局5题
            window.gameData.ladderCorrect = 0;
            
            // 启动挑战场景
            this.scene.pause();
            this.scene.launch('MathChallengeScene');
        });
    }
    
    // ========== 对话框工具 ==========
    createDialog(title, w, h) {
        // 遮罩
        const mask = this.add.rectangle(this.centerX, this.centerY, this.width, this.height, 0x000000, 0.5);
        mask.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        mask.setInteractive();
        mask.on('pointerdown', () => this.clearDialog());
        this.dialogElements.push(mask);
        
        // 对话框背景
        const bg = this.add.rectangle(this.centerX, this.centerY, w, h, 0x1a1a2e, 0.98);
        bg.setStrokeStyle(3, Layout.COLORS.PRIMARY);
        bg.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.dialogElements.push(bg);
        
        // 标题
        const titleText = this.add.text(this.centerX, this.centerY - h/2 + 35, title, {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        titleText.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        this.dialogElements.push(titleText);
        
        // 关闭按钮
        const closeBtn = this.add.text(this.centerX + w/2 - 30, this.centerY - h/2 + 35, '✕', {
            fontSize: '24px',
            fill: '#ff6b6b'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        closeBtn.on('pointerdown', () => this.clearDialog());
        this.dialogElements.push(closeBtn);
    }
    
    clearDialog() {
        this.dialogElements.forEach(el => el.destroy());
        this.dialogElements = [];
    }
    
    shutdown() {
        this.clearDialog();
        super.shutdown();
    }
}
