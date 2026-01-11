/**
 * 背包场景 - 使用BaseScene重构
 */
import { BaseScene } from '../core/BaseScene.js';
import * as Layout from '../core/LayoutConfig.js';

export class InventoryScene extends BaseScene {
    constructor() {
        super({ key: 'InventoryScene' });
        this.isModal = true;
        this.scrollOffset = 0;
        this.listElements = [];
    }
    
    create() {
        this.preCreate();
        
        this.player = window.gameData?.player;
        if (!this.player) {
            console.error('玩家数据未初始化');
            this.closeScene();
            return;
        }
        
        // 布局参数
        this.layout = {
            panelMargin: 40,
            headerY: 45,
            equipStartY: 100,
            equipHeight: 45,
            listTitleY: 260,
            listStartY: 300,
            listEndY: this.height - 100,
            itemHeight: 55,
            itemGap: 8
        };
        
        const listHeight = this.layout.listEndY - this.layout.listStartY;
        this.maxVisible = Math.floor(listHeight / (this.layout.itemHeight + this.layout.itemGap));
        
        this.createBackground();
        this.createHeader();
        this.createEquipmentSection();
        this.createItemList();
        this.createCloseButton();
    }
    
    createBackground() {
        this.createModalBackground(0.92);
        const panelW = this.width - this.layout.panelMargin * 2;
        const panelH = this.height - this.layout.panelMargin * 2;
        this.createPanel(this.centerX, this.centerY, panelW, panelH);
    }
    
    createHeader() {
        this.createTitle('🎒 背包', this.layout.headerY);
    }
    
    createEquipmentSection() {
        const leftX = 100;
        const sectionWidth = this.width - 200;
        
        // 装备栏标题
        const equipTitle = this.add.text(leftX, this.layout.equipStartY - 25, '已装备', {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: Layout.FONTS.FAMILY
        });
        equipTitle.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        this.addUI(equipTitle);
        
        // 装备槽
        const slots = [
            { slot: 'weapon', name: '武器', icon: '⚔️' },
            { slot: 'armor', name: '护甲', icon: '🛡️' },
            { slot: 'accessory', name: '饰品', icon: '💍' }
        ];
        
        const slotWidth = (sectionWidth - 40) / 3;
        
        slots.forEach((slotInfo, index) => {
            const x = leftX + index * (slotWidth + 20) + slotWidth / 2;
            const y = this.layout.equipStartY + 50;
            
            this.createEquipSlot(x, y, slotWidth - 20, slotInfo);
        });
    }
    
