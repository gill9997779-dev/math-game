/**
 * 随机事件系统
 * 在探索时触发随机事件
 */
export class EventSystem {
    constructor() {
        this.events = [];
        this.eventCooldown = 0;
        this.lastEventTime = 0;
    }
    
    /**
     * 初始化事件列表
     */
    initializeEvents() {
        this.events = [
            {
                id: 'event_001',
                type: 'positive',
                title: '奇遇：发现古卷',
                description: '你在探索时发现了一本古老的数学典籍，获得了修为奖励！',
                effect: { exp: 50 },
                probability: 0.3,
                icon: '📜'
            },
            {
                id: 'event_002',
                type: 'positive',
                title: '奇遇：灵草成熟',
                description: '你发现了一片成熟的灵草，获得了额外的材料！',
                effect: { items: [{ id: 'herb_001', quantity: 3 }] },
                probability: 0.25,
                icon: '🌿'
            },
            {
                id: 'event_003',
                type: 'positive',
                title: '奇遇：前辈指点',
                description: '一位前辈修士指点你，修为大增！',
                effect: { exp: 100 },
                probability: 0.15,
                icon: '👨‍🏫'
            },
            {
                id: 'event_004',
                type: 'positive',
                title: '奇遇：顿悟',
                description: '你突然顿悟了数学的奥秘，连击数增加！',
                effect: { comboBonus: 5 },
                probability: 0.2,
                icon: '💡'
            },
            {
                id: 'event_005',
                type: 'neutral',
                title: '事件：数学谜题',
                description: '你遇到了一个数学谜题，解答正确可获得奖励！',
                effect: { challenge: true, reward: { exp: 80 } },
                probability: 0.4,
                icon: '❓'
            },
            {
                id: 'event_006',
                type: 'negative',
                title: '事件：走火入魔',
                description: '你修炼时走火入魔，损失了一些修为！',
                effect: { exp: -30 },
                probability: 0.1,
                icon: '😵'
            },
            {
                id: 'event_007',
                type: 'positive',
                title: '奇遇：宝藏',
                description: '你发现了一个隐藏的宝藏，获得了大量资源！',
                effect: { items: [{ id: 'ore_001', quantity: 5 }, { id: 'herb_001', quantity: 5 }] },
                probability: 0.1,
                icon: '💎'
            }
        ];
    }
    
    /**
     * 尝试触发随机事件
     */
    tryTriggerEvent(player) {
        // 冷却时间检查（至少间隔30秒）
        const now = Date.now();
        if (now - this.lastEventTime < 30000) {
            return null;
        }
        
        // 随机决定是否触发事件
        if (Math.random() > 0.3) { // 30% 概率触发
            return null;
        }
        
        // 根据概率选择事件
        const availableEvents = this.events.filter(e => {
            return Math.random() <= e.probability;
        });
        
        if (availableEvents.length === 0) {
            return null;
        }
        
        // 随机选择一个事件
        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        this.lastEventTime = now;
        
        return event;
    }
    
    /**
     * 应用事件效果
     */
    applyEventEffect(event, player) {
        if (!event || !event.effect) return;
        
        if (event.effect.exp) {
            if (event.effect.exp > 0) {
                player.gainExp(event.effect.exp);
            } else {
                player.exp = Math.max(0, player.exp + event.effect.exp);
            }
        }
        
        if (event.effect.items) {
            event.effect.items.forEach(item => {
                player.addCollectible({ id: item.id, name: item.name, quantity: item.quantity });
            });
        }
        
        if (event.effect.comboBonus) {
            player.combo += event.effect.comboBonus;
        }
        
        return event.effect;
    }
}

