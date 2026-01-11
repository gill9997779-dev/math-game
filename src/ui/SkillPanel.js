/**
 * 技能面板 - 使用HTML/CSS实现
 */
import { uiManager } from '../core/UIManager.js';

export class SkillPanel {
    constructor() {
        this.modalId = 'skill-panel';
    }
    
    /**
     * 打开技能面板
     */
    open() {
        const skillSystem = window.gameData?.skillSystem;
        if (!skillSystem) {
            uiManager.showToast('技能系统未初始化', 'error');
            return;
        }
        
        uiManager.openModal(this.modalId, {
            title: '⚔ 技能系统',
            content: this.renderContent(skillSystem),
            width: '900px',
            buttons: [
                {
                    text: '返回',
                    type: 'secondary',
                    onClick: (ui, id) => ui.closeModal(id)
                }
            ],
            onClose: () => {
                // 恢复游戏场景
                const gameScene = window.game?.scene?.getScene('GameScene');
                if (gameScene) gameScene.scene.resume();
            }
        });
        
        // 绑定技能按钮事件
        this.bindEvents(skillSystem);
    }
    
    /**
     * 渲染内容
     */
    renderContent(skillSystem) {
        const skills = skillSystem.getAvailableSkills();
        const player = window.gameData.player;
        
        return `
            <style>
                .skill-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .skill-points {
                    font-size: 20px;
                    color: #50e3c2;
                }
                
                .skill-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .skill-card {
                    display: flex;
                    align-items: center;
                    background: rgba(30, 30, 60, 0.8);
                    border: 2px solid #444;
                    border-radius: 10px;
                    padding: 15px;
                    transition: all 0.2s;
                }
                
                .skill-card:hover {
                    border-color: #667eea;
                    background: rgba(40, 40, 80, 0.9);
                }
                
                .skill-card.unlocked {
                    border-color: #FFD700;
                }
                
                .skill-card.maxed {
                    border-color: #50e3c2;
                    background: rgba(45, 74, 62, 0.8);
                }
                
                .skill-icon {
                    width: 60px;
                    height: 60px;
                    background: #333;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #888;
                    margin-right: 15px;
                    flex-shrink: 0;
                }
                
                .skill-card.unlocked .skill-icon {
                    color: #FFD700;
                }
                
                .skill-card.maxed .skill-icon {
                    color: #50e3c2;
                }
                
                .skill-info {
                    flex: 1;
                }
                
                .skill-name {
                    font-size: 18px;
                    color: #fff;
                    margin-bottom: 5px;
                }
                
                .skill-card.unlocked .skill-name {
                    color: #FFD700;
                }
                
                .skill-card.maxed .skill-name {
                    color: #50e3c2;
                }
                
                .skill-tag {
                    font-size: 12px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    margin-left: 10px;
                }
                
                .skill-tag.passive {
                    background: #2d4a3e;
                    color: #50e3c2;
                }
                
                .skill-tag.active {
                    background: #4a3d2d;
                    color: #f5a623;
                }
                
                .skill-desc {
                    font-size: 14px;
                    color: #aaa;
                }
                
                .skill-action {
                    margin-left: 15px;
                    flex-shrink: 0;
                }
                
                .skill-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 100px;
                }
                
                .skill-btn.can-unlock {
                    background: linear-gradient(135deg, #9013FE 0%, #764ba2 100%);
                    color: white;
                }
                
                .skill-btn.can-unlock:hover {
                    transform: scale(1.05);
                }
                
                .skill-btn.locked {
                    background: #333;
                    color: #666;
                    cursor: not-allowed;
                }
                
                .skill-btn.maxed {
                    background: #2d4a3e;
                    color: #50e3c2;
                    cursor: default;
                }
            </style>
            
            <div class="skill-header">
                <span class="skill-points">可用技能点: <strong>${skillSystem.skillPoints}</strong></span>
            </div>
            
            <div class="skill-list">
                ${skills.map(skill => this.renderSkillCard(skill)).join('')}
            </div>
        `;
    }
    
    /**
     * 渲染单个技能卡片
     */
    renderSkillCard(skill) {
        const isUnlocked = skill.level > 0;
        const isMaxed = skill.level >= skill.maxLevel;
        const cardClass = isMaxed ? 'maxed' : (isUnlocked ? 'unlocked' : '');
        
        let btnText, btnClass;
        if (isMaxed) {
            btnText = '已满级';
            btnClass = 'maxed';
        } else if (skill.canUnlock) {
            btnText = isUnlocked ? `升级(${skill.cost})` : `解锁(${skill.cost})`;
            btnClass = 'can-unlock';
        } else {
            btnText = `需${skill.cost}点`;
            btnClass = 'locked';
        }
        
        return `
            <div class="skill-card ${cardClass}" data-skill-id="${skill.id}">
                <div class="skill-icon">${skill.level}/${skill.maxLevel}</div>
                <div class="skill-info">
                    <div class="skill-name">
                        ${skill.name}
                        <span class="skill-tag ${skill.category}">${skill.category === 'passive' ? '被动' : '主动'}</span>
                    </div>
                    <div class="skill-desc">${skill.description}</div>
                </div>
                <div class="skill-action">
                    <button class="skill-btn ${btnClass}" data-skill-id="${skill.id}" ${!skill.canUnlock && !isMaxed ? 'disabled' : ''}>
                        ${btnText}
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 绑定事件
     */
    bindEvents(skillSystem) {
        const modal = uiManager.getModalElement(this.modalId);
        if (!modal) return;
        
        const player = window.gameData.player;
        
        modal.querySelectorAll('.skill-btn.can-unlock').forEach(btn => {
            btn.addEventListener('click', () => {
                const skillId = btn.dataset.skillId;
                const result = skillSystem.unlockSkill(skillId, player);
                
                if (result.success) {
                    uiManager.showToast(result.message, 'success');
                    // 刷新内容
                    uiManager.updateModalContent(this.modalId, this.renderContent(skillSystem));
                    this.bindEvents(skillSystem);
                } else {
                    uiManager.showToast(result.message, 'error');
                }
            });
        });
    }
    
    /**
     * 关闭面板
     */
    close() {
        uiManager.closeModal(this.modalId);
    }
}

// 导出单例
export const skillPanel = new SkillPanel();
