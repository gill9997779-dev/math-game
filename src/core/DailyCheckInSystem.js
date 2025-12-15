/**
 * 每日签到系统
 * 管理玩家的每日签到奖励
 */
export class DailyCheckInSystem {
    constructor() {
        this.lastCheckInDate = null;
        this.consecutiveDays = 0;
        this.totalCheckIns = 0;
    }
    
    /**
     * 检查是否可以签到
     */
    canCheckIn() {
        const today = new Date().toDateString();
        return this.lastCheckInDate !== today;
    }
    
    /**
     * 执行签到
     */
    checkIn(player) {
        if (!this.canCheckIn()) {
            return { success: false, message: '今天已经签到过了！' };
        }
        
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        // 检查是否连续签到
        if (this.lastCheckInDate === yesterdayStr) {
            this.consecutiveDays++;
        } else if (this.lastCheckInDate !== today) {
            this.consecutiveDays = 1; // 重置连续天数
        }
        
        this.lastCheckInDate = today;
        this.totalCheckIns++;
        
        // 计算奖励（根据连续天数）
        const rewards = this.calculateRewards(this.consecutiveDays);
        
        // 发放奖励
        if (rewards.exp) {
            player.gainExp(rewards.exp);
        }
        
        if (rewards.items) {
            rewards.items.forEach(item => {
                player.addCollectible({ 
                    id: item.id, 
                    name: item.name, 
                    quantity: item.quantity 
                });
            });
        }
        
        return {
            success: true,
            message: `签到成功！连续签到 ${this.consecutiveDays} 天`,
            rewards: rewards,
            consecutiveDays: this.consecutiveDays
        };
    }
    
    /**
     * 计算奖励
     */
    calculateRewards(consecutiveDays) {
        const baseExp = 20;
        const expBonus = Math.min(consecutiveDays * 5, 50); // 最多额外50点
        const exp = baseExp + expBonus;
        
        const items = [];
        
        // 根据连续天数给予额外奖励
        if (consecutiveDays >= 7) {
            items.push({ id: 'pill_exp_boost', name: '修为丹', quantity: 1 });
        }
        if (consecutiveDays >= 3) {
            items.push({ id: 'herb_001', name: '青灵草', quantity: 3 });
        } else {
            items.push({ id: 'herb_001', name: '青灵草', quantity: 1 });
        }
        
        return { exp, items };
    }
    
    /**
     * 获取签到信息
     */
    getCheckInInfo() {
        return {
            canCheckIn: this.canCheckIn(),
            consecutiveDays: this.consecutiveDays,
            totalCheckIns: this.totalCheckIns,
            lastCheckInDate: this.lastCheckInDate
        };
    }
    
    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            lastCheckInDate: this.lastCheckInDate,
            consecutiveDays: this.consecutiveDays,
            totalCheckIns: this.totalCheckIns
        };
    }
    
    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        const system = new DailyCheckInSystem();
        system.lastCheckInDate = data.lastCheckInDate || null;
        system.consecutiveDays = data.consecutiveDays || 0;
        system.totalCheckIns = data.totalCheckIns || 0;
        return system;
    }
}

