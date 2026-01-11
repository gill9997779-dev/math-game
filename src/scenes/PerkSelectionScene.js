/**
 * 功法选择场景 - 使用BaseScene重构
 */
import { BaseScene } from '../core/BaseScene.js';
import * as Layout from '../core/LayoutConfig.js';

export class PerkSelectionScene extends BaseScene {
    constructor() {
        super({ key: 'PerkSelectionScene' });
        this.isModal = true;
    }
    
    create(data) {
        this.preCreate();
        
        this.player = data?.player || window.gameData?.player;
        
        if (!this.player) {
            console.error('玩家数据未初始化');
            this.closeScene();
            return;
        }
        
        // 布局参数
        this.layout = {
            panelMargin: 40,
            headerY: 55,
            subtitleY: 100,
            listStartY: 150,
            cardHeight: 130,
            cardGap: 15
        };
        
        // 创建UI
        this.createBackground();
        this.createHeader();
        this.createPerkList();
        this.createFooter();
    }
    
    createBackground() {
        this.createModalBackground(0.92);
        
        const panelW = this.width - this.layout.panelMargin * 2;
        const panelH = this.height - this.layout.panelMargin * 2;
        this.createPanel(this.centerX, this.centerY, panelW, panelH, {
            borderColor: Layout.COLORS.ACCENT
        });
    }
    
    createHeader() {
        this.createTitle('✨ 境界突破 ✨', this.layout.headerY);
        this.createSubtitle('感悟天道，选择你的修炼之路', this.layout.subtitleY);
    }
    
    createPerkList() {
        const allPerks = this.getAllPerks();
        const selectedPerks = this.shuffleArray([...allPerks]).slice(0, 3);
        const cardWidth = this.width - 120;
        
        selectedPerks.forEach((perk, index) => {
            const y = this.layout.listStartY + index * (this.layout.cardHeight + this.layout.cardGap) + this.layout.cardHeight / 2;
            this.createPerkCard(perk, y, cardWidth);
        });
    }
    
    createPerkCard(perk, y, cardWidth) {
        const isOwned = this.player.hasPerk?.(perk.id) || false;
        
        // 卡片背景
        const bgColor = isOwned ? 0x2a3a2a : 0x1e1e3e;
        const borderColor = isOwned ? Layout.COLORS.SUCCESS : perk.color;
        
        const card = this.add.rectangle(this.centerX, y, cardWidth, this.layout.cardHeight, bgColor, 0.95);
        card.setStrokeStyle(3, borderColor);
        card.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.addUI(card);
        
        // 左侧图标
        const iconX = this.centerX - cardWidth / 2 + 55;
        const iconBg = this.add.rectangle(iconX, y, 70, 70, 0x333355, 0.9);
        iconBg.setStrokeStyle(2, borderColor);
        iconBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(iconBg);
        
        const icon = this.add.text(iconX, y, perk.icon, { fontSize: '36px' }).setOrigin(0.5);
        icon.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.addUI(icon);
        
        // 功法信息
        const infoX = this.centerX - cardWidth / 2 + 110;
        
        // 名称
        const name = this.add.text(infoX, y - 35, `【${perk.name}】`, {
            fontSize: '22px',
            fill: isOwned ? '#50e3c2' : '#FFD700',
            fontFamily: Layout.FONTS.FAMILY,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        name.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.addUI(name);
        
        // 描述
        const desc = this.add.text(infoX, y, perk.desc, {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY,
            wordWrap: { width: cardWidth - 280 }
        }).setOrigin(0, 0.5);
        desc.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.addUI(desc);
        
        // 提示
        const hint = this.add.text(infoX, y + 35, perk.hint, {
            fontSize: '13px',
            fill: '#888',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        hint.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.addUI(hint);
        
        // 右侧按钮/状态
        const btnX = this.centerX + cardWidth / 2 - 70;
        
        if (isOwned) {
            const owned = this.add.text(btnX, y, '已拥有', {
                fontSize: '16px',
                fill: '#50e3c2',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5);
            owned.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
            this.addUI(owned);
        } else {
            const btnBg = this.add.rectangle(btnX, y, 90, 45, perk.color);
            btnBg.setStrokeStyle(2, 0xffffff);
            btnBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
            btnBg.setInteractive({ useHandCursor: true });
            this.addUI(btnBg);
            
            const btnText = this.add.text(btnX, y, '选择', {
                fontSize: '18px',
                fill: '#fff',
                fontFamily: Layout.FONTS.FAMILY,
                fontStyle: 'bold'
            }).setOrigin(0.5);
            btnText.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
            this.addUI(btnText);
            
            // 交互
            btnBg.on('pointerover', () => btnBg.setScale(1.08));
            btnBg.on('pointerout', () => btnBg.setScale(1.0));
            btnBg.on('pointerdown', () => this.selectPerk(perk));
            
            // 整个卡片也可点击
            card.setInteractive({ useHandCursor: true });
            card.on('pointerdown', () => this.selectPerk(perk));
        }
    }
    
    createFooter() {
        this.createButton(this.centerX, this.height - 55, '跳过 (ESC)', {
            type: 'secondary',
            onClick: () => this.returnToGame()
        });
        
        this.input.keyboard.on('keydown-ESC', () => this.returnToGame());
    }
    
    selectPerk(perk) {
        const success = this.player.addPerk?.(perk.id);
        
        if (success) {
            this.cameras.main.flash(500, 255, 215, 0);
            
            const msg = this.add.text(this.centerX, this.centerY, `领悟【${perk.name}】`, {
                fontSize: '36px',
                fill: '#FFD700',
                fontFamily: Layout.FONTS.FAMILY,
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);
            msg.setDepth(Layout.DEPTH.TOAST);
            
            this.tweens.add({
                targets: msg,
                scale: { from: 0.5, to: 1.2 },
                alpha: { from: 1, to: 0 },
                duration: 1500,
                onComplete: () => {
                    msg.destroy();
                    this.returnToGame();
                }
            });
        }
    }
    
    returnToGame() {
        if (this.player) {
            this.player.currentHealth = Math.min(this.player.currentHealth, this.player.maxHealth);
            this.player.mana = Math.min(this.player.mana, this.player.maxMana);
        }
        
        this.closeScene();
        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.scene.resume();
    }
    
    getAllPerks() {
        return [
            { id: 'MANG_FU', name: '莽夫道', desc: '题目变为极简，但修为获取减少20%', hint: '适合：想快速刷怪不想动脑的道友', color: 0xff4444, icon: '⚔️' },
            { id: 'TIAN_JI', name: '天机道', desc: '若答案为质数，获得双倍灵气', hint: '适合：对数字敏感的数学天才', color: 0x4488ff, icon: '🔮' },
            { id: 'CAN_JUAN', name: '残卷道', desc: '题目变为填空题，答对回血5点', hint: '适合：稳扎稳打的续航流', color: 0x44ff88, icon: '📜' },
            { id: 'BODY_REFINEMENT', name: '体魄强化', desc: '最大生命值+50，当前生命值+50', hint: '适合：提升生存能力的稳健流', color: 0xff8844, icon: '💪' },
            { id: 'SPIRIT_BOOST', name: '灵力增强', desc: '最大灵力+30，当前灵力+30', hint: '适合：需要更多灵力的技能流', color: 0xaa44ff, icon: '✨' },
            { id: 'EXP_BOOST', name: '修为增益', desc: '答题获得的修为增加15%', hint: '适合：追求快速提升境界的修炼流', color: 0xffdd44, icon: '🌟' }
        ];
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
