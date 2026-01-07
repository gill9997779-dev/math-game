/**
 * 奖励系统
 * 管理游戏中的各种奖励、特效和反馈
 */

export class RewardSystem {
    constructor() {
        this.pendingRewards = [];
        this.dailyRewards = this.initDailyRewards();
        this.streakRewards = this.initStreakRewards();
    }
    
    /**
     * 初始化每日奖励
     */
    initDailyRewards() {
        return [
            { day: 1, rewards: [{ type: 'exp', amount: 50 }, { type: 'gold', amount: 100 }] },
            { day: 2, rewards: [{ type: 'exp', amount: 80 }, { type: 'item', id: 'herb_001', amount: 3 }] },
            { day: 3, rewards: [{ type: 'exp', amount: 120 }, { type: 'gold', amount: 200 }] },
            { day: 4, rewards: [{ type: 'exp', amount: 150 }, { type: 'item', id: 'pill_exp_boost', amount: 1 }] },
            { day: 5, rewards: [{ type: 'exp', amount: 200 }, { type: 'gold', amount: 500 }] },
            { day: 6, rewards: [{ type: 'exp', amount: 250 }, { type: 'item', id: 'ore_002', amount: 5 }] },
            { day: 7, rewards: [{ type: 'exp', amount: 500 }, { type: 'gold', amount: 1000 }, { type: 'item', id: 'pill_health', amount: 3 }] }
        ];
    }
    
    /**
     * 初始化连续登录奖励
     */
    initStreakRewards() {
        return {
            7: { title: '一周坚持', rewards: [{ type: 'exp', amount: 1000 }] },
            14: { title: '两周修炼', rewards: [{ type: 'exp', amount: 2500 }] },
            30: { title: '月度精进', rewards: [{ type: 'exp', amount: 5000 }, { type: 'title', id: 'monthly_cultivator' }] },
            100: { title: '百日筑基', rewards: [{ type: 'exp', amount: 20000 }, { type: 'title', id: 'hundred_days' }] }
        };
    }
    
    /**
     * 计算答题奖励
     */
    calculateAnswerReward(isCorrect, combo, difficulty, player) {
        if (!isCorrect) {
            return { exp: 0, gold: 0, bonus: [] };
        }
        
        // 基础奖励
        let baseExp = 10 * difficulty;
        let baseGold = 5 * difficulty;
        
        // 连击加成
        const comboMultiplier = 1 + (combo * 0.1);
        
        // 境界加成
        const realmBonus = this.getRealmBonus(player?.realm);
        
        // 技能加成
        const skillBonus = player?.getExpMultiplier?.() || 1;
        
        // 计算最终奖励
        const finalExp = Math.floor(baseExp * comboMultiplier * realmBonus * skillBonus);
        const finalGold = Math.floor(baseGold * comboMultiplier);
        
        // 额外奖励
        const bonus = [];
        
        // 连击里程碑奖励
        if (combo === 5) {
            bonus.push({ type: 'combo_milestone', message: '5连击！', extraExp: 50 });
        } else if (combo === 10) {
            bonus.push({ type: 'combo_milestone', message: '10连击！完美！', extraExp: 150 });
        } else if (combo === 20) {
            bonus.push({ type: 'combo_milestone', message: '20连击！传说！', extraExp: 500 });
        }
        
        // 随机暴击
        if (Math.random() < 0.05) {
            bonus.push({ type: 'critical', message: '暴击！', multiplier: 2 });
        }
        
        return {
            exp: finalExp,
            gold: finalGold,
            bonus: bonus
        };
    }
    
    /**
     * 获取境界加成
     */
    getRealmBonus(realm) {
        const bonuses = {
            '炼气': 1.0,
            '筑基': 1.1,
            '金丹': 1.2,
            '元婴': 1.3,
            '化神': 1.5,
            '炼虚': 1.7,
            '合体': 2.0,
            '大乘': 2.5,
            '渡劫': 3.0
        };
        return bonuses[realm] || 1.0;
    }
    
    /**
     * 获取今日奖励
     */
    getDailyReward(dayIndex) {
        const index = (dayIndex - 1) % 7;
        return this.dailyRewards[index];
    }
    
    /**
     * 检查连续登录奖励
     */
    checkStreakReward(streak) {
        return this.streakRewards[streak] || null;
    }
    
