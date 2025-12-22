// Phaser 从全局对象获取
const { Scene } = Phaser;

export class InventoryScene extends Scene {
    constructor() {
        super({ key: 'InventoryScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        const player = window.gameData.player;
        
        // 半透明背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        
        // 标题
        this.add.text(width / 2, 50, '背包', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        // 装备栏标题
        this.add.text(150, 120, '已装备', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei'
        });
        
        // 显示装备
        const equipmentSlots = [
            { slot: 'weapon', name: '武器', x: 100, y: 160 },
            { slot: 'armor', name: '护甲', x: 100, y: 220 },
            { slot: 'accessory', name: '饰品', x: 100, y: 280 }
        ];
        
        equipmentSlots.forEach(slotInfo => {
            const item = player.equippedItems[slotInfo.slot];
            const slotText = this.add.text(slotInfo.x, slotInfo.y, `${slotInfo.name}:`, {
                fontSize: '20px',
                fill: '#aaa',
                fontFamily: 'Microsoft YaHei'
            });
            
            if (item) {
                const itemText = this.add.text(slotInfo.x + 100, slotInfo.y, item.name, {
                    fontSize: '18px',
                    fill: '#FFD700',
                    fontFamily: 'Microsoft YaHei'
                });
                
                const unequipBtn = this.add.text(slotInfo.x + 300, slotInfo.y, '卸下', {
                    fontSize: '16px',
                    fill: '#fff',
                    fontFamily: 'Microsoft YaHei',
                    backgroundColor: '#ff6b6b',
                    padding: { x: 10, y: 5 }
                }).setInteractive({ useHandCursor: true });
                
                unequipBtn.on('pointerdown', () => {
                    const result = player.unequipItem(slotInfo.slot);
                    if (result.success) {
                        this.scene.restart(); // 刷新界面
                    }
                });
            } else {
                this.add.text(slotInfo.x + 100, slotInfo.y, '无', {
                    fontSize: '18px',
                    fill: '#666',
                    fontFamily: 'Microsoft YaHei'
                });
            }
        });
        
        // 物品列表标题
        this.add.text(150, 360, '物品列表', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        });
        
        // 显示收集物
        const startY = 400;
        const itemHeight = 50;
        const maxVisible = 6;
        let scrollOffset = 0;
        
        const updateItemList = () => {
            // 清除旧列表（简化处理，实际应该用容器管理）
            // 这里我们重新创建场景来刷新
        };
        
        if (player.collectibles.length === 0) {
            this.add.text(width / 2, height / 2, '背包为空', {
                fontSize: '24px',
                fill: '#888',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
        } else {
            player.collectibles.slice(scrollOffset, scrollOffset + maxVisible).forEach((item, index) => {
                const y = startY + index * itemHeight;
                const quantity = item.quantity || 1;
                
                const itemText = this.add.text(150, y, `${item.name} x${quantity}`, {
                    fontSize: '20px',
                    fill: '#fff',
                    fontFamily: 'Microsoft YaHei',
                    backgroundColor: 'rgba(102, 126, 234, 0.5)',
                    padding: { x: 15, y: 8 }
                });
                
                // 显示类型
                const typeText = this.add.text(450, y, item.type || '未知', {
                    fontSize: '18px',
                    fill: '#aaa',
                    fontFamily: 'Microsoft YaHei'
                });
                
                // 根据类型显示操作按钮
                if (item.type === 'equipment') {
                    const equipBtn = this.add.text(650, y, '装备', {
                        fontSize: '16px',
                        fill: '#fff',
                        fontFamily: 'Microsoft YaHei',
                        backgroundColor: '#50e3c2',
                        padding: { x: 10, y: 5 }
                    }).setInteractive({ useHandCursor: true });
                    
                    equipBtn.on('pointerdown', () => {
                        const result = player.equipItem(item);
                        if (result.success) {
                            this.scene.restart(); // 刷新界面
                        }
                    });
                } else if (item.type === 'pill') {
                    const useBtn = this.add.text(650, y, '使用', {
                        fontSize: '16px',
                        fill: '#fff',
                        fontFamily: 'Microsoft YaHei',
                        backgroundColor: '#f5a623',
                        padding: { x: 10, y: 5 }
                    }).setInteractive({ useHandCursor: true });
                    
                    useBtn.on('pointerdown', () => {
                        const result = player.useItem(item);
                        if (result.success) {
                            // 从背包移除
                            const itemInInventory = player.collectibles.find(c => c.id === item.id);
                            if (itemInInventory) {
                                itemInInventory.quantity = (itemInInventory.quantity || 1) - 1;
                                if (itemInInventory.quantity <= 0) {
                                    const idx = player.collectibles.indexOf(itemInInventory);
                                    player.collectibles.splice(idx, 1);
                                }
                            }
                            this.scene.restart(); // 刷新界面
                        }
                    });
                }
            });
        }
        
        // 关闭按钮
        const closeButton = this.add.text(width / 2, height - 80, '关闭 (ESC)', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 30, y: 15 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.stop())
        .on('pointerover', () => closeButton.setTint(0x764ba2))
        .on('pointerout', () => closeButton.clearTint());
        
        // ESC 键关闭
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();
        });
    }
}

