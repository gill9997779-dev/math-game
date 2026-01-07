/**
 * 限时挑战系统
 * 管理限时答题挑战
 */
export class ChallengeSystem {
    constructor() {
        this.activeChallenge = null;
        this.challengeHistory = [];
    }
    
    /**
     * 开始限时挑战
     */
    startChallenge(difficulty = 1, timeLimit = 60) {
        this.activeChallenge = {
            id: Date.now().toString(),
            difficulty: difficulty,
            timeLimit: timeLimit, // 秒
            startTime: Date.now(),
            problemsSolved: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            rewards: {
                exp: 0,
                items: []
            }
        };
        
        return this.activeChallenge;
    }
    
    /**
     * 记录答题
     */
    recordAnswer(isCorrect) {
        if (!this.activeChallenge) return;
        
        this.activeChallenge.totalAnswers++;
        if (isCorrect) {
            this.activeChallenge.correctAnswers++;
            this.activeChallenge.problemsSolved++;
        }
    }
    
    /**
     * 完成挑战
     */
    completeChallenge(player) {
        if (!this.activeChallenge) {
            return { success: false, message: '没有进行中的挑战' };
        }
        
        const challenge = this.activeChallenge;
        const accuracy = challenge.totalAnswers > 0 
            ? (challenge.correctAnswers / challenge.totalAnswers) * 100 
            : 0;
        
        // 计算奖励
        const baseExp = challenge.problemsSolved * 15;
        const accuracyBonus = Math.floor(baseExp * (accuracy / 100));
        const timeBonus = this.calculateTimeBonus(challenge);
        
        const totalExp = baseExp + accuracyBonus + timeBonus;
        
        // 根据表现给予额外奖励
        const items = [];
        if (accuracy >= 90 && challenge.problemsSolved >= 5) {
            items.push({ id: 'pill_exp_boost', name: '修为丹', quantity: 1 });
        }
        if (challenge.problemsSolved >= 10) {
            items.push({ id: 'herb_002', name: '五行草', quantity: 2 });
        }
        
        // 发放奖励
        if (totalExp > 0) {
            player.gainExp(totalExp);
        }
        
        items.forEach(item => {
            player.addCollectible(item);
        });
        
        const result = {
            success: true,
            problemsSolved: challenge.problemsSolved,
            accuracy: Math.round(accuracy),
            expGained: totalExp,
            items: items
        };
        
        // 保存到历史
        this.challengeHistory.push({
            id: challenge.id,
            type: challenge.type,
            title: challenge.title,
            description: challenge.description,
            challenge: challenge.challenge,
            endTime: Date.now(),
            result: result
        });
        
        this.activeChallenge = null;
        
        return result;
    }
    
    /**
     * 计算时间奖励
     */
    calculateTimeBonus(challenge) {
        const elapsed = (Date.now() - challenge.startTime) / 1000;
        const remaining = challenge.timeLimit - elapsed;
        
        if (remaining > challenge.timeLimit * 0.5) {
            return 50; // 剩余时间超过50%，额外奖励
        } else if (remaining > 0) {
            return 20; // 剩余时间在0-50%之间
        }
        return 0; // 超时无奖励
    }
    
    /**
     * 获取剩余时间
     */
    getRemainingTime() {
        if (!this.activeChallenge) return 0;
        
        const elapsed = (Date.now() - this.activeChallenge.startTime) / 1000;
        const remaining = this.activeChallenge.timeLimit - elapsed;
        return Math.max(0, Math.floor(remaining));
    }
    
    /**
     * 检查挑战是否超时
     */
    isChallengeExpired() {
        if (!this.activeChallenge) return false;
        return this.getRemainingTime() <= 0;
    }
    
    /**
     * 取消挑战
     */
    cancelChallenge() {
        this.activeChallenge = null;
    }
    
    /**
     * 获取挑战历史
     */
    getChallengeHistory(limit = 10) {
        return this.challengeHistory.slice(-limit).reverse();
    }
    
    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            activeChallenge: this.activeChallenge,
            challengeHistory: this.challengeHistory.slice(-20) // 只保存最近20条
        };
    }
    
    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        const system = new ChallengeSystem();
        system.activeChallenge = data.activeChallenge || null;
        system.challengeHistory = data.challengeHistory || [];
        return system;
    }
}