    /**
     * 生成随机掉落
     */
    generateRandomDrop(difficulty, combo) {
        // 基础掉落率
        let dropRate = 0.1 + (difficulty * 0.05) + (combo * 0.02);
        dropRate = Math.min(dropRate, 0.5); // 最高50%
        
        if (Math.random() > dropRate) {
            return null;
        }
        
        // 掉落物品池
        const dropPool = this.getDropPool(difficulty);
        
        // 根据稀有度权重选择
        const totalWeight = dropPool.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of dropPool) {
            random -= item.weight;
            if (random <= 0) {
                return {
                    ...item,
                    quantity: Math.floor(Math.random() * item.maxQuantity) + 1
                };
            }
        }
        
        return dropPool[0];
    }
    
    /**
     * 获取掉落池
     */
    getDropPool(difficulty) {
        const basePools = [
            // 普通材料
            { id: 'herb_001', name: '灵草', rarity: 'common', weight: 40, maxQuantity: 3 },
            { id: 'herb_002', name: '仙草', rarity: 'common', weight: 30, maxQuantity: 2 },
            { id: 'ore_001', name: '灵石', rarity: 'common', weight: 35, maxQuantity: 3 },
            
            // 稀有材料
            { id: 'herb_003', name: '九转灵芝', rarity: 'rare', weight: 15, maxQuantity: 1 },
            { id: 'ore_002', name: '玄铁', rarity: 'rare', weight: 12, maxQuantity: 2 },
            
            // 史诗材料
            { id: 'essence_001', name: '天地精华', rarity: 'epic', weight: 5, maxQuantity: 1 },
            
            // 传说材料
            { id: 'divine_001', name: '仙灵之泪', rarity: 'legendary', weight: 1, maxQuantity: 1 }
        ];
        
        // 根据难度调整权重
        return basePools.map(item => ({
            ...item,
            weight: item.rarity === 'legendary' ? item.weight * difficulty : item.weight
        }));
    }
    
    /**
     * 获取稀有度颜色
     */
    getRarityColor(rarity) {
        const colors = {
            common: '#FFFFFF',
            uncommon: '#50E3C2',
            rare: '#667EEA',
            epic: '#9013FE',
            legendary: '#FFD700'
        };
        return colors[rarity] || '#FFFFFF';
    }
    
    /**
     * 获取稀有度名称
     */
    getRarityName(rarity) {
        const names = {
            common: '普通',
            uncommon: '优秀',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };
        return names[rarity] || '普通';
    }
}

/**
 * 奖励动画管理器
 * 在场景中显示奖励特效
 */
export class RewardAnimator {
    constructor(scene) {
        this.scene = scene;
        this.rewardQueue = [];
        this.isPlaying = false;
    }
    
