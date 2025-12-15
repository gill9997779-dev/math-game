/**
 * 宝藏系统
 * 管理隐藏宝箱和特殊区域
 */
export class TreasureSystem {
    constructor() {
        this.discoveredTreasures = [];
        this.treasures = [];
        this.initializeTreasures();
    }
    
    /**
     * 初始化宝藏
     */
    initializeTreasures() {
        this.treasures = [
            {
                id: 'treasure_001',
                zone: '青石村',
                x: 300,
                y: 500,
                name: '隐藏宝箱',
                type: 'chest',
                rarity: 'common',
                rewards: {
                    exp: 30,
                    items: [{ id: 'herb_001', name: '青灵草', quantity: 5 }]
                },
                discovered: false
            },
            {
                id: 'treasure_002',
                zone: '青石村',
                x: 900,
                y: 150,
                name: '神秘宝箱',
                type: 'chest',
                rarity: 'rare',
                rewards: {
                    exp: 100,
                    items: [
                        { id: 'ore_002', name: '五行矿石', quantity: 3 },
                        { id: 'pill_exp_boost', name: '修为丹', quantity: 1 }
                    ]
                },
                discovered: false
            },
            {
                id: 'treasure_003',
                zone: '五行山',
                x: 500,
                y: 300,
                name: '古老宝箱',
                type: 'chest',
                rarity: 'epic',
                rewards: {
                    exp: 200,
                    items: [
                        { id: 'herb_003', name: '上古灵草', quantity: 5 },
                        { id: 'pill_accuracy', name: '悟性丹', quantity: 1 }
                    ]
                },
                discovered: false
            },
            {
                id: 'special_001',
                zone: '青石村',
                x: 100,
                y: 600,
                name: '数学石碑',
                type: 'special',
                rarity: 'rare',
                description: '一块古老的石碑，上面刻着数学公式',
                rewards: {
                    exp: 50,
                    items: [{ id: 'herb_002', name: '五行草', quantity: 3 }]
                },
                discovered: false,
                requiresInteraction: true
            }
        ];
    }
    
    /**
     * 获取区域的宝藏
     */
    getTreasuresForZone(zoneName) {
        return this.treasures.filter(t => t.zone === zoneName && !t.discovered);
    }
    
    /**
     * 发现宝藏
     */
    discoverTreasure(treasureId, player) {
        const treasure = this.treasures.find(t => t.id === treasureId);
        if (!treasure || treasure.discovered) {
            return { success: false, message: '宝藏不存在或已被发现' };
        }
        
        treasure.discovered = true;
        this.discoveredTreasures.push(treasureId);
        
        // 发放奖励
        if (treasure.rewards.exp) {
            player.gainExp(treasure.rewards.exp);
        }
        
        if (treasure.rewards.items) {
            treasure.rewards.items.forEach(item => {
                player.addCollectible(item);
            });
        }
        
        return {
            success: true,
            message: `发现了${treasure.name}！`,
            rewards: treasure.rewards
        };
    }
    
    /**
     * 检查位置是否有宝藏
     */
    checkTreasureAtPosition(zoneName, x, y, radius = 50) {
        const treasures = this.getTreasuresForZone(zoneName);
        return treasures.find(t => {
            const distance = Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2));
            return distance <= radius;
        });
    }
    
    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            discoveredTreasures: this.discoveredTreasures,
            treasures: this.treasures
        };
    }
    
    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        const system = new TreasureSystem();
        system.discoveredTreasures = data.discoveredTreasures || [];
        system.treasures = data.treasures || system.treasures;
        
        // 恢复发现状态
        system.discoveredTreasures.forEach(id => {
            const treasure = system.treasures.find(t => t.id === id);
            if (treasure) {
                treasure.discovered = true;
            }
        });
        
        return system;
    }
}

