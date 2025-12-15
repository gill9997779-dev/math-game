/**
 * 玩家角色类
 * 管理玩家的境界、修为、属性等
 */
export class Player {
    constructor(data = {}) {
        // 境界系统
        this.realm = data.realm || '炼气';
        this.realmLevel = data.realmLevel || 1;
        this.exp = data.exp || 0;
        this.expToNext = this.calculateExpToNext();
        
        // 属性
        this.maxHealth = data.maxHealth || 100;
        this.currentHealth = data.currentHealth || 100;
        this.mana = data.mana || 50;
        this.maxMana = data.maxMana || 50;
        
        // 位置信息
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.currentZone = data.currentZone || '青石村';
        
        // 收集物和成就
        this.collectibles = data.collectibles || [];
        this.achievements = data.achievements || [];
        
        // 统计数据
        this.totalProblemsSolved = data.totalProblemsSolved || 0;
        this.correctAnswers = data.correctAnswers || 0;
        this.totalAnswers = data.totalAnswers || 0;
        
        // 连击系统
        this.combo = data.combo || 0;
        this.maxCombo = data.maxCombo || 0;
        
        // 探索记录
        this.exploredZones = data.exploredZones || [];
        
        // 装备系统
        this.equippedItems = data.equippedItems || {
            weapon: null,
            armor: null,
            accessory: null
        };
    }
    
    /**
     * 境界等级表
     */
    static REALMS = [
        { name: '炼气', level: 1, expRequired: 0, color: '#8B7355' },
        { name: '筑基', level: 2, expRequired: 100, color: '#4A90E2' },
        { name: '金丹', level: 3, expRequired: 300, color: '#F5A623' },
        { name: '元婴', level: 4, expRequired: 700, color: '#BD10E0' },
        { name: '化神', level: 5, expRequired: 1500, color: '#50E3C2' },
        { name: '炼虚', level: 6, expRequired: 3000, color: '#B8E986' },
        { name: '合体', level: 7, expRequired: 6000, color: '#9013FE' },
        { name: '大乘', level: 8, expRequired: 12000, color: '#FF6B6B' },
        { name: '渡劫', level: 9, expRequired: 25000, color: '#FFD93D' }
    ];
    
    /**
     * 计算升级所需修为
     */
    calculateExpToNext() {
        const currentRealmData = Player.REALMS.find(r => r.name === this.realm);
        if (!currentRealmData) return 100;
        
        const nextRealm = Player.REALMS.find(r => r.level === currentRealmData.level + 1);
        if (!nextRealm) return Infinity; // 已达最高境界
        
        return nextRealm.expRequired - this.exp;
    }
    
    /**
     * 获得修为
     */
    gainExp(amount) {
        this.exp += amount;
        this.totalProblemsSolved++;
        
        // 检查是否可以升级
        const currentRealmData = Player.REALMS.find(r => r.name === this.realm);
        if (!currentRealmData) return false;
        
        const nextRealm = Player.REALMS.find(r => r.level === currentRealmData.level + 1);
        if (nextRealm && this.exp >= nextRealm.expRequired) {
            return this.levelUp();
        }
        
        this.expToNext = this.calculateExpToNext();
        return false;
    }
    
    /**
     * 境界提升
     */
    levelUp() {
        const currentRealmData = Player.REALMS.find(r => r.name === this.realm);
        if (!currentRealmData) return false;
        
        const nextRealm = Player.REALMS.find(r => r.level === currentRealmData.level + 1);
        if (!nextRealm) return false;
        
        this.realm = nextRealm.name;
        this.realmLevel = nextRealm.level;
        this.maxHealth += 20;
        this.currentHealth = this.maxHealth;
        this.maxMana += 10;
        this.mana = this.maxMana;
        this.expToNext = this.calculateExpToNext();
        
        // 境界提升时给予技能点
        if (window.gameData.skillSystem) {
            window.gameData.skillSystem.gainSkillPoint(1);
        }
        
        // 触发任务和成就系统更新
        if (window.gameData.taskSystem) {
            window.gameData.taskSystem.updateTaskProgress('realm_up', {}, this);
        }
        
        if (window.gameData.achievementSystem) {
            window.gameData.achievementSystem.checkAchievements(this, 'realm_up', {});
        }
        
        return true;
    }
    
