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
            resources: [] // 移除资源，统一到资源秘境
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
            resources: [] // 移除资源，统一到资源秘境
        }));
        
        // 上古遗迹 - 高阶区（几何专题）
        this.zones.set('上古遗迹', new Zone('上古遗迹', {
            realmRequired: '元婴',
            mathTopic: 'geometry',
            difficulty: 3,
            background: '#2d1b4e',
            description: '古老的遗迹，几何图形的奥秘深藏其中。每个图形之灵都掌握着不同的几何性质。',
            unlocked: false,
            mathSpirits: [
                { id: 'spirit_007_1', x: 200, y: 200, name: '三角形之灵', difficulty: 3, geometryType: 'triangle' },
                { id: 'spirit_007_2', x: 400, y: 200, name: '圆形之灵', difficulty: 3, geometryType: 'circle' },
                { id: 'spirit_007_3', x: 600, y: 200, name: '矩形之灵', difficulty: 3, geometryType: 'rectangle' },
                { id: 'spirit_007_4', x: 800, y: 200, name: '正方形之灵', difficulty: 3, geometryType: 'square' },
                { id: 'spirit_007_5', x: 300, y: 400, name: '平行四边形之灵', difficulty: 3, geometryType: 'parallelogram' },
                { id: 'spirit_007_6', x: 600, y: 400, name: '梯形之灵', difficulty: 3, geometryType: 'trapezoid' },
                { id: 'spirit_008', x: 900, y: 500, name: '函数之灵', difficulty: 3 }
            ],
            resources: [] // 移除资源，统一到资源秘境
        }));
        
        // 天机阁 - 进阶区（比加减乘除更复杂）
        this.zones.set('天机阁', new Zone('天机阁', {
            realmRequired: '筑基',
            mathTopic: 'fraction',
            difficulty: 2,
            background: '#3d2d5e',
            description: '神秘的数理秘境，分数与小数运算的试炼之地。',
            unlocked: false,
            mathSpirits: [
                { id: 'spirit_009', x: 350, y: 350, name: '分数之灵', difficulty: 2 },
                { id: 'spirit_010', x: 750, y: 400, name: '小数之灵', difficulty: 2 }
            ],
            resources: [] // 移除资源，统一到资源秘境
        }));
        
        // 资源秘境 - 所有资源的集中地
        this.zones.set('资源秘境', new Zone('资源秘境', {
            realmRequired: '炼气',
            mathTopic: 'arithmetic',
            difficulty: 1,
            background: '#2d5a3d',
            description: '资源丰富的秘境，这里聚集了所有的草药、矿石和宝箱。',
            unlocked: true, // 默认解锁，所有玩家都可以进入
            mathSpirits: [], // 资源地图不需要数学之灵
            resources: [] // 资源由 GameScene 动态生成
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


