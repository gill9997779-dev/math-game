// Phaser 从全局对象获取
const { Scene } = Phaser;
import { CraftingSystem } from '../core/Crafting.js';

export class CraftingScene extends Scene {
    constructor() {
        super({ key: 'CraftingScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        const player = window.gameData.player;
        
        // 半透明背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        
        // 标题
        this.add.text(width / 2, 80, '炼丹炉', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        // 初始化合成系统
        if (!window.gameData.craftingSystem) {
            window.gameData.craftingSystem = new CraftingSystem();
        }
        const craftingSystem = window.gameData.craftingSystem;
        
        // 材料名称映射（用于显示配方中的材料名称）
        const materialNames = {
            'herb_001': '青灵草',
            'ore_001': '基础矿石',
            'herb_002': '五行草',
            'ore_002': '五行矿石',
            'herb_003': '上古灵草',
            'ore_003': '上古矿石'
        };
        
        // 获取可用配方
        const recipes = craftingSystem.getAvailableRecipes(player.collectibles, 'pills');
        
        // 显示配方列表
        const startY = 180;
        const itemHeight = 100;
        const maxVisible = 5;
        
        recipes.forEach((recipe, index) => {
            if (index >= maxVisible) return;
            
            const y = startY + index * itemHeight;
            const canCraft = recipe.canCraft;
            
            // 配方卡片
            const card = this.add.rectangle(width / 2, y, 900, 80, 
                canCraft ? 0x667eea : 0x444444, 0.7)
                .setStrokeStyle(2, canCraft ? 0x50e3c2 : 0x888888);
            
            // 配方名称
            this.add.text(250, y, recipe.name, {
                fontSize: '24px',
                fill: canCraft ? '#fff' : '#888',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0, 0.5);
            
            // 配方描述
            this.add.text(250, y + 30, recipe.description, {
                fontSize: '18px',
                fill: canCraft ? '#ddd' : '#666',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0, 0.5);
            
            // 材料需求
            const ingredientsText = recipe.ingredients.map(ing => {
                const hasItem = player.collectibles.find(c => c.id === ing.id);
                const quantity = hasItem ? (hasItem.quantity || 1) : 0;
                const hasEnough = quantity >= ing.quantity;
                // 获取材料名称（优先从背包中查找，其次从映射表，最后使用ID）
                const itemName = hasItem ? (hasItem.name || materialNames[ing.id] || ing.id) 
                                         : (materialNames[ing.id] || ing.id);
                return `${itemName} x${ing.quantity} ${hasEnough ? '✓' : '✗'}`;
            }).join(', ');
            
            this.add.text(600, y, ingredientsText, {
                fontSize: '16px',
                fill: canCraft ? '#50e3c2' : '#ff6b6b',
                fontFamily: 'Microsoft YaHei',
                wordWrap: { width: 400 }
            }).setOrigin(0, 0.5);
            
            // 合成按钮
            if (canCraft) {
                const craftButton = this.add.text(width - 150, y, '合成', {
                    fontSize: '20px',
                    fill: '#fff',
                    fontFamily: 'Microsoft YaHei',
                    backgroundColor: '#50e3c2',
                    padding: { x: 20, y: 10 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    const result = craftingSystem.craft(recipe, player.collectibles);
                    this.showMessage(result.message, result.success);
                    if (result.success) {
                        // 重新创建场景以更新显示
                        this.scene.restart();
                    }
                })
                .on('pointerover', () => craftButton.setTint(0x40d3b2))
                .on('pointerout', () => craftButton.clearTint());
            }
        });
        
        // 关闭按钮
        const closeButton = this.add.text(width / 2, height - 100, '关闭 (ESC)', {
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
    
    showMessage(message, isSuccess) {
        const { width, height } = this.cameras.main;
        const text = this.add.text(width / 2, height / 2, message, {
            fontSize: '28px',
            fill: isSuccess ? '#50e3c2' : '#ff6b6b',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 50,
            duration: 2000,
            onComplete: () => text.destroy()
        });
    }
}