    /**
     * 显示经验获得动画
     */
    showExpGain(amount, x, y, options = {}) {
        const { combo = 0, isCritical = false } = options;
        
        let text = `+${amount} 修为`;
        let color = '#50E3C2';
        let fontSize = '28px';
        
        if (isCritical) {
            text = `暴击！+${amount} 修为`;
            color = '#FFD700';
            fontSize = '36px';
        } else if (combo >= 10) {
            color = '#FF6B6B';
            fontSize = '32px';
        } else if (combo >= 5) {
            color = '#FFA500';
            fontSize = '30px';
        }
        
        const expText = this.scene.add.text(x, y, text, {
            fontSize: fontSize,
            fill: color,
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);
        
        // 上升并消失
        this.scene.tweens.add({
            targets: expText,
            y: y - 80,
            alpha: 0,
            scale: isCritical ? 1.5 : 1.2,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => expText.destroy()
        });
        
        return expText;
    }
    
    /**
     * 显示连击动画
     */
    showComboAnimation(combo, x, y) {
        if (combo < 2) return;
        
        const container = this.scene.add.container(x, y);
        container.setDepth(200);
        
        // 连击数字
        const comboText = this.scene.add.text(0, 0, combo.toString(), {
            fontSize: '72px',
            fill: combo >= 10 ? '#FF6B6B' : combo >= 5 ? '#FFA500' : '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // COMBO 文字
        const labelText = this.scene.add.text(0, 50, 'COMBO', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        container.add([comboText, labelText]);
        
        // 缩放动画
        container.setScale(0);
        this.scene.tweens.add({
            targets: container,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        // 消失动画
        this.scene.tweens.add({
            targets: container,
            alpha: 0,
            scale: 1.5,
            duration: 500,
            delay: 500,
            onComplete: () => container.destroy()
        });
        
        // 高连击时屏幕震动
        if (combo >= 5) {
            this.scene.cameras.main.shake(100, 0.005 * Math.min(combo, 20));
        }
        
        return container;
    }
    
    /**
     * 显示物品掉落动画
     */
    showItemDrop(item, x, y) {
        const container = this.scene.add.container(x, y - 50);
        container.setDepth(200);
        
        // 背景光效
        const glow = this.scene.add.circle(0, 0, 40, 
            parseInt(this.getRarityColorHex(item.rarity).replace('#', '0x')), 0.3);
        
        // 物品名称
        const nameText = this.scene.add.text(0, 0, item.name, {
            fontSize: '24px',
            fill: this.getRarityColorHex(item.rarity),
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // 数量
        let quantityText = null;
        if (item.quantity > 1) {
            quantityText = this.scene.add.text(0, 30, `x${item.quantity}`, {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5);
        }
        
        container.add([glow, nameText]);
        if (quantityText) container.add(quantityText);
        
        // 入场动画
        container.setScale(0);
        container.setAlpha(0);
        
        this.scene.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            y: y - 100,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // 闪烁效果（稀有物品）
        if (item.rarity === 'epic' || item.rarity === 'legendary') {
            this.scene.tweens.add({
                targets: glow,
                scale: { from: 1, to: 1.5 },
                alpha: { from: 0.3, to: 0.1 },
                duration: 500,
                yoyo: true,
                repeat: 3
            });
        }
        
        // 消失动画
        this.scene.tweens.add({
            targets: container,
            alpha: 0,
            y: y - 150,
            duration: 500,
            delay: 2000,
            onComplete: () => container.destroy()
        });
        
        return container;
    }
    
    /**
     * 显示成就解锁动画
     */
    showAchievementUnlock(achievement) {
        const width = this.scene.cameras.main.width;
        
        const container = this.scene.add.container(width / 2, -100);
        container.setDepth(300);
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 400, 80, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        
        // 图标
        const icon = this.scene.add.text(-170, 0, achievement.icon || '🏆', {
            fontSize: '40px'
        }).setOrigin(0.5);
        
        // 标题
        const title = this.scene.add.text(-100, -15, '成就解锁！', {
            fontSize: '16px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0, 0.5);
        
        // 成就名称
        const name = this.scene.add.text(-100, 15, achievement.title, {
            fontSize: '22px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        container.add([bg, icon, title, name]);
        
        // 入场动画
        this.scene.tweens.add({
            targets: container,
            y: 80,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // 停留后退出
        this.scene.tweens.add({
            targets: container,
            y: -100,
            duration: 500,
            delay: 3000,
            ease: 'Power2',
            onComplete: () => container.destroy()
        });
        
        return container;
    }
    
    /**
     * 显示境界突破动画
     */
    showRealmBreakthrough(newRealm) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // 全屏闪光
        const flash = this.scene.add.rectangle(width/2, height/2, width, height, 0xFFD700, 0);
        flash.setDepth(400);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: { from: 0, to: 0.8 },
            duration: 300,
            yoyo: true,
            onComplete: () => flash.destroy()
        });
        
        // 境界文字
        const realmText = this.scene.add.text(width/2, height/2, newRealm, {
            fontSize: '96px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(401);
        
        realmText.setScale(0);
        
        this.scene.tweens.add({
            targets: realmText,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // 提示文字
        const hintText = this.scene.add.text(width/2, height/2 + 80, '境界突破！', {
            fontSize: '36px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5).setDepth(401);
        
        hintText.setAlpha(0);
        
        this.scene.tweens.add({
            targets: hintText,
            alpha: 1,
            duration: 300,
            delay: 300
        });
        
        // 消失
        this.scene.tweens.add({
            targets: [realmText, hintText],
            alpha: 0,
            scale: 1.5,
            duration: 500,
            delay: 2500,
            onComplete: () => {
                realmText.destroy();
                hintText.destroy();
            }
        });
        
        // 屏幕震动
        this.scene.cameras.main.shake(500, 0.02);
    }
    
    /**
     * 获取稀有度颜色（十六进制）
     */
    getRarityColorHex(rarity) {
        const colors = {
            common: '#FFFFFF',
            uncommon: '#50E3C2',
            rare: '#667EEA',
            epic: '#9013FE',
            legendary: '#FFD700'
        };
        return colors[rarity] || '#FFFFFF';
    }
}

export default RewardSystem;
