/**
 * 数学认知体系构建游戏 - 核心配置
 * 基于《从零构建数学认知体系：极限理论、几何悖论与分析学基础》
 * 
 * 游戏理念：
 * - 不仅仅是计算训练，而是数学思维的系统构建
 * - 从皮亚诺公理到微积分，体验数学大厦的完整建造过程
 * - 通过悖论和直觉危机，培养严密的逻辑思维
 * - 将抽象概念具象化，让玩家真正理解数学的本质
 */

// 数学认知体系的层级结构
export const MATHEMATICAL_HIERARCHY = {
    // 第一层：算术基础与数系扩张
    ARITHMETIC_FOUNDATION: {
        name: '算术基石',
        realm: '炼气',
        description: '从皮亚诺公理出发，理解数系的扩张与完备性',
        concepts: [
            'peano_axioms',      // 皮亚诺公理
            'natural_numbers',   // 自然数系统
            'integer_extension', // 整数扩张
            'rational_density',  // 有理数稠密性
            'irrational_discovery', // 无理数发现
            'real_completeness'  // 实数完备性
        ]
    },
    
    // 第二层：代数思维与符号推理
    ALGEBRAIC_THINKING: {
        name: '代数觉醒',
        realm: '筑基',
        description: '从算术计算转向符号推理，掌握抽象化思维',
        concepts: [
            'variable_abstraction', // 变量抽象化
            'functional_thinking',  // 函数思维
            'structural_algebra',   // 结构代数
            'equation_solving',     // 方程求解
            'inequality_reasoning', // 不等式推理
            'polynomial_factoring'  // 多项式因式分解
        ]
    },
    
    // 第三层：几何直觉与空间度量
    GEOMETRIC_INTUITION: {
        name: '几何洞察',
        realm: '金丹',
        description: '建立严格的欧几里得空间观念，理解度量的本质',
        concepts: [
            'euclidean_axioms',    // 欧几里得公理
            'distance_metrics',    // 距离度量
            'trigonometric_circle', // 三角函数圆
            'radian_measure',      // 弧度制
            'geometric_proof',     // 几何证明
            'coordinate_geometry'  // 解析几何
        ]
    },
    
    // 第四层：极限理论与无穷驯服
    LIMIT_THEORY: {
        name: '极限驯服',
        realm: '元婴',
        description: '系统解决无穷小的逻辑困境，建立严格的极限理论',
        concepts: [
            'zeno_paradoxes',      // 芝诺悖论
            'epsilon_delta',       // ε-δ定义
            'limit_intuition',     // 极限直觉
            'continuity_concept',  // 连续性概念
            'derivative_definition', // 导数定义
            'integral_foundation'  // 积分基础
        ]
    },
    
    // 第五层：几何悖论与分析学
    GEOMETRIC_PARADOXES: {
        name: '悖论解析',
        realm: '化神',
        description: '深入剖析几何悖论，理解收敛性的微妙差异',
        concepts: [
            'staircase_paradox',   // 阶梯悖论
            'schwarz_lantern',     // 施瓦茨灯笼
            'uniform_convergence', // 一致收敛
            'pointwise_convergence', // 逐点收敛
            'arc_length_formula',  // 弧长公式
            'surface_area_paradox' // 曲面积悖论
        ]
    },
    
    // 第六层：高等分析与数学哲学
    ADVANCED_ANALYSIS: {
        name: '分析精髓',
        realm: '炼虚',
        description: '掌握现代分析学的核心思想，理解数学的哲学本质',
        concepts: [
            'real_analysis',       // 实分析
            'measure_theory',      // 测度论
            'functional_analysis', // 泛函分析
            'topology_basics',     // 拓扑基础
            'mathematical_logic',  // 数学逻辑
            'set_theory_foundations' // 集合论基础
        ]
    }
};
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
        
        // 肉鸽词条系统（新增）
        this.activePerks = data.activePerks || [];
        
        // 数学概念掌握系统
        this.masteredConcepts = data.masteredConcepts || [];
        this.conceptProgress = data.conceptProgress || {}; // 概念学习进度
        this.currentConceptExploration = data.currentConceptExploration || null; // 当前探索的概念
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
        
        // 触发词条选择场景（境界突破时）
        // 使用全局 gameData 存储需要触发词条选择的标志
        window.gameData.shouldShowPerkSelection = true;
        window.gameData.pendingPerkSelectionPlayer = this;
        
        return true;
    }
    
    /**
     * 添加肉鸽词条
     */
    addPerk(perkId) {
        if (this.activePerks.includes(perkId)) {
            return false; // 已拥有该词条
        }
        
        this.activePerks.push(perkId);
        
        // 应用词条即时效果
        switch (perkId) {
            case 'BODY_REFINEMENT': // 体魄强化
                this.maxHealth += 50;
                this.currentHealth = Math.min(this.currentHealth + 50, this.maxHealth);
                break;
            case 'SPIRIT_BOOST': // 灵力增强
                this.maxMana += 30;
                this.mana = Math.min(this.mana + 30, this.maxMana);
                break;
            case 'EXP_BOOST': // 修为增益
                // 效果在战斗场景中应用
                break;
            // 其他词条效果在战斗场景中处理
        }
        
        return true;
    }
    
    /**
     * 检查是否拥有某个词条
     */
    hasPerk(perkId) {
        return this.activePerks.includes(perkId);
    }
    
    /**
     * 掌握数学概念
     */
    masterConcept(conceptId) {
        if (!this.masteredConcepts.includes(conceptId)) {
            this.masteredConcepts.push(conceptId);
            
            // 给予概念掌握奖励
            const conceptReward = this.getConceptMasteryReward(conceptId);
            this.gainExp(conceptReward.exp);
            
            // 触发成就检查
            if (window.gameData.achievementSystem) {
                window.gameData.achievementSystem.checkAchievements(this, 'concept_mastery', { conceptId });
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * 获取概念掌握奖励
     */
    getConceptMasteryReward(conceptId) {
        // 根据概念难度给予不同奖励
        const conceptRewards = {
            // 算术基础层
            'peano_axioms': { exp: 50, description: '掌握了数学的基石' },
            'irrational_discovery': { exp: 75, description: '发现了数系的奥秘' },
            
            // 代数觉醒层
            'variable_abstraction': { exp: 80, description: '领悟了抽象化思维' },
            'functional_thinking': { exp: 100, description: '领悟了函数的本质' },
            'equation_solving': { exp: 90, description: '掌握了方程求解的艺术' },
            
            // 几何洞察层
            'euclidean_axioms': { exp: 120, description: '理解了几何的逻辑基础' },
            'distance_metrics': { exp: 125, description: '理解了空间的度量' },
            'trigonometric_circle': { exp: 110, description: '掌握了三角函数的几何本质' },
            
            // 极限驯服层
            'epsilon_delta': { exp: 200, description: '驯服了无穷小' },
            'zeno_paradoxes': { exp: 150, description: '解决了古老的悖论' },
            'continuity_concept': { exp: 180, description: '理解了连续性的本质' },
            'derivative_definition': { exp: 220, description: '掌握了微积分的核心' },
            
            // 悖论解析层
            'staircase_paradox': { exp: 300, description: '洞察了收敛的微妙' },
            'schwarz_lantern': { exp: 350, description: '掌握了高维的奥秘' },
            
            // 分析精髓层
            'real_analysis': { exp: 400, description: '掌握了现代分析学' },
            'measure_theory': { exp: 450, description: '理解了测度的深刻内涵' }
        };
        
        return conceptRewards[conceptId] || { exp: 50, description: '掌握了新的数学概念' };
    }
    
    /**
     * 更新概念学习进度
     */
    updateConceptProgress(conceptId, progress) {
        this.conceptProgress[conceptId] = Math.max(0, Math.min(100, progress));
        
        // 如果进度达到100%，自动掌握概念
        if (this.conceptProgress[conceptId] >= 100) {
            this.masterConcept(conceptId);
        }
    }
    
    /**
     * 获取概念学习进度
     */
    getConceptProgress(conceptId) {
        return this.conceptProgress[conceptId] || 0;
    }
    
    /**
     * 检查概念是否已掌握
     */
    hasConceptMastered(conceptId) {
        return this.masteredConcepts.includes(conceptId);
    }
    
    /**
     * 获取可解锁的概念列表
     */
    getAvailableConcepts() {
        // 这里需要概念库的支持，暂时返回基础概念
        const basicConcepts = ['peano_axioms', 'irrational_discovery'];
        return basicConcepts.filter(conceptId => !this.hasConceptMastered(conceptId));
    }
    
    /**
     * 开始概念探索
     */
    startConceptExploration(conceptId) {
        this.currentConceptExploration = conceptId;
        if (!this.conceptProgress[conceptId]) {
            this.conceptProgress[conceptId] = 0;
        }
    }
    
    /**
     * 完成概念探索挑战
     */
    completeConceptChallenge(conceptId, challengeType, success) {
        if (success) {
            const progressGain = this.getProgressGainForChallenge(challengeType);
            const currentProgress = this.getConceptProgress(conceptId);
            this.updateConceptProgress(conceptId, currentProgress + progressGain);
            
            return {
                success: true,
                progressGain,
                newProgress: this.getConceptProgress(conceptId),
                mastered: this.hasConceptMastered(conceptId)
            };
        }
        
        return { success: false, progressGain: 0 };
    }
    
    /**
     * 获取挑战类型的进度增益
     */
    getProgressGainForChallenge(challengeType) {
        const progressMap = {
            // 基础挑战类型
            'construction': 25,
            'proof': 35,
            'visualization': 20,
            'exploration': 15,
            'composition': 20,
            'game': 30,
            'animation': 25,
            'calculation': 20,
            '3d_visualization': 30,
            'parameter_study': 25,
            'simulation': 25,
            'series': 20,
            
            // 新增挑战类型
            'substitution': 20,
            'pattern_recognition': 25,
            'balance_game': 30,
            'step_by_step': 25,
            'compass_ruler_construction': 35,
            'proof_exploration': 40,
            'circle_animation': 25,
            'wave_generation': 30,
            'discontinuity_classification': 35,
            'function_morphing': 30,
            'secant_to_tangent': 35,
            'practical_derivatives': 30,
            'convergence_analysis': 40,
            'compactness_properties': 40,
            'measure_building': 45,
            'integration_methods': 40
        };
        
        return progressMap[challengeType] || 15;
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
            equippedItems: this.equippedItems,
            activePerks: this.activePerks,
            masteredConcepts: this.masteredConcepts,
            conceptProgress: this.conceptProgress,
            currentConceptExploration: this.currentConceptExploration
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

