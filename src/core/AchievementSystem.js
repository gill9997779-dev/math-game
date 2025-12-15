/**
 * 成就系统
 * 管理游戏中的各种成就
 */
export class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.unlockedAchievements = [];
        this.initializeAchievements();
    }
    
    /**
     * 初始化成就列表
     */
    initializeAchievements() {
        this.achievements = [
            {
                id: 'ach_001',
                title: '初出茅庐',
                description: '解答第一道题目',
                condition: { type: 'solve_count', count: 1 },
                reward: { exp: 20 },
                icon: '🌟',
                unlocked: false
            },
            {
                id: 'ach_002',
                title: '百题斩',
                description: '解答100道题目',
                condition: { type: 'solve_count', count: 100 },
                reward: { exp: 500 },
                icon: '⚔️',
                unlocked: false
            },
            {
                id: 'ach_003',
                title: '完美答题',
                description: '连续答对20道题目',
                condition: { type: 'combo', count: 20 },
                reward: { exp: 300 },
                icon: '💯',
                unlocked: false
            },
            {
                id: 'ach_004',
                title: '筑基成功',
                description: '达到筑基期',
                condition: { type: 'reach_realm', realm: '筑基' },
                reward: { exp: 200 },
                icon: '✨',
                unlocked: false
            },
            {
                id: 'ach_005',
                title: '金丹大道',
                description: '达到金丹期',
                condition: { type: 'reach_realm', realm: '金丹' },
                reward: { exp: 500 },
                icon: '🔮',
                unlocked: false
            },
            {
                id: 'ach_006',
                title: '收集大师',
                description: '收集50个物品',
                condition: { type: 'collect_count', count: 50 },
                reward: { exp: 200 },
                icon: '📦',
                unlocked: false
            },
            {
                id: 'ach_007',
                title: '数学天才',
                description: '准确率达到95%以上（至少50题）',
                condition: { type: 'accuracy', accuracy: 95, minProblems: 50 },
                reward: { exp: 1000 },
                icon: '🧠',
                unlocked: false
            },
            {
                id: 'ach_008',
                title: '探索者',
                description: '探索所有区域',
                condition: { type: 'explore_all_zones' },
                reward: { exp: 300 },
                icon: '🗺️',
                unlocked: false
            }
        ];
    }
    
    /**
     * 检查成就
     */
    checkAchievements(player, eventType, data) {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            let shouldUnlock = false;
            
            switch (achievement.condition.type) {
                case 'solve_count':
                    if (player.totalProblemsSolved >= achievement.condition.count) {
                        shouldUnlock = true;
                    }
                    break;
                    
                case 'combo':
                    if (data && data.combo >= achievement.condition.count) {
                        shouldUnlock = true;
                    }
                    break;
                    
                case 'reach_realm':
                    if (player.realm === achievement.condition.realm) {
                        shouldUnlock = true;
                    }
                    break;
                    
                case 'collect_count':
                    const totalCollected = player.collectibles.reduce((sum, item) => sum + (item.quantity || 1), 0);
                    if (totalCollected >= achievement.condition.count) {
                        shouldUnlock = true;
                    }
                    break;
                    
                case 'accuracy':
                    if (player.totalAnswers >= achievement.condition.minProblems) {
                        const accuracy = player.getAccuracy();
                        if (accuracy >= achievement.condition.accuracy) {
                            shouldUnlock = true;
                        }
                    }
                    break;
                    
                case 'explore_all_zones':
                    // 需要检查是否探索了所有区域
                    if (data && data.allZonesExplored) {
                        shouldUnlock = true;
                    }
                    break;
            }
            
            if (shouldUnlock) {
                this.unlockAchievement(achievement.id, player);
            }
        });
    }
    
    /**
     * 解锁成就
     */
    unlockAchievement(achievementId, player) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return false;
        
        achievement.unlocked = true;
        this.unlockedAchievements.push(achievementId);
        
        // 发放奖励
        if (achievement.reward.exp) {
            player.gainExp(achievement.reward.exp);
        }
        
        return true;
    }
    
    /**
     * 获取已解锁成就
     */
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }
    
    /**
     * 获取未解锁成就
     */
    getLockedAchievements() {
        return this.achievements.filter(a => !a.unlocked);
    }
    
    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            achievements: this.achievements,
            unlockedAchievements: this.unlockedAchievements
        };
    }
    
    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        const system = new AchievementSystem();
        system.achievements = data.achievements || system.achievements;
        system.unlockedAchievements = data.unlockedAchievements || [];
        
        // 恢复解锁状态
        system.unlockedAchievements.forEach(id => {
            const achievement = system.achievements.find(a => a.id === id);
            if (achievement) {
                achievement.unlocked = true;
            }
        });
        
        return system;
    }
}

