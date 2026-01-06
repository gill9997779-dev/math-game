/**
 * 技能/天赋系统
 * 管理玩家的技能和天赋
 */
export class SkillSystem {
    constructor() {
        this.unlockedSkills = [];
        this.skillPoints = 0;
        this.initializeSkills();
    }
    
    /**
     * 初始化技能树
     */
    initializeSkills() {
        this.skills = [
            {
                id: 'skill_exp_boost',
                name: '修为增益',
                description: '答题获得的修为增加10%',
                category: 'passive',
                cost: 1,
                maxLevel: 5,
                effect: { type: 'exp_multiplier', value: 0.1 },
                requirements: []
            },
            {
                id: 'skill_drop_rate',
                name: '幸运星',
                description: '掉落率增加5%',
                category: 'passive',
                cost: 1,
                maxLevel: 3,
                effect: { type: 'drop_rate', value: 0.05 },
                requirements: []
            },
            {
                id: 'skill_combo_boost',
                name: '连击大师',
                description: '连击奖励倍数增加0.1',
                category: 'passive',
                cost: 2,
                maxLevel: 3,
                effect: { type: 'combo_multiplier', value: 0.1 },
                requirements: []
            },
            {
                id: 'skill_accuracy',
                name: '数学天才',
                description: '答题准确率临时提升5%',
                category: 'active',
                cost: 2,
                maxLevel: 1,
                effect: { type: 'accuracy_boost', value: 5 },
                requirements: []
            },
            {
                id: 'skill_health_boost',
                name: '体魄增强',
                description: '最大生命值增加20',
                category: 'passive',
                cost: 1,
                maxLevel: 5,
                effect: { type: 'max_health', value: 20 },
                requirements: []
            },
            {
                id: 'skill_mana_boost',
                name: '灵力增强',
                description: '最大灵力增加10',
                category: 'passive',
                cost: 1,
                maxLevel: 5,
                effect: { type: 'max_mana', value: 10 },
                requirements: []
            }
        ];
    }
    
    /**
     * 解锁技能
     */
    unlockSkill(skillId, player) {
        const skill = this.skills.find(s => s.id === skillId);
        if (!skill) {
            return { success: false, message: '技能不存在' };
        }
        
        // 检查是否已解锁
        const unlocked = this.unlockedSkills.find(s => s.id === skillId);
        if (unlocked && unlocked.level >= skill.maxLevel) {
            return { success: false, message: '技能已达到最高等级' };
        }
        
        // 检查技能点
        if (this.skillPoints < skill.cost) {
            return { success: false, message: '技能点不足' };
        }
        
        // 检查前置要求
        if (skill.requirements.length > 0) {
            const hasRequirements = skill.requirements.every(req => {
                const reqSkill = this.unlockedSkills.find(s => s.id === req);
                return reqSkill && reqSkill.level > 0;
            });
            if (!hasRequirements) {
                return { success: false, message: '未满足前置技能要求' };
            }
        }
        
        // 消耗技能点
        this.skillPoints -= skill.cost;
        
        // 解锁或升级技能
        if (unlocked) {
            unlocked.level++;
        } else {
            this.unlockedSkills.push({ id: skillId, level: 1 });
        }
        
        // 应用技能效果
        this.applySkillEffect(skill, player);
        
        return { 
            success: true, 
            message: `成功${unlocked ? '升级' : '解锁'}技能：${skill.name}` 
        };
    }
    
    /**
     * 应用技能效果
     */
    applySkillEffect(skill, player) {
        const unlocked = this.unlockedSkills.find(s => s.id === skill.id);
        if (!unlocked) return;
        
        const level = unlocked.level;
        const effect = skill.effect;
        
        switch (effect.type) {
            case 'max_health':
                player.maxHealth += effect.value * level;
                player.currentHealth = Math.min(player.currentHealth, player.maxHealth);
                break;
            case 'max_mana':
                player.maxMana += effect.value * level;
                player.mana = Math.min(player.mana, player.maxMana);
                break;
            // 其他效果在相应系统中应用
        }
    }
    
    /**
     * 获取技能效果（用于计算）
     */
    getSkillEffect(effectType) {
        let totalValue = 0;
        
        this.unlockedSkills.forEach(unlocked => {
            const skill = this.skills.find(s => s.id === unlocked.id);
            if (skill && skill.effect.type === effectType) {
                totalValue += skill.effect.value * unlocked.level;
            }
        });
        
        return totalValue;
    }
    
    /**
     * 获得技能点
     */
    gainSkillPoint(amount = 1) {
        this.skillPoints += amount;
    }
    
    /**
     * 获取可用技能
     */
    getAvailableSkills() {
        return this.skills.map(skill => {
            const unlocked = this.unlockedSkills.find(s => s.id === skill.id);
            return {
                id: skill.id,
                name: skill.name,
                description: skill.description,
                cost: skill.cost,
                maxLevel: skill.maxLevel,
                effects: skill.effects,
                level: unlocked ? unlocked.level : 0,
                canUnlock: this.skillPoints >= skill.cost && 
                          (!unlocked || unlocked.level < skill.maxLevel)
            };
        });
    }
    
    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            unlockedSkills: this.unlockedSkills,
            skillPoints: this.skillPoints
        };
    }
    
    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        const system = new SkillSystem();
        system.unlockedSkills = data.unlockedSkills || [];
        system.skillPoints = data.skillPoints || 0;
        return system;
    }
}