    /**
     * 获取当前境界信息
     */
    getCurrentRealmData() {
        return Player.REALMS.find(r => r.name === this.realm) || Player.REALMS[0];
    }
    
    /**
     * 获取下一境界信息
     */
    getNextRealmData() {
        const current = this.getCurrentRealmData();
        return Player.REALMS.find(r => r.level === current.level + 1);
    }
    
    /**
     * 获取准确率
     */
    getAccuracy() {
        if (this.totalAnswers === 0) return 0;
        return Math.round((this.correctAnswers / this.totalAnswers) * 100);
    }
    
    /**
     * 记录答题结果
     */
    recordAnswer(isCorrect) {
        this.totalAnswers++;
        if (isCorrect) {
            this.correctAnswers++;
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        } else {
            this.combo = 0; // 答错重置连击
        }
    }
    
    /**
     * 获取连击奖励倍数
     */
    getComboMultiplier() {
        if (this.combo >= 20) return 2.0;
        if (this.combo >= 10) return 1.5;
        if (this.combo >= 5) return 1.2;
        return 1.0;
    }
    
    /**
     * 记录探索区域
     */
    exploreZone(zoneName) {
        if (!this.exploredZones.includes(zoneName)) {
            this.exploredZones.push(zoneName);
            return true; // 首次探索
        }
        return false;
    }
    
    /**
     * 添加收集物
     */
    addCollectible(item) {
        const existing = this.collectibles.find(c => c.id === item.id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            this.collectibles.push({ ...item, quantity: 1 });
        }
    }
    
    /**
     * 转换为可序列化的数据
     */
    toJSON() {
        return {
            realm: this.realm,
            realmLevel: this.realmLevel,
            exp: this.exp,
            maxHealth: this.maxHealth,
            currentHealth: this.currentHealth,
            mana: this.mana,
            maxMana: this.maxMana,
            x: this.x,
            y: this.y,
            currentZone: this.currentZone,
            collectibles: this.collectibles,
            achievements: this.achievements,
            totalProblemsSolved: this.totalProblemsSolved,
            correctAnswers: this.correctAnswers,
            totalAnswers: this.totalAnswers,
            combo: this.combo,
            maxCombo: this.maxCombo,
            exploredZones: this.exploredZones,
            equippedItems: this.equippedItems
        };
    }
    
    /**
     * 装备物品
     */
    equipItem(item) {
        if (item.type !== 'equipment') {
            return { success: false, message: '此物品无法装备' };
        }
        
        const slot = item.slot || 'weapon';
        const oldItem = this.equippedItems[slot];
        
        // 卸下旧装备
        if (oldItem) {
            this.addCollectible(oldItem);
        }
        
        // 装备新物品
        this.equippedItems[slot] = item;
        
        // 应用装备属性
        if (item.stats) {
            if (item.stats.attack) {
                // 攻击力加成在答题时应用
            }
            if (item.stats.defense) {
                // 防御力加成
            }
        }
        
        // 从背包移除
        const itemInInventory = this.collectibles.find(c => c.id === item.id);
        if (itemInInventory) {
            itemInInventory.quantity = (itemInInventory.quantity || 1) - 1;
            if (itemInInventory.quantity <= 0) {
                const index = this.collectibles.indexOf(itemInInventory);
                this.collectibles.splice(index, 1);
            }
        }
        
        return { success: true, message: `装备了 ${item.name}` };
    }
    
    /**
     * 卸下装备
     */
    unequipItem(slot) {
        const item = this.equippedItems[slot];
        if (!item) {
            return { success: false, message: '该位置没有装备' };
        }
        
        this.equippedItems[slot] = null;
        this.addCollectible(item);
        
        return { success: true, message: `卸下了 ${item.name}` };
    }
    
    /**
     * 使用物品（丹药等）
     */
    useItem(item) {
        if (item.type === 'pill') {
            if (!window.gameData.craftingSystem) {
                return { success: false, message: '合成系统未初始化' };
            }
            return window.gameData.craftingSystem.usePill(item, this);
        }
        return { success: false, message: '此物品无法使用' };
    }
    
    /**
     * 从数据恢复
     */
    static fromJSON(data) {
        return new Player(data);
    }
}

