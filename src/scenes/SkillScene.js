// Phaser 从全局对象获取
import { SkillSystem } from '../core/SkillSystem.js';

const Scene = Phaser.Scene;

export class SkillScene extends Scene {
    constructor() {
        super({ key: 'SkillScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const skillSystem = window.gameData.skillSystem;
        const player = window.gameData.player;
        
        if (!skillSystem) {
            console.error('技能系统未初始化');
            this.scene.stop();
            return;
        }
        
        // 半透明背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        
        // 标题
        const titleText = this.add.text(width / 2, 50, '技能系统', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            stroke: '#9013FE',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // 技能点显示
        const skillPointsText = this.add.text(width / 2, 100, `当前技能点: ${skillSystem.skillPoints}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        // 技能列表
        const skills = skillSystem.getAvailableSkills();
        const startY = 160;
        const skillHeight = 120;
        const maxVisible = 5;
        let scrollOffset = 0;
        
        // 存储当前显示的技能元素
        let skillElements = [];
        let scrollButtons = [];
        
        const updateSkillList = () => {
            // 清除旧元素
            skillElements.forEach(elem => elem.destroy());
            scrollButtons.forEach(btn => btn.destroy());
            skillElements = [];
            scrollButtons = [];
            
            const visibleSkills = skills.slice(scrollOffset, scrollOffset + maxVisible);
            
            visibleSkills.forEach((skill, index) => {
                const y = startY + index * skillHeight;
                
                // 技能背景框
                const skillBg = this.add.rectangle(width / 2, y, width - 200, skillHeight - 10, 0x1a1a2e, 0.8);
                skillBg.setStrokeStyle(2, skill.level > 0 ? 0xFFD700 : 0x667eea);
                
                // 技能名称和等级
                const skillNameText = this.add.text(200, y - 30, skill.name, {
                    fontSize: '24px',
                    fill: skill.level > 0 ? '#FFD700' : '#fff',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold'
                });
                
                const levelText = this.add.text(200, y + 5, `等级: ${skill.level}/${skill.maxLevel}`, {
                    fontSize: '18px',
                    fill: skill.level > 0 ? '#50e3c2' : '#aaa',
                    fontFamily: 'Microsoft YaHei'
                });
                
                // 技能描述
                const descText = this.add.text(200, y + 30, skill.description, {
                    fontSize: '16px',
                    fill: '#ccc',
                    fontFamily: 'Microsoft YaHei',
                    wordWrap: { width: 500 }
                });
                
                // 技能类型标签
                const categoryText = this.add.text(200, y - 30, `[${skill.category === 'passive' ? '被动' : '主动'}]`, {
                    fontSize: '14px',
                    fill: skill.category === 'passive' ? '#50e3c2' : '#f5a623',
                    fontFamily: 'Microsoft YaHei'
                });
                categoryText.setX(200 + skillNameText.width + 20);
                
                // 解锁/升级按钮
                let buttonText = '';
                let buttonColor = 0x666;
                let canClick = false;
                
                if (skill.level >= skill.maxLevel) {
                    buttonText = '已满级';
                    buttonColor = 0x50e3c2;
                } else if (skill.canUnlock) {
                    buttonText = skill.level > 0 ? `升级 (${skill.cost}点)` : `解锁 (${skill.cost}点)`;
                    buttonColor = 0x9013FE;
                    canClick = true;
                } else {
                    buttonText = '无法解锁';
                    buttonColor = 0x666;
                }
                
                const unlockBtn = this.add.text(width - 250, y, buttonText, {
                    fontSize: '18px',
                    fill: '#fff',
                    fontFamily: 'Microsoft YaHei',
                    backgroundColor: `#${buttonColor.toString(16).padStart(6, '0')}`,
                    padding: { x: 20, y: 10 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: canClick });
                
                if (canClick) {
                    unlockBtn.on('pointerdown', () => {
                        const result = skillSystem.unlockSkill(skill.id, player);
                        if (result.success) {
                            // 更新技能点显示
                            skillPointsText.setText(`当前技能点: ${skillSystem.skillPoints}`);
                            // 刷新技能列表
                            updateSkillList();
                        } else {
                            // 显示错误消息（可选）
                            console.log(result.message);
                        }
                    });
                    
                    unlockBtn.on('pointerover', () => {
                        unlockBtn.setTint(0x764ba2);
                    });
                    
                    unlockBtn.on('pointerout', () => {
                        unlockBtn.clearTint();
                    });
                }
                
                // 前置要求显示
                if (skill.requirements && skill.requirements.length > 0) {
                    const reqText = this.add.text(200, y + 55, `前置要求: ${skill.requirements.map(req => {
                        const reqSkill = skills.find(s => s.id === req);
                        return reqSkill ? reqSkill.name : req;
                    }).join(', ')}`, {
                        fontSize: '14px',
                        fill: '#888',
                        fontFamily: 'Microsoft YaHei'
                    });
                    skillElements.push(reqText);
                }
                
                skillElements.push(skillBg, skillNameText, levelText, descText, categoryText, unlockBtn);
            });
            
            // 滚动按钮
            if (scrollOffset > 0) {
                const upBtn = this.add.text(width / 2, 120, '↑', {
                    fontSize: '32px',
                    fill: '#fff',
                    fontFamily: 'Arial',
                    backgroundColor: '#667eea',
                    padding: { x: 15, y: 10 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    scrollOffset = Math.max(0, scrollOffset - 1);
                    updateSkillList();
                });
                scrollButtons.push(upBtn);
            }
            
            if (scrollOffset + maxVisible < skills.length) {
                const downBtn = this.add.text(width / 2, height - 100, '↓', {
                    fontSize: '32px',
                    fill: '#fff',
                    fontFamily: 'Arial',
                    backgroundColor: '#667eea',
                    padding: { x: 15, y: 10 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    scrollOffset = Math.min(skills.length - maxVisible, scrollOffset + 1);
                    updateSkillList();
                });
                scrollButtons.push(downBtn);
            }
        };
        
        // 初始显示
        updateSkillList();
        
        // 关闭按钮
        const closeButton = this.add.text(width / 2, height - 50, '返回 (ESC)', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 30, y: 15 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.stop())
        .on('pointerover', () => closeButton.setTint(0x764ba2))
        .on('pointerout', () => closeButton.clearTint());
        
        // ESC 键关闭
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();
        });
    }
}


