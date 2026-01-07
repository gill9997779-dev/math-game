// Phaser 从全局对象获取
import { Player } from '../core/Player.js';
import { DynamicBackground } from '../core/DynamicBackground.js';
import { MenuSystem } from '../core/MenuSystem.js';

const Scene = Phaser.Scene;

export class MainMenuScene extends Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    create() {
        console.log('MainMenuScene 创建中...');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 創建動態背景系統（包含流動雲霧、閃爍公式、夕陽光影）
        this.dynamicBg = new DynamicBackground(this);
        this.dynamicBg.create();
        console.log('✓ 動態背景系統已創建');
        
        // 創建UI元素（深度100，確保在最上層）
        // 標題 - 金色發光效果，位置在中央上方
        const title = this.add.text(width / 2, height * 0.15, '數道仙途', {
            fontSize: '80px',
            fill: '#FFD700',  // 金色
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#FFA500',  // 橙色描邊
            strokeThickness: 8,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#FFD700',
                blur: 25,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        title.setDepth(100);
        
        // 添加發光動畫效果
        this.tweens.add({
            targets: title,
            alpha: { from: 0.8, to: 1 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // 副標題 - 金色，位置在標題下方
        const subtitle = this.add.text(width / 2, height * 0.15 + 100, '在數學的世界中修仙問道', {
            fontSize: '28px',
            fill: '#FFD700',  // 金色
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#FFD700',
                blur: 15,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        subtitle.setDepth(100);
        
        // 創建古風菜單系統（玉簡樣式的菜單按鈕）
        this.menuSystem = new MenuSystem(this);
        this.menuSystem.createMenu();
        console.log('✓ 古風菜單系統已創建');
        
        // 說明文字 - 底部中央，白色文字
        const description = this.add.text(width / 2, height - 60, '探索世界，發現數學之靈，通過解答數學題目提升修為境界', {
            fontSize: '18px',
            fill: '#E8D5B7',  // 古風米色
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            align: 'center',
            wordWrap: { width: 900 },
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 6
            }
        }).setOrigin(0.5);
        description.setDepth(100);
        
        console.log('✓ MainMenuScene 所有UI元素已創建，深度層級已設置');
    }
    
    /**
     * 場景關閉時清理資源
     */
    shutdown() {
        if (this.dynamicBg) {
            this.dynamicBg.destroy();
        }
        if (this.menuSystem) {
            this.menuSystem.destroy();
        }
    }
}

