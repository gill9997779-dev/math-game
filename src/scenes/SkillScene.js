/**
 * 技能场景 - 使用BaseScene重构
 */
import { BaseScene } from '../core/BaseScene.js';
import * as Layout from '../core/LayoutConfig.js';

export class SkillScene extends BaseScene {
    constructor() {
        super({ key: 'SkillScene' });
        this.isModal = true;
        this.scrollOffset = 0;
        this.cardElements = [];
    }
    
    create() {
        // 初始化
        this.preCreate();
        
        const skillSystem = window.gameData?.skillSystem;
        const player = window.gameData?.player;
        
        if (!skillSystem) {
            console.error('技能系统未初始化');
            this.closeScene();
            return;
        }
        
        this.skillSystem = skillSystem;
        this.player = player;
        
        // 布局参数
        this.layout = {
            panelMargin: 40,
            headerY: 50,
            infoY: 95,
            listStartY: 140,
            listEndY: this.height - 90,
            cardHeight: 85,
            cardGap: 8
        };
        
        // 计算可显示数量
        const listHeight = this.layout.listEndY - this.layout.listStartY;
        this.maxVisible = Math.floor(listHeight / (this.layout.cardHeight + this.layout.cardGap));
        
        // 创建UI
        this.createBackground();
        this.createHeader();
        this.renderSkillList();
        this.createCloseButton();
    }
    
    createBackground() {
        // 遮罩
        this.createModalBackground(0.92);
        
        // 主面板
        const panelW = this.width - this.layout.panelMargin * 2;
        const panelH = this.height - this.layout.panelMargin * 2;
        this.createPanel(this.centerX, this.centerY, panelW, panelH, {
            borderColor: Layout.COLORS.ACCENT
        });
    }
    