    createEquipSlot(x, y, width, slotInfo) {
        const item = this.player.equippedItems?.[slotInfo.slot];
        const hasItem = !!item;
        
        // 槽背景
        const slotBg = this.add.rectangle(x, y, width, 80, hasItem ? 0x2a2a4e : 0x1e1e3e, 0.9);
        slotBg.setStrokeStyle(2, hasItem ? Layout.COLORS.ACCENT : 0x444466);
        slotBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.addUI(slotBg);
        
        // 图标
        const icon = this.add.text(x - width / 2 + 30, y, slotInfo.icon, {
            fontSize: '24px'
        }).setOrigin(0.5);
        icon.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(icon);
        
        // 槽名称
        const nameText = this.add.text(x - width / 2 + 60, y - 15, slotInfo.name, {
            fontSize: '14px',
            fill: '#888',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        nameText.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(nameText);
        
        // 装备名称或空
        const itemName = this.add.text(x - width / 2 + 60, y + 10, hasItem ? item.name : '空', {
            fontSize: '16px',
            fill: hasItem ? '#FFD700' : '#555',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        itemName.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(itemName);
        
        // 卸下按钮
        if (hasItem) {
            const unequipBtn = this.add.text(x + width / 2 - 35, y, '卸下', {
                fontSize: '12px',
                fill: '#fff',
                fontFamily: Layout.FONTS.FAMILY,
                backgroundColor: '#ff6b6b',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            unequipBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
            this.addUI(unequipBtn);
            
            unequipBtn.on('pointerdown', () => {
                const result = this.player.unequipItem?.(slotInfo.slot);
                if (result?.success) {
                    this.scene.restart();
                }
            });
        }
    }
    
    createItemList() {
        // 分隔线
        const divider = this.add.rectangle(this.centerX, this.layout.listTitleY - 20, this.width - 120, 2, 0x333355);
        divider.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        this.addUI(divider);
        
        // 物品列表标题
        const listTitle = this.add.text(100, this.layout.listTitleY, '物品列表', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY
        });
        listTitle.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        this.addUI(listTitle);
        
        this.renderItemList();
    }
    
    renderItemList() {
        // 清除旧元素
        this.listElements.forEach(el => el.destroy());
        this.listElements = [];
        
        const items = this.player.collectibles || [];
        
        if (items.length === 0) {
            const emptyText = this.add.text(this.centerX, this.layout.listStartY + 80, '背包为空', {
                fontSize: '20px',
                fill: '#666',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5);
            emptyText.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
            this.listElements.push(emptyText);
            return;
        }
        
        const visibleItems = items.slice(this.scrollOffset, this.scrollOffset + this.maxVisible);
        const cardWidth = this.width - 120;
        
        visibleItems.forEach((item, index) => {
            const y = this.layout.listStartY + index * (this.layout.itemHeight + this.layout.itemGap) + this.layout.itemHeight / 2;
            this.createItemCard(item, y, cardWidth);
        });
        
        // 滚动按钮
        this.createScrollButtons(items.length);
    }
    
    createItemCard(item, y, cardWidth) {
        const quantity = item.quantity || 1;
        
        // 卡片背景
        const card = this.add.rectangle(this.centerX, y, cardWidth, this.layout.itemHeight, 0x1e1e3e, 0.9);
        card.setStrokeStyle(1, 0x444466);
        card.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.listElements.push(card);
        
        // 物品名称和数量
        const nameText = this.add.text(this.centerX - cardWidth / 2 + 20, y, `${item.name} x${quantity}`, {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        nameText.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.listElements.push(nameText);
        
        // 类型标签
        const typeColors = {
            equipment: '#50e3c2',
            pill: '#f5a623',
            material: '#667eea'
        };
        const typeNames = {
            equipment: '装备',
            pill: '丹药',
            material: '材料'
        };
        const typeColor = typeColors[item.type] || '#888';
        const typeName = typeNames[item.type] || '其他';
        
        const typeTag = this.add.text(this.centerX, y, typeName, {
            fontSize: '14px',
            fill: typeColor,
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        typeTag.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.listElements.push(typeTag);
        
        // 操作按钮
        const btnX = this.centerX + cardWidth / 2 - 50;
        
        if (item.type === 'equipment') {
            this.createItemButton(btnX, y, '装备', 0x50e3c2, () => {
                const result = this.player.equipItem?.(item);
                if (result?.success) this.scene.restart();
            });
        } else if (item.type === 'pill') {
            this.createItemButton(btnX, y, '使用', 0xf5a623, () => {
                const result = this.player.useItem?.(item);
                if (result?.success) {
                    this.updateItemQuantity(item);
                    this.scene.restart();
                }
            });
        }
    }
    
    createItemButton(x, y, text, color, onClick) {
        const btn = this.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY,
            backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
        btn.on('pointerdown', onClick);
        this.listElements.push(btn);
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
                this.renderItemList();
            });
            this.listElements.push(upBtn);
        }
        
        if (this.scrollOffset + this.maxVisible < totalItems) {
            const downBtn = this.add.text(this.centerX, this.layout.listEndY + 5, '▼ 下一页', {
                fontSize: '14px',
                fill: '#667eea',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            downBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 10);
            downBtn.on('pointerdown', () => {
                this.scrollOffset = Math.min(totalItems - this.maxVisible, this.scrollOffset + 1);
                this.renderItemList();
            });
            this.listElements.push(downBtn);
        }
    }
    
    updateItemQuantity(item) {
        const itemInInventory = this.player.collectibles?.find(c => c.id === item.id);
        if (itemInInventory) {
            itemInInventory.quantity = (itemInInventory.quantity || 1) - 1;
            if (itemInInventory.quantity <= 0) {
                const idx = this.player.collectibles.indexOf(itemInInventory);
                this.player.collectibles.splice(idx, 1);
            }
        }
    }
    
    shutdown() {
        this.listElements.forEach(el => el.destroy());
        this.listElements = [];
        super.shutdown();
    }
}
