// Phaser 从全局对象获取
const { Scene } = Phaser;

/**
 * 词条选择场景 - 境界突破时选择肉鸽词条
 */
export class PerkSelectionScene extends Scene {
    constructor() {
        super({ key: 'PerkSelectionScene' });
    }
    
    create(data) {
        const { width, height } = this.cameras.main;
        this.width = width;
        this.height = height;
        
        // 获取玩家数据
        this.player = data.player || window.gameData.player;
        
        // 半透明背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        
        // 标题
        const titleText = this.add.text(width / 2, 80, '境界突破！', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const subtitleText = this.add.text(width / 2, 140, '请以此感悟天道，选择你的道...', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        // 词条列表
        const perks = [
            {
                id: 'MANG_FU',
                name: '【莽夫道】',
                desc: '题目变为极简（难度固定为1），但修为获取减少20%。\n适合：想快速刷怪不想动脑的道友。',
                color: 0xff4444,
                icon: '⚔️'
            },
            {
                id: 'TIAN_JI',
                name: '【天机道】',
                desc: '若答案为质数，获得双倍灵气（暴击）。\n适合：对数字敏感的数学天才。',
                color: 0x4444ff,
                icon: '🔮'
            },
            {
                id: 'CAN_JUAN',
                name: '【残卷道】',
                desc: '题目变为填空题（如：3+?=8），且答对回血5点。\n适合：稳扎稳打的续航流。',
                color: 0x44ff44,
                icon: '📜'
            },
            {
                id: 'BODY_REFINEMENT',
                name: '【体魄强化】',
                desc: '最大生命值+50，当前生命值+50。\n适合：提升生存能力的稳健流。',
                color: 0xff8844,
                icon: '💪'
            },
            {
                id: 'SPIRIT_BOOST',
                name: '【灵力增强】',
                desc: '最大灵力+30，当前灵力+30。\n适合：需要更多灵力的技能流。',
                color: 0x8844ff,
                icon: '✨'
            },
            {
                id: 'EXP_BOOST',
                name: '【修为增益】',
                desc: '答题获得的修为增加15%。\n适合：追求快速提升境界的修炼流。',
                color: 0xffdd44,
                icon: '🌟'
            }
        ];
        
        // 随机选择3个词条供玩家选择
        const selectedPerks = this.shuffleArray([...perks]).slice(0, 3);
        
        // 创建词条卡片
        const cardSpacing = 180;
        const startY = height / 2 - 50;
        
        selectedPerks.forEach((perk, index) => {
            this.createPerkCard(width / 2, startY + (index * cardSpacing), perk);
        });
        
        // 提示文本
        const hintText = this.add.text(width / 2, height - 60, '点击选择你的道（ESC跳过）', {
            fontSize: '20px',
            fill: '#aaaaaa',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        // ESC键跳过
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToGame();
        });
    }
    
    createPerkCard(x, y, perk) {
        // 卡片背景
        const cardBg = this.add.rectangle(x, y, 700, 150, 0x333333, 0.9);
        cardBg.setStrokeStyle(3, perk.color);
        cardBg.setInteractive({ useHandCursor: true });
        
        // 图标
        const iconText = this.add.text(x - 320, y - 50, perk.icon, {
            fontSize: '48px'
        }).setOrigin(0.5);
        
        // 词条名称
        const nameText = this.add.text(x - 250, y - 50, perk.name, {
            fontSize: '28px',
            fill: '#ffcc00',
            fontFamily: 'Microsoft YaHei',
            fontWeight: 'bold'
        });
        
        // 词条描述
        const descText = this.add.text(x - 320, y + 10, perk.desc, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 600 }
        });
        
        // 检查是否已拥有
        if (this.player.hasPerk(perk.id)) {
            const ownedText = this.add.text(x + 300, y, '已拥有', {
                fontSize: '20px',
                fill: '#50e3c2',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
            cardBg.setFillStyle(0x555555, 0.9);
        }
        
        // 点击选择
        cardBg.on('pointerdown', () => {
            if (!this.player.hasPerk(perk.id)) {
                this.selectPerk(perk);
            }
        });
        
        // 悬停效果
        cardBg.on('pointerover', () => {
            if (!this.player.hasPerk(perk.id)) {
                cardBg.setFillStyle(0x555555, 0.9);
                cardBg.setScale(1.05);
            }
        });
        
        cardBg.on('pointerout', () => {
            if (!this.player.hasPerk(perk.id)) {
                cardBg.setFillStyle(0x333333, 0.9);
                cardBg.setScale(1.0);
            }
        });
    }
    
    selectPerk(perk) {
        // 添加词条
        const success = this.player.addPerk(perk.id);
        
        if (success) {
            // 播放选择特效
            this.cameras.main.flash(500, 255, 255, 255);
            
            // 显示选择提示
            const selectText = this.add.text(this.width / 2, this.height / 2, `选择了 ${perk.name}`, {
                fontSize: '36px',
                fill: perk.color,
                fontFamily: 'Microsoft YaHei',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(20);
            
            // 延迟返回游戏
            this.time.delayedCall(1500, () => {
                selectText.destroy();
                this.returnToGame();
            });
        }
    }
    
    returnToGame() {
        // 更新玩家数据
        this.player.currentHealth = Math.min(this.player.currentHealth, this.player.maxHealth);
        this.player.mana = Math.min(this.player.mana, this.player.maxMana);
        
        // 返回游戏场景
        this.scene.stop();
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.scene.resume();
        }
    }
    
    /**
     * 随机打乱数组
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

