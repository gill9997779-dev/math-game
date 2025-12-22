// Phaser 从全局对象获取
import { DynamicBackground } from '../core/DynamicBackground.js';

const { Scene } = Phaser;

/**
 * 加載動畫場景
 * 從主菜單背景逐步過渡到魔法陣和數字路徑，然後進入遊戲
 */
export class LoadingScene extends Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        console.log('LoadingScene 創建中...');
        
        // 階段1：顯示當前背景（與主菜單相同）
        this.createInitialBackground();
        
        // 階段2：逐步過渡到目標圖片背景
        this.createTransitionAnimation();
    }
    
    /**
     * 創建初始背景（與主菜單相同）
     */
    createInitialBackground() {
        const { width, height } = this.cameras.main;
        
        // 使用與主菜單相同的動態背景系統
        this.dynamicBg = new DynamicBackground(this);
        this.dynamicBg.create();
    }
    
    /**
     * 創建過渡動畫：從主菜單背景逐步演變成目標圖片
     */
    createTransitionAnimation() {
        const { width, height } = this.cameras.main;
        
        // 檢查目標圖片是否存在
        if (!this.textures.exists('loading_background')) {
            console.warn('loading_background 圖片不存在，直接進入遊戲場景');
            // 如果圖片不存在，直接進入遊戲場景
            this.time.delayedCall(1000, () => {
                this.scene.start('GameScene');
            });
            return;
        }
        
        // 創建目標背景圖片（初始透明）
        this.targetBg = this.add.image(width / 2, height / 2, 'loading_background');
        const scaleX = width / this.targetBg.width;
        const scaleY = height / this.targetBg.height;
        this.targetBg.setScale(Math.max(scaleX, scaleY));
        this.targetBg.setDepth(-5);  // 在動態背景之上
        this.targetBg.setAlpha(0);  // 初始完全透明
        
        // 逐步淡入目標圖片（從主菜單背景演變成目標圖片）
        this.tweens.add({
            targets: this.targetBg,
            alpha: { from: 0, to: 1 },
            duration: 3000,  // 3秒過渡
            ease: 'Power2',
            onUpdate: () => {
                // 在過渡過程中，可以逐漸降低動態背景的亮度
                if (this.dynamicBg && this.dynamicBg.baseBg) {
                    const currentAlpha = this.targetBg.alpha;
                    // 動態背景逐漸變暗
                    if (this.dynamicBg.baseBg.setAlpha) {
                        this.dynamicBg.baseBg.setAlpha(1 - currentAlpha * 0.5);
                    }
                }
            },
            onComplete: () => {
                console.log('背景過渡完成，準備進入遊戲場景');
                // 過渡完成後，等待一段時間再進入遊戲
                this.fadeToGame();
            }
        });
    }
    
    /**
     * 淡出並進入遊戲場景
     */
    fadeToGame() {
        const { width, height } = this.cameras.main;
        
        // 等待2秒讓用戶欣賞完整的過渡效果，然後開始淡出
        this.time.delayedCall(2000, () => {
            // 創建白色閃光
            const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xFFFFFF);
            flash.setDepth(200);
            flash.setAlpha(0);
            
            // 淡入
            this.tweens.add({
                targets: flash,
                alpha: 1,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    // 清理資源
                    if (this.dynamicBg) {
                        this.dynamicBg.destroy();
                    }
                    // 進入遊戲場景
                    console.log('加載動畫完成，進入遊戲場景');
                    this.scene.start('GameScene');
                }
            });
        });
    }
    
    /**
     * 場景關閉時清理資源
     */
    shutdown() {
        if (this.dynamicBg) {
            this.dynamicBg.destroy();
        }
    }
}

