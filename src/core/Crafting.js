/**
 * 合成系统
 * 管理炼丹和炼器
 */
export class CraftingSystem {
    constructor() {
        this.recipes = this.initializeRecipes();
    }
    
    /**
     * 初始化配方
     */
    initializeRecipes() {
        return {
            // 丹药配方
            pills: [
                {
                    id: 'pill_exp_boost',
                    name: '修为丹',
                    description: '使用后获得额外修为',
                    ingredients: [
                        { id: 'herb_001', quantity: 2 },
                        { id: 'ore_001', quantity: 1 }
                    ],
                    result: {
                        type: 'pill',
                        effect: 'exp_boost',
                        value: 50
                    },
                    difficulty: 1
                },
                {
                    id: 'pill_health',
                    name: '回血丹',
                    description: '恢复生命值',
                    ingredients: [
                        { id: 'herb_001', quantity: 3 }
                    ],
                    result: {
                        type: 'pill',
                        effect: 'heal',
                        value: 50
                    },
                    difficulty: 1
                },
                {
                    id: 'pill_mana',
                    name: '回灵丹',
                    description: '恢复灵力',
                    ingredients: [
                        { id: 'herb_002', quantity: 2 },
                        { id: 'ore_002', quantity: 1 }
                    ],
                    result: {
                        type: 'pill',
                        effect: 'mana_restore',
                        value: 30
                    },
                    difficulty: 2
                },
                {
                    id: 'pill_accuracy',
                    name: '悟性丹',
                    description: '提升答题准确率',
                    ingredients: [
                        { id: 'herb_003', quantity: 2 },
                        { id: 'ore_003', quantity: 1 }
                    ],
                    result: {
                        type: 'pill',
                        effect: 'accuracy_boost',
                        value: 10
                    },
                    difficulty: 3
                }
            ],
            
            // 装备配方
            equipment: [
                {
                    id: 'equip_sword_basic',
                    name: '基础法剑',
                    description: '提升攻击力',
                    ingredients: [
                        { id: 'ore_001', quantity: 5 }
                    ],
                    result: {
                        type: 'equipment',
                        slot: 'weapon',
                        stats: { attack: 10 }
                    },
                    difficulty: 1
                }
            ]
        };
    }
    
    /**
     * 检查是否可以合成
     */
    canCraft(recipe, inventory) {
        return recipe.ingredients.every(ingredient => {
            const item = inventory.find(i => i.id === ingredient.id);
            return item && (item.quantity || 1) >= ingredient.quantity;
        });
    }
    
    /**
     * 执行合成
     */
    craft(recipe, inventory) {
        if (!this.canCraft(recipe, inventory)) {
            return { success: false, message: '材料不足' };
        }
        
        // 消耗材料
        recipe.ingredients.forEach(ingredient => {
            const item = inventory.find(i => i.id === ingredient.id);
            if (item) {
                item.quantity = (item.quantity || 1) - ingredient.quantity;
                if (item.quantity <= 0) {
                    const index = inventory.indexOf(item);
                    inventory.splice(index, 1);
                }
            }
        });
        
        // 添加产物
        const result = { 
            type: recipe.result.type,
            rarity: recipe.result.rarity,
            stats: recipe.result.stats,
            id: recipe.id, 
            name: recipe.name, 
            quantity: 1 
        };
        
        // 如果是装备，直接添加到背包（装备不能叠加）
        if (recipe.result.type === 'equipment') {
            inventory.push(result);
        } else {
            // 其他物品可以叠加
            const existing = inventory.find(i => i.id === recipe.id);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                inventory.push(result);
            }
        }
        
        return { success: true, message: `成功合成 ${recipe.name}！`, result };
    }
    
    /**
     * 获取所有可用配方
     */
    getAvailableRecipes(inventory, type = 'all') {
        const recipes = type === 'all' 
            ? this.recipes.pills.concat(this.recipes.equipment)
            : this.recipes[type] || [];
        
        return recipes.map(recipe => ({
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            ingredients: recipe.ingredients, // 修复：使用 ingredients 而不是 materials
            result: recipe.result,
            canCraft: this.canCraft(recipe, inventory)
        }));
    }
    
    /**
     * 使用丹药
     */
    usePill(pill, player) {
        switch (pill.effect) {
            case 'exp_boost':
                player.gainExp(pill.value);
                return { success: true, message: `获得 ${pill.value} 点修为！` };
            case 'heal':
                player.currentHealth = Math.min(player.maxHealth, player.currentHealth + pill.value);
                return { success: true, message: `恢复 ${pill.value} 点生命值！` };
            case 'mana_restore':
                player.mana = Math.min(player.maxMana, player.mana + pill.value);
                return { success: true, message: `恢复 ${pill.value} 点灵力！` };
            case 'accuracy_boost':
                // 这个效果需要在答题时应用
                return { success: true, message: `悟性提升！答题准确率临时增加 ${pill.value}%` };
            default:
                return { success: false, message: '未知效果' };
        }
    }
}