    createHeader() {
        // 标题
        this.createTitle('⚔ 技能系统', this.layout.headerY);
        
        // 技能点显示
        this.skillPointsText = this.add.text(this.centerX, this.layout.infoY, 
            `可用技能点: ${this.skillSystem.skillPoints}`, {
            fontSize: '20px',
            fill: '#50e3c2',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        this.skillPointsText.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        this.addUI(this.skillPointsText);
    }
    
    renderSkillList() {
        // 清除旧卡片
        this.cardElements.forEach(el => el.destroy());
        this.cardElements = [];
        
        const skills = this.skillSystem.getAvailableSkills();
        const visibleSkills = skills.slice(this.scrollOffset, this.scrollOffset + this.maxVisible);
        
        const cardWidth = this.width - 120;
        
        visibleSkills.forEach((skill, index) => {
            const y = this.layout.listStartY + index * (this.layout.cardHeight + this.layout.cardGap) + this.layout.cardHeight / 2;
            this.createSkillCard(skill, y, cardWidth);
        });
        
        // 滚动按钮
        this.createScrollButtons(skills.length);
    }
    
    createSkillCard(skill, y, cardWidth) {
        const isUnlocked = skill.level > 0;
        const isMaxed = skill.level >= skill.maxLevel;
        
        // 卡片颜色
        const bgColor = isMaxed ? 0x2d4a3e : (isUnlocked ? 0x2a2a4e : 0x1e1e3e);
        const borderColor = isMaxed ? Layout.COLORS.SUCCESS : (isUnlocked ? Layout.COLORS.ACCENT : 0x444466);
        
        // 卡片背景
        const card = this.add.rectangle(this.centerX, y, cardWidth, this.layout.cardHeight, bgColor, 0.9);
        card.setStrokeStyle(2, borderColor);
        card.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.cardElements.push(card);
        
        // 左侧等级图标
        const iconX = this.centerX - cardWidth / 2 + 45;
        const iconBg = this.add.rectangle(iconX, y, 55, 55, 0x333355, 0.9);
        iconBg.setStrokeStyle(1, borderColor);
        iconBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.cardElements.push(iconBg);
        
        const levelText = this.add.text(iconX, y, `${skill.level}/${skill.maxLevel}`, {
            fontSize: '16px',
            fill: isMaxed ? '#50e3c2' : (isUnlocked ? '#FFD700' : '#888'),
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        levelText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(levelText);
        
        // 技能信息
        const infoX = this.centerX - cardWidth / 2 + 90;
        
        // 名称
        const nameText = this.add.text(infoX, y - 20, skill.name, {
            fontSize: '18px',
            fill: isMaxed ? '#50e3c2' : (isUnlocked ? '#FFD700' : '#fff'),
            fontFamily: Layout.FONTS.FAMILY,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        nameText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(nameText);
        
        // 类型标签
        const tagText = skill.category === 'passive' ? '[被动]' : '[主动]';
        const tagColor = skill.category === 'passive' ? '#50e3c2' : '#f5a623';
        const tag = this.add.text(infoX + nameText.width + 10, y - 20, tagText, {
            fontSize: '12px',
            fill: tagColor,
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        tag.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(tag);
        
        // 描述
        const desc = this.add.text(infoX, y + 10, skill.description, {
            fontSize: '14px',
            fill: '#aaa',
            fontFamily: Layout.FONTS.FAMILY,
            wordWrap: { width: cardWidth - 250 }
        }).setOrigin(0, 0.5);
        desc.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(desc);
        
        // 右侧按钮
        const btnX = this.centerX + cardWidth / 2 - 70;
        this.createSkillButton(skill, btnX, y);
    }
    
    createSkillButton(skill, x, y) {
        const isMaxed = skill.level >= skill.maxLevel;
        const isUnlocked = skill.level > 0;
        
        let btnText, btnColor, canClick = false;
        
        if (isMaxed) {
            btnText = '已满级';
            btnColor = 0x2d4a3e;
        } else if (skill.canUnlock) {
            btnText = isUnlocked ? `升级(${skill.cost})` : `解锁(${skill.cost})`;
            btnColor = 0x9013FE;
            canClick = true;
        } else {
            btnText = `需${skill.cost}点`;
            btnColor = 0x333344;
        }
        
        const btnBg = this.add.rectangle(x, y, 90, 36, btnColor);
        btnBg.setStrokeStyle(1, canClick ? 0xb366ff : 0x444444);
        btnBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        this.cardElements.push(btnBg);
        
        const btnLabel = this.add.text(x, y, btnText, {
            fontSize: '14px',
            fill: canClick ? '#fff' : (isMaxed ? '#50e3c2' : '#666'),
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        btnLabel.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.cardElements.push(btnLabel);
        
        if (canClick) {
            btnBg.setInteractive({ useHandCursor: true });
            btnBg.on('pointerover', () => btnBg.setFillStyle(0xb366ff));
            btnBg.on('pointerout', () => btnBg.setFillStyle(0x9013FE));
            btnBg.on('pointerdown', () => this.unlockSkill(skill));
        }
    }
    
    createScrollButtons(totalSkills) {
        // 上翻页
        if (this.scrollOffset > 0) {
            const upBtn = this.add.text(this.centerX, this.layout.listStartY - 20, '▲ 上一页', {
                fontSize: '14px',
                fill: '#667eea',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            upBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 10);
            upBtn.on('pointerdown', () => {
                this.scrollOffset = Math.max(0, this.scrollOffset - 1);
                this.renderSkillList();
            });
            this.cardElements.push(upBtn);
        }
        
        // 下翻页
        if (this.scrollOffset + this.maxVisible < totalSkills) {
            const downBtn = this.add.text(this.centerX, this.layout.listEndY + 10, '▼ 下一页', {
                fontSize: '14px',
                fill: '#667eea',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            downBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 10);
            downBtn.on('pointerdown', () => {
                this.scrollOffset = Math.min(totalSkills - this.maxVisible, this.scrollOffset + 1);
                this.renderSkillList();
            });
            this.cardElements.push(downBtn);
        }
    }
    
    unlockSkill(skill) {
        const result = this.skillSystem.unlockSkill(skill.id, this.player);
        if (result.success) {
            this.skillPointsText.setText(`可用技能点: ${this.skillSystem.skillPoints}`);
            this.renderSkillList();
            this.showToast(result.message, 'success');
        } else {
            this.showToast(result.message, 'error');
        }
    }
    
    shutdown() {
        this.cardElements.forEach(el => el.destroy());
        this.cardElements = [];
        super.shutdown();
    }
}
