/**
 * 区域类
 * 管理游戏中的各个区域
 */
export class Zone {
    constructor(name, config) {
        this.name = name;
        this.realmRequired = config.realmRequired || '炼气';
        this.mathTopic = config.mathTopic || 'arithmetic';
        this.difficulty = config.difficulty || 1;
        this.background = config.background || '#2d2d44';
        this.description = config.description || '';
        this.mathSpirits = config.mathSpirits || [];
        this.resources = config.resources || [];
        this.unlocked = config.unlocked || false;
    }
    
    /**
     * 检查玩家是否可以进入此区域
     */
    canEnter(player) {
        const realmLevels = {
            '炼气': 1, '筑基': 2, '金丹': 3, '元婴': 4,
            '化神': 5, '炼虚': 6, '合体': 7, '大乘': 8, '渡劫': 9
        };
        
        const playerLevel = realmLevels[player.realm] || 1;
        const requiredLevel = realmLevels[this.realmRequired] || 1;
        
        return playerLevel >= requiredLevel && this.unlocked;
    }
    
    /**
     * 解锁区域
     */
    unlock() {
        this.unlocked = true;
    }
}

/**
 * 区域管理器
 */
export class ZoneManager {
    constructor() {
        this.zones = new Map();
        this.initializeZones();
    }
    
    /**
     * 初始化所有区域
     */
    initializeZones() {
        // 青石村 - 新手区
        this.zones.set('青石村', new Zone('青石村', {
            realmRequired: '炼气',
            mathTopic: 'arithmetic',
            difficulty: 1,
            background: '#4a6741',
            description: '一个宁静的小村庄，适合初学者修炼。这里散落着基础的数学之灵。',
            unlocked: true,
            mathSpirits: [
                { id: 'spirit_001', x: 200, y: 300, name: '加法之灵', difficulty: 1 },
                { id: 'spirit_002', x: 400, y: 200, name: '减法之灵', difficulty: 1 },
                { id: 'spirit_003', x: 600, y: 400, name: '乘法之灵', difficulty: 1 },
                { id: 'spirit_004', x: 800, y: 300, name: '除法之灵', difficulty: 1 }
            ],
            resources: [
                { id: 'herb_001', x: 150, y: 150, type: 'herb', name: '青灵草' },
                { id: 'ore_001', x: 500, y: 500, type: 'ore', name: '基础矿石' }
            ]
        }));
        
        // 五行山 - 进阶区
        this.zones.set('五行山', new Zone('五行山', {
            realmRequired: '金丹',
            mathTopic: 'algebra',
            difficulty: 2,
            background: '#8b4513',
            description: '五座山峰环绕的神秘之地，蕴含着代数的奥秘。',
            unlocked: false,
            mathSpirits: [
                { id: 'spirit_005', x: 300, y: 250, name: '方程之灵', difficulty: 2 },
                { id: 'spirit_006', x: 700, y: 350, name: '不等式之灵', difficulty: 2 }
            ],
            resources: [
                { id: 'herb_002', x: 200, y: 400, type: 'herb', name: '五行草' },
                { id: 'ore_002', x: 800, y: 200, type: 'ore', name: '五行矿石' }
            ]
        }));
        
        // 上古遗迹 - 高阶区
        this.zones.set('上古遗迹', new Zone('上古遗迹', {
            realmRequired: '元婴',
            mathTopic: 'geometry',
            difficulty: 3,
            background: '#2d1b4e',
            description: '古老的遗迹，几何与函数的智慧深藏其中。',
            unlocked: false,
            mathSpirits: [
                { id: 'spirit_007', x: 400, y: 300, name: '几何之灵', difficulty: 3 },
                { id: 'spirit_008', x: 800, y: 500, name: '函数之灵', difficulty: 3 }
            ],
            resources: [
                { id: 'herb_003', x: 300, y: 600, type: 'herb', name: '上古灵草' },
                { id: 'ore_003', x: 900, y: 300, type: 'ore', name: '上古矿石' }
            ]
        }));
    }
    
    /**
     * 获取区域
     */
    getZone(name) {
        return this.zones.get(name);
    }
    
    /**
     * 获取所有区域
     */
    getAllZones() {
        return Array.from(this.zones.values());
    }
    
    /**
     * 根据境界解锁区域
     */
    unlockZonesForRealm(realm) {
        const realmLevels = {
            '炼气': 1, '筑基': 2, '金丹': 3, '元婴': 4,
            '化神': 5, '炼虚': 6, '合体': 7, '大乘': 8, '渡劫': 9
        };
        
        const playerLevel = realmLevels[realm] || 1;
        
        this.zones.forEach(zone => {
            const requiredLevel = realmLevels[zone.realmRequired] || 1;
            if (playerLevel >= requiredLevel) {
                zone.unlock();
            }
        });
    }
}

