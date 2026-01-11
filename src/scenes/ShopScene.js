/**
 * 商店场景 - 使用BaseScene重构
 */
import { BaseScene } from '../core/BaseScene.js';
import * as Layout from '../core/LayoutConfig.js';

export class ShopScene extends BaseScene {
    constructor() {
        super({ key: 'ShopScene' });
        this.isModal = true;
        this.currentTab = 'material';
        this.scrollOffset = 0;
        this.cardElements = [];
    }
    
    create() {
        this.preCreate();
        
        this.shopSystem = window.gameData?.shopSystem;
        this.player = window.gameData?.player;
        
        if (!this.shopSystem || !this.player) {
            console.error('商店系统或玩家数据未初始化');
            this.closeScene();
            return;
        }
        
        // 布局参数
        this.layout = {
            panelMargin: 40,
            headerY: 50,
            tabY: 100,
            listStartY: 160,
            listEndY: this.height - 90,
            cardHeight: 90,
            cardGap: 10
        };
        
        const listHeight = this.layout.listEndY - this.layout.listStartY;
        this.maxVisible = Math.floor(listHeight / (this.layout.cardHeight + this.layout.cardGap));
        
        // 创建UI
        this.createBackground();
        this.createHeader();
        this.createTabs();
        this.renderShopItems();
        this.createCloseButton();
    }
    
    createBackground() {
        this.createModalBackground(0.92);
        
        const panelW = this.width - this.layout.panelMargin * 2;
        const panelH = this.height - this.layout.panelMargin * 2;
        this.createPanel(this.centerX, this.centerY, panelW, panelH, {
            borderColor: 0xf5a623
        });
    }
    
