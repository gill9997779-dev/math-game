/**
 * 战斗力系统
 * 整合修为、准确率等属性计算战斗力
 */
export class CombatPowerSystem {
    constructor() {
        this.basePower = 100; // 基础战斗力
    }
    
    /**
     * 计算玩家战斗力
     * @param {Player} player - 玩家对象
     * @returns {number} 战斗力值
     */
    calculateCombatPower(player) {
        if (!player) return 0;
        
        let power = this.basePower;
        
        // 1. 境界加成（每个境界提供基础战斗力）
        const realmData = player.getCurrentRealmData();
        if (realmData) {
            power += realmData.level * 50; // 每个境界等级 +50
        }
        
        // 2. 修为加成（修为越高，战斗力越高）
        power += Math.floor(player.exp / 10); // 每10点修为 +1战斗力
        
        // 3. 准确率加成（准确率越高，战斗力越高）
        const accuracy = player.getAccuracy();
        power += Math.floor(accuracy / 2); // 每2%准确率 +1战斗力
        
        // 4. 连击加成（最高连击数提供额外战斗力）
        power += Math.floor(player.maxCombo / 5); // 每5连击 +1战斗力
        
        // 5. 词条加成
        if (player.hasPerk('BODY_REFINEMENT')) {
            power += 30; // 体魄强化
        }
        if (player.hasPerk('SPIRIT_BOOST')) {
            power += 25; // 灵力增强
        }
        if (player.hasPerk('EXP_BOOST')) {
            power += 20; // 修为增益
        }
        
        // 6. 装备加成（如果有装备系统）
        if (player.equippedItems) {
            if (player.equippedItems.weapon) {
                power += player.equippedItems.weapon.power || 0;
            }
            if (player.equippedItems.armor) {
                power += player.equippedItems.armor.defense || 0;
            }
        }
        
        return Math.floor(power);
    }
    
    /**
     * 计算数学之灵的战斗力
     * @param {Object} spirit - 数学之灵对象
     * @returns {number} 战斗力值
     */
    calculateSpiritPower(spirit) {
        if (!spirit) return 0;
        
        let power = 50; // 基础战斗力
        
        // 难度加成
        const difficulty = spirit.difficulty || 1;
        power += difficulty * 30;
        
        // 根据数学之灵类型调整
        if (spirit.name.includes('加法') || spirit.name.includes('减法')) {
            power += 20;
        } else if (spirit.name.includes('乘法') || spirit.name.includes('除法')) {
            power += 40;
        } else if (spirit.name.includes('方程') || spirit.name.includes('不等式')) {
            power += 60;
        } else if (spirit.name.includes('几何')) {
            power += 80;
        } else if (spirit.name.includes('函数')) {
            power += 100;
        }
        
        return Math.floor(power);
    }
    
    /**
     * 获取战斗力等级
     * @param {number} power - 战斗力值
     * @returns {Object} 等级信息
     */
    getPowerLevel(power) {
        if (power < 200) {
            return { name: '初出茅庐', color: '#8B7355', tier: 1 };
        } else if (power < 500) {
            return { name: '小有所成', color: '#4A90E2', tier: 2 };
        } else if (power < 1000) {
            return { name: '登堂入室', color: '#F5A623', tier: 3 };
        } else if (power < 2000) {
            return { name: '炉火纯青', color: '#BD10E0', tier: 4 };
        } else if (power < 5000) {
            return { name: '出类拔萃', color: '#50E3C2', tier: 5 };
        } else if (power < 10000) {
            return { name: '登峰造极', color: '#B8E986', tier: 6 };
        } else if (power < 20000) {
            return { name: '超凡入圣', color: '#9013FE', tier: 7 };
        } else {
            return { name: '天下无敌', color: '#FFD93D', tier: 8 };
        }
    }
    
    /**
     * 格式化战斗力显示
     * @param {number} power - 战斗力值
     * @returns {string} 格式化后的字符串
     */
    formatPower(power) {
        if (power >= 10000) {
            return `${(power / 10000).toFixed(1)}万`;
        } else if (power >= 1000) {
            return `${(power / 1000).toFixed(1)}千`;
        }
        return power.toString();
    }
}

