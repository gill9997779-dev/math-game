/**
 * 掉落系统
 * 管理答题时的道具和材料掉落
 */
export class DropSystem {
    constructor() {
        this.dropRate = 0.4; // 40% 基础掉落率
        this.initializeDropTable();
    }
    
    /**
     * 初始化掉落表
     */
    initializeDropTable() {
        // 材料掉落表（按稀有度分类）
        this.materialDrops = [
            // 普通材料（70%概率）
            { id: 'herb_001', name: '青灵草', type: 'material', rarity: 'common', weight: 30 },
            { id: 'ore_001', name: '基础矿石', type: 'material', rarity: 'common', weight: 30 },
            { id: 'herb_001', name: '青灵草', type: 'material', rarity: 'common', weight: 20 },
            { id: 'ore_001', name: '基础矿石', type: 'material', rarity: 'common', weight: 20 },
            
            // 稀有材料（25%概率）
            { id: 'herb_002', name: '五行草', type: 'material', rarity: 'rare', weight: 15 },
            { id: 'ore_002', name: '五行矿石', type: 'material', rarity: 'rare', weight: 10 },
            
            // 史诗材料（5%概率）
            { id: 'herb_003', name: '上古灵草', type: 'material', rarity: 'epic', weight: 3 },
            { id: 'ore_003', name: '上古矿石', type: 'material', rarity: 'epic', weight: 2 }
        ];
        
        // 道具掉落表
        this.itemDrops = [
            // 普通道具（60%概率）
            { id: 'pill_health', name: '回血丹', type: 'pill', rarity: 'common', weight: 25, effect: 'heal', value: 50 },
            { id: 'pill_mana', name: '回灵丹', type: 'pill', rarity: 'common', weight: 25, effect: 'mana_restore', value: 30 },
            
            // 稀有道具（35%概率）
            { id: 'pill_exp_boost', name: '修为丹', type: 'pill', rarity: 'rare', weight: 20, effect: 'exp_boost', value: 50 },
            
            // 史诗道具（5%概率）
            { id: 'pill_accuracy', name: '悟性丹', type: 'pill', rarity: 'epic', weight: 5, effect: 'accuracy_boost', value: 10 }
        ];
        
        // 计算总权重
        this.materialTotalWeight = this.materialDrops.reduce((sum, item) => sum + item.weight, 0);
        this.itemTotalWeight = this.itemDrops.reduce((sum, item) => sum + item.weight, 0);
    }
    
    /**
     * 尝试掉落物品
     * @param {number} difficulty - 题目难度
     * @param {number} combo - 当前连击数
     * @returns {Object|null} 掉落的物品，如果没有掉落则返回null
     */
    tryDrop(difficulty = 1, combo = 0) {
        // 计算掉落率（基础40% + 难度加成 + 连击加成）
        let dropChance = this.dropRate;
        dropChance += (difficulty - 1) * 0.1; // 每级难度+10%
        dropChance += Math.min(combo * 0.02, 0.2); // 连击最多+20%
        
        // 决定是否掉落
        if (Math.random() > dropChance) {
            return null;
        }
        
        // 决定掉落材料还是道具（70%材料，30%道具）
        const isMaterial = Math.random() < 0.7;
        
        if (isMaterial) {
            return this.dropMaterial();
        } else {
            return this.dropItem();
        }
    }
    
    /**
     * 掉落材料
     */
    dropMaterial() {
        const random = Math.random() * this.materialTotalWeight;
        let currentWeight = 0;
        
        for (const item of this.materialDrops) {
            currentWeight += item.weight;
            if (random <= currentWeight) {
                return {
                    ...item,
                    quantity: this.getQuantity(item.rarity)
                };
            }
        }
        
        // 默认返回第一个
        return {
            ...this.materialDrops[0],
            quantity: 1
        };
    }
    
    /**
     * 掉落道具
     */
    dropItem() {
        const random = Math.random() * this.itemTotalWeight;
        let currentWeight = 0;
        
        for (const item of this.itemDrops) {
            currentWeight += item.weight;
            if (random <= currentWeight) {
                return {
                    ...item,
                    quantity: 1
                };
            }
        }
        
        // 默认返回第一个
        return {
            ...this.itemDrops[0],
            quantity: 1
        };
    }
    
    /**
     * 根据稀有度获取数量
     */
    getQuantity(rarity) {
        switch (rarity) {
            case 'common':
                return Math.floor(Math.random() * 2) + 1; // 1-2个
            case 'rare':
                return Math.floor(Math.random() * 2) + 1; // 1-2个
            case 'epic':
                return 1; // 固定1个
            default:
                return 1;
        }
    }
    
    /**
     * 获取掉落物品的显示颜色
     */
    getRarityColor(rarity) {
        switch (rarity) {
            case 'common':
                return '#FFFFFF'; // 白色
            case 'rare':
                return '#4A90E2'; // 蓝色
            case 'epic':
                return '#BD10E0'; // 紫色
            default:
                return '#FFFFFF';
        }
    }
}