    createHeader() {
        this.createTitle('🏪 仙灵商店', this.layout.headerY);
        
        // 货币显示
        const gold = this.player.collectibles.find(c => c.id === 'gold');
        const goldAmount = gold ? (gold.quantity || 0) : 0;
        
        this.goldText = this.add.text(this.width - 80, this.layout.headerY, `💰 ${goldAmount}`, {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(1, 0.5);
        this.goldText.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        this.addUI(this.goldText);
    }
    
    createTabs() {
        const tabs = [
            { key: 'material', label: '📦 材料' },
            { key: 'pill', label: '💊 丹药' },
            { key: 'special', label: '✨ 特殊' }
        ];
        
        const tabWidth = 120;
        const startX = this.centerX - (tabs.length - 1) * tabWidth / 2;
        
        this.tabButtons = [];
        
        tabs.forEach((tab, index) => {
            const x = startX + index * tabWidth;
            const isActive = tab.key === this.currentTab;
            
            const bg = this.add.rectangle(x, this.layout.tabY, tabWidth - 10, 36,
                isActive ? Layout.COLORS.PRIMARY : 0x333333, 0.9);
            bg.setStrokeStyle(2, isActive ? 0xFFD700 : 0x555555);
            bg.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
            bg.setInteractive({ useHandCursor: true });
            this.addUI(bg);
            
            const text = this.add.text(x, this.layout.tabY, tab.label, {
                fontSize: '16px',
                fill: isActive ? '#fff' : '#aaa',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5);
            text.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
            this.addUI(text);
            
            bg.on('pointerdown', () => {
                this.currentTab = tab.key;
                this.scrollOffset = 0;
                this.refreshTabs();
                this.renderShopItems();
            });
            
            bg.on('pointerover', () => {
                if (!isActive) bg.setFillStyle(0x444444);
            });
            bg.on('pointerout', () => {
                if (!isActive) bg.setFillStyle(0x333333);
            });
            
            this.tabButtons.push({ bg, text, key: tab.key });
        });
    }
    
    refreshTabs() {
        this.tabButtons.forEach(tab => {
            const isActive = tab.key === this.currentTab;
            tab.bg.setFillStyle(isActive ? Layout.COLORS.PRIMARY : 0x333333);
            tab.bg.setStrokeStyle(2, isActive ? 0xFFD700 : 0x555555);
            tab.text.setColor(isActive ? '#fff' : '#aaa');
        });
    }
    
    renderShopItems() {
        // 清除旧卡片
        this.cardElements.forEach(el => el.destroy());
        this.cardElements = [];
        
        // 获取当前分类的商品
        const allItems = this.shopSystem.getShopItems('all');
        const filteredItems = allItems.filter(item => item.type === this.currentTab);
        const visibleItems = filteredItems.slice(this.scrollOffset, this.scrollOffset + this.maxVisible);
        
        const cardWidth = this.width - 120;
        
        if (visibleItems.length === 0) {
            const emptyText = this.add.text(this.centerX, this.centerY, '暂无商品', {
                fontSize: '20px',
                fill: '#888',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5);
            emptyText.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
            this.cardElements.push(emptyText);
            return;
        }
        
        visibleItems.forEach((item, index) => {
            const y = this.layout.listStartY + index * (this.layout.cardHeight + this.layout.cardGap) + this.layout.cardHeight / 2;
            this.createItemCard(item, y, cardWidth);
        });
        
        // 滚动按钮
        this.createScrollButtons(filteredItems.length);
    }
    
    createItemCard(item, y, cardWidth) {
        const isSoldOut = item.stock === 0;
        const canAfford = this.canAfford(item);
        
        // 卡片背景
        const bgColor = isSoldOut ? 0x2a2a2a : (canAfford ? 0x1e2e3e : 0x2e1e1e);
        const borderColor = isSoldOut ? 0x444444 : (canAfford ? 0x50e3c2 : 0xff6b6b);
        
        const card = this.add.rectangle(this.centerX, y, cardWidth, this.layout.cardHeight, bgColor, 0.9);
        card.setStrokeStyle(2, borderColor);
        card.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.cardElements.push(card);
        
        // 物品图标
        const iconX = this.centerX - cardWidth / 2 + 50;
        const iconBg = this.add.rectangle(iconX, y, 60, 60, 0x333355, 0.9);
        iconBg.setStrokeStyle(1, borderColor);
        iconBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.cardElements.push(iconBg);
        
        const icon = this.getItemIcon(item);
        const iconText = this.add.text(iconX, y, icon, { fontSize: '28px' }).setOrigin(0.5);
        iconText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(iconText);
        
        // 物品信息
        const infoX = this.centerX - cardWidth / 2 + 100;
        
        // 名称
        const nameText = this.add.text(infoX, y - 20, item.name, {
            fontSize: '18px',
            fill: isSoldOut ? '#666' : '#fff',
            fontFamily: Layout.FONTS.FAMILY,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        nameText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(nameText);
        
        // 描述
        const desc = this.getItemDescription(item);
        const descText = this.add.text(infoX, y + 10, desc, {
            fontSize: '14px',
            fill: '#aaa',
            fontFamily: Layout.FONTS.FAMILY,
            wordWrap: { width: cardWidth - 280 }
        }).setOrigin(0, 0.5);
        descText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(descText);
        
        // 价格和库存
        const priceX = this.centerX + cardWidth / 2 - 150;
        const priceText = this.add.text(priceX, y - 15, `💰 ${item.price.amount}`, {
            fontSize: '16px',
            fill: canAfford ? '#FFD700' : '#ff6b6b',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        priceText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(priceText);
        
        const stockStr = item.stock === -1 ? '∞' : `剩余: ${item.stock}`;
        const stockText = this.add.text(priceX, y + 15, stockStr, {
            fontSize: '12px',
            fill: isSoldOut ? '#ff6b6b' : '#888',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        stockText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        this.cardElements.push(stockText);
        
        // 购买按钮
        const btnX = this.centerX + cardWidth / 2 - 60;
        this.createBuyButton(item, btnX, y, isSoldOut, canAfford);
    }
    
    createBuyButton(item, x, y, isSoldOut, canAfford) {
        let btnText, btnColor;
        
        if (isSoldOut) {
            btnText = '售罄';
            btnColor = 0x444444;
        } else if (canAfford) {
            btnText = '购买';
            btnColor = 0x50e3c2;
        } else {
            btnText = '金币不足';
            btnColor = 0x666666;
        }
        
        const btnBg = this.add.rectangle(x, y, 80, 36, btnColor);
        btnBg.setStrokeStyle(1, isSoldOut || !canAfford ? 0x444444 : 0xffffff);
        btnBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 5);
        this.cardElements.push(btnBg);
        
        const btnLabel = this.add.text(x, y, btnText, {
            fontSize: '14px',
            fill: isSoldOut || !canAfford ? '#666' : '#fff',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        btnLabel.setDepth(Layout.DEPTH.MODAL_CONTENT + 6);
        this.cardElements.push(btnLabel);
        
        if (!isSoldOut && canAfford) {
            btnBg.setInteractive({ useHandCursor: true });
            btnBg.on('pointerover', () => btnBg.setFillStyle(0x60f3d2));
            btnBg.on('pointerout', () => btnBg.setFillStyle(0x50e3c2));
            btnBg.on('pointerdown', () => this.buyItem(item));
        }
    }
    
    createScrollButtons(totalItems) {
        if (this.scrollOffset > 0) {
            const upBtn = this.add.text(this.centerX, this.layout.listStartY - 15, '▲ 上一页', {
                fontSize: '14px',
                fill: '#667eea',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            upBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 10);
            upBtn.on('pointerdown', () => {
                this.scrollOffset = Math.max(0, this.scrollOffset - 1);
                this.renderShopItems();
            });
            this.cardElements.push(upBtn);
        }
        
        if (this.scrollOffset + this.maxVisible < totalItems) {
            const downBtn = this.add.text(this.centerX, this.layout.listEndY + 10, '▼ 下一页', {
                fontSize: '14px',
                fill: '#667eea',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            downBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 10);
            downBtn.on('pointerdown', () => {
                this.scrollOffset = Math.min(totalItems - this.maxVisible, this.scrollOffset + 1);
                this.renderShopItems();
            });
            this.cardElements.push(downBtn);
        }
    }
    
    canAfford(item) {
        const gold = this.player.collectibles.find(c => c.id === item.price.type);
        const goldAmount = gold ? (gold.quantity || 0) : 0;
        return goldAmount >= item.price.amount;
    }
    
    buyItem(item) {
        const result = this.shopSystem.buyItem(item.id, this.player);
        
        if (result.success) {
            this.showToast(result.message, 'success');
            this.updateGoldDisplay();
            this.renderShopItems();
        } else {
            this.showToast(result.message, 'error');
        }
    }
    
    updateGoldDisplay() {
        const gold = this.player.collectibles.find(c => c.id === 'gold');
        const goldAmount = gold ? (gold.quantity || 0) : 0;
        this.goldText.setText(`💰 ${goldAmount}`);
    }
    
    getItemIcon(item) {
        const icons = {
            'shop_herb_001': '🌿',
            'shop_herb_002': '🍀',
            'shop_ore_001': '🪨',
            'shop_ore_002': '💎',
            'shop_pill_health': '❤️',
            'shop_pill_mana': '💙',
            'shop_pill_exp': '⭐',
            'shop_skill_point': '📖'
        };
        return icons[item.id] || '📦';
    }
    
    getItemDescription(item) {
        if (item.effect === 'heal') return `恢复 ${item.value} 点生命`;
        if (item.effect === 'mana') return `恢复 ${item.value} 点灵力`;
        if (item.effect === 'exp') return `获得 ${item.value} 点修为`;
        if (item.effect === 'skill_point') return `获得 ${item.value} 点技能点`;
        if (item.type === 'material') return '炼丹材料';
        return item.description || '神秘物品';
    }
    
    shutdown() {
        this.cardElements.forEach(el => el.destroy());
        this.cardElements = [];
        super.shutdown();
    }
}
