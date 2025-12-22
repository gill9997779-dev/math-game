/**
 * 商店系统
 * 管理商店物品的购买和出售
 */
export class ShopSystem {
    constructor() {
        this.initializeShop();
    }
    
    /**
     * 初始化商店物品
     */
    initializeShop() {
        this.shopItems = [
            // 材料商店
            {
                id: 'shop_herb_001',
                name: '青灵草',
                type: 'material',
                price: { type: 'ore_001', amount: 2 },
                stock: -1, // -1表示无限
                category: 'materials'
            },
            {
                id: 'shop_ore_001',
                name: '基础矿石',
                type: 'material',
                price: { type: 'herb_001', amount: 2 },
                stock: -1,
                category: 'materials'
            },
            {
                id: 'shop_herb_002',
                name: '五行草',
                type: 'material',
                price: { type: 'ore_001', amount: 5 },
                stock: -1,
                category: 'materials'
            },
            {
                id: 'shop_ore_002',
                name: '五行矿石',
                type: 'material',
                price: { type: 'herb_001', amount: 5 },
                stock: -1,
                category: 'materials'
            },
            
            // 道具商店
            {
                id: 'shop_pill_health',
                name: '回血丹',
                type: 'pill',
                price: { type: 'herb_001', amount: 3 },
                stock: -1,
                category: 'items',
                effect: 'heal',
                value: 50
            },
            {
                id: 'shop_pill_mana',
                name: '回灵丹',
                type: 'pill',
                price: { type: 'herb_002', amount: 2 },
                stock: -1,
                category: 'items',
                effect: 'mana_restore',
                value: 30
            },
            {
                id: 'shop_pill_exp',
                name: '修为丹',
                type: 'pill',
                price: { type: 'ore_002', amount: 3 },
                stock: -1,
                category: 'items',
                effect: 'exp_boost',
                value: 50
            },
            
            // 特殊物品
            {
                id: 'shop_skill_point',
                name: '技能点',
                type: 'special',
                price: { type: 'ore_002', amount: 10 },
                stock: -1,
                category: 'special',
                effect: 'skill_point',
                value: 1
            }
        ];
    }
    
    /**
     * 购买物品
     */
    buyItem(itemId, player) {
        const shopItem = this.shopItems.find(item => item.id === itemId);
        if (!shopItem) {
            return { success: false, message: '物品不存在' };
        }
        
        // 检查库存
        if (shopItem.stock !== -1 && shopItem.stock <= 0) {
            return { success: false, message: '物品已售罄' };
        }
        
        // 检查是否有足够的货币
        const price = shopItem.price;
        const playerItem = player.collectibles.find(c => c.id === price.type);
        if (!playerItem || (playerItem.quantity || 1) < price.amount) {
            return { success: false, message: '材料不足' };
        }
        
        // 扣除货币
        playerItem.quantity = (playerItem.quantity || 1) - price.amount;
        if (playerItem.quantity <= 0) {
            const index = player.collectibles.indexOf(playerItem);
            player.collectibles.splice(index, 1);
        }
        
        // 添加购买的物品
        if (shopItem.type === 'special' && shopItem.effect === 'skill_point') {
            if (window.gameData.skillSystem) {
                window.gameData.skillSystem.gainSkillPoint(shopItem.value);
            }
        } else {
            player.addCollectible({
                id: shopItem.id.replace('shop_', ''),
                name: shopItem.name,
                type: shopItem.type,
                effect: shopItem.effect,
                value: shopItem.value,
                quantity: 1
            });
        }
        
        // 更新库存
        if (shopItem.stock !== -1) {
            shopItem.stock--;
        }
        
        return { 
            success: true, 
            message: `成功购买 ${shopItem.name}！` 
        };
    }
    
    /**
     * 出售物品
     */
    sellItem(itemId, quantity, player) {
        const playerItem = player.collectibles.find(c => c.id === itemId);
        if (!playerItem || (playerItem.quantity || 1) < quantity) {
            return { success: false, message: '物品不足' };
        }
        
        // 计算出售价格（通常是购买价格的一半）
        const shopItem = this.shopItems.find(item => 
            item.id.replace('shop_', '') === itemId
        );
        
        if (!shopItem) {
            return { success: false, message: '此物品无法出售' };
        }
        
        // 计算获得的货币
        const price = shopItem.price;
        const sellPrice = Math.floor(price.amount / 2);
        
        // 扣除物品
        playerItem.quantity = (playerItem.quantity || 1) - quantity;
        if (playerItem.quantity <= 0) {
            const index = player.collectibles.indexOf(playerItem);
            player.collectibles.splice(index, 1);
        }
        
        // 添加货币（简化处理，给基础材料）
        const currencyItem = player.collectibles.find(c => c.id === 'ore_001');
        const totalCurrency = sellPrice * quantity;
        
        if (currencyItem) {
            currencyItem.quantity = (currencyItem.quantity || 1) + totalCurrency;
        } else {
            player.addCollectible({
                id: 'ore_001',
                name: '基础矿石',
                type: 'material',
                quantity: totalCurrency
            });
        }
        
        return { 
            success: true, 
            message: `成功出售 ${quantity} 个物品，获得 ${totalCurrency} 基础矿石` 
        };
    }
    
    /**
     * 获取商店物品列表
     */
    getShopItems(category = 'all') {
        if (category === 'all') {
            return this.shopItems;
        }
        return this.shopItems.filter(item => item.category === category);
    }
}

