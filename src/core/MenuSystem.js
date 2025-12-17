/**
 * 古風菜單系統
 * 實現玉簡/石碑樣式的菜單按鈕，帶有懸停和點擊動畫
 */
export class MenuSystem {
    constructor(scene) {
        this.scene = scene;
        this.menuItems = [];
        this.selectedIndex = -1;
    }

    /**
     * 創建古風菜單
     * @param {Object} options - 菜單選項配置
     */
    createMenu(options = {}) {
        const { width, height } = this.scene.cameras.main;
        
        // 菜單配置
        const menuConfig = {
            x: width * 0.7,  // 右側，與左側山峰形成視覺平衡
            y: height * 0.45,  // 中央偏上
            spacing: 85,  // 菜單項間距
            ...options
        };

        // 古風菜單選項
        const menuItems = [
            {
                text: '初踏仙途',
                action: () => this.onStartNewGame(),
                description: '開始新遊戲'
            },
            {
                text: '再續前緣',
                action: () => this.onContinueGame(),
                description: '繼續遊戲'
            }
        ];

        // 創建每個菜單項
        menuItems.forEach((item, index) => {
            const y = menuConfig.y + (index - (menuItems.length - 1) / 2) * menuConfig.spacing;
            const menuItem = this.createJadeTablet(menuConfig.x, y, item, index);
            this.menuItems.push(menuItem);
        });

        return this.menuItems;
    }

    /**
     * 創建玉簡/石碑樣式的菜單項
     */
    createJadeTablet(x, y, item, index) {
        // 創建玉簡背景（半透明，帶有古風邊框）
        const tablet = this.scene.add.container(x, y);
        tablet.setDepth(100);

        // 玉簡主體（矩形，帶圓角效果）
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.7);  // 深色半透明
        bg.fillRoundedRect(-140, -35, 280, 70, 10);
        
        // 金色邊框
        bg.lineStyle(3, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-140, -35, 280, 70, 10);
        
        // 內部裝飾線
        bg.lineStyle(1, 0xFFD700, 0.3);
        bg.strokeRoundedRect(-135, -30, 270, 60, 8);
        
        tablet.add(bg);

        // 書法風格文字
        const text = this.scene.add.text(0, 0, item.text, {
            fontSize: '36px',
            fill: '#E8D5B7',  // 古風米色
            fontFamily: 'Microsoft YaHei, SimSun, serif',
            stroke: '#8B6914',  // 深棕色描邊
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true,
                fill: true
            }
        });
        text.setOrigin(0.5);
        tablet.add(text);

        // 存儲引用
        tablet.bg = bg;
        tablet.text = text;
        tablet.item = item;
        tablet.index = index;
        tablet.originalY = y;
        tablet.originalScale = 1;

        // 設置交互
        tablet.setSize(280, 70);
        tablet.setInteractive({ useHandCursor: true });

        // 懸停效果
        tablet.on('pointerover', () => {
            this.onHover(tablet);
        });

        tablet.on('pointerout', () => {
            this.onHoverOut(tablet);
        });

        // 點擊效果
        tablet.on('pointerdown', () => {
            this.onClick(tablet);
        });

        return tablet;
    }

    /**
     * 懸停動畫：玉簡發光，文字清晰，流光效果
     */
    onHover(tablet) {
        // 停止之前的動畫
        this.scene.tweens.killTweensOf(tablet);
        this.scene.tweens.killTweensOf(tablet.text);
        this.scene.tweens.killTweensOf(tablet.bg);

        // 放大效果
        this.scene.tweens.add({
            targets: tablet,
            scale: 1.1,
            y: tablet.originalY - 5,
            duration: 300,
            ease: 'Power2'
        });

        // 背景發光效果
        tablet.bg.clear();
        tablet.bg.fillStyle(0x2a2a1a, 0.85);
        tablet.bg.fillRoundedRect(-140, -35, 280, 70, 10);
        
        // 更亮的金色邊框
        tablet.bg.lineStyle(4, 0xFFD700, 1);
        tablet.bg.strokeRoundedRect(-140, -35, 280, 70, 10);
        
        // 內部裝飾線
        tablet.bg.lineStyle(2, 0xFFD700, 0.6);
        tablet.bg.strokeRoundedRect(-135, -30, 270, 60, 8);

        // 文字變亮
        tablet.text.setFill('#FFE5B4');
        tablet.text.setStroke('#FFD700', 3);

        // 流光效果（創建一個移動的光點）
        const glow = this.scene.add.graphics();
        glow.lineStyle(20, 0xFFD700, 0.6);
        glow.lineGradientStyle(20, 0xFFD700, 0xFFD700, 0xFFFFFF, 0xFFFFFF, 0.3);
        glow.beginPath();
        glow.moveTo(-140, 0);
        glow.lineTo(140, 0);
        glow.strokePath();
        glow.setDepth(101);
        tablet.add(glow);
        tablet.glow = glow;

        // 流光動畫
        this.scene.tweens.add({
            targets: glow,
            alpha: { from: 0, to: 0.8, back: 0 },
            duration: 1000,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 音效（如果有的話）
        // this.scene.sound.play('jade_chime', { volume: 0.3 });
    }

    /**
     * 取消懸停
     */
    onHoverOut(tablet) {
        // 停止動畫
        this.scene.tweens.killTweensOf(tablet);
        this.scene.tweens.killTweensOf(tablet.text);
        this.scene.tweens.killTweensOf(tablet.bg);
        if (tablet.glow) {
            this.scene.tweens.killTweensOf(tablet.glow);
            tablet.glow.destroy();
            tablet.glow = null;
        }

        // 恢復原始狀態
        this.scene.tweens.add({
            targets: tablet,
            scale: 1,
            y: tablet.originalY,
            duration: 300,
            ease: 'Power2'
        });

        // 恢復背景
        tablet.bg.clear();
        tablet.bg.fillStyle(0x1a1a1a, 0.7);
        tablet.bg.fillRoundedRect(-140, -35, 280, 70, 10);
        tablet.bg.lineStyle(3, 0xFFD700, 0.8);
        tablet.bg.strokeRoundedRect(-140, -35, 280, 70, 10);
        tablet.bg.lineStyle(1, 0xFFD700, 0.3);
        tablet.bg.strokeRoundedRect(-135, -30, 270, 60, 8);

        // 恢復文字
        tablet.text.setFill('#E8D5B7');
        tablet.text.setStroke('#8B6914', 2);
    }

    /**
     * 點擊動畫：觸發鏡頭推進動畫
     */
    onClick(tablet) {
        // 點擊反饋
        this.scene.tweens.add({
            targets: tablet,
            scale: 0.95,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });

        // 執行對應的動作
        if (tablet.item && tablet.item.action) {
            // 直接執行動作，不再觸發鏡頭推進動畫
            tablet.item.action();
        } else {
            console.warn('tablet.item 或 action 不存在');
        }
    }

    /**
     * 觸發鏡頭推進動畫：沿著山間道路推進，穿過雲霧，匯入法陣
     */
    triggerCameraTransition(callback) {
        const { width, height } = this.scene.cameras.main;
        const camera = this.scene.cameras.main;

        // 保存原始相機設置
        const originalScrollX = camera.scrollX;
        const originalScrollY = camera.scrollY;
        const originalZoom = camera.zoom;

        // 創建道路視覺引導（可選，用於視覺效果）
        const pathGuide = this.scene.add.graphics();
        pathGuide.lineStyle(3, 0xFFD700, 0.5);
        pathGuide.setDepth(50);
        
        // 繪製蜿蜒的道路（從左下到右上）
        // 使用多個點來模擬曲線路徑
        const pathPoints = [
            { x: width * 0.1, y: height * 0.9 },
            { x: width * 0.2, y: height * 0.75 },
            { x: width * 0.3, y: height * 0.6 },
            { x: width * 0.45, y: height * 0.5 },
            { x: width * 0.5, y: height * 0.4 },
            { x: width * 0.6, y: height * 0.3 },
            { x: width * 0.7, y: height * 0.2 },
            { x: width * 0.85, y: height * 0.15 },
            { x: width * 0.9, y: height * 0.1 }
        ];
        
        // Phaser 3 Graphics API: moveTo 和 lineTo 會自動開始新路徑
        pathGuide.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
            pathGuide.lineTo(pathPoints[i].x, pathPoints[i].y);
        }
        pathGuide.strokePath();

        // 創建法陣（Pi符號組成的圓形法陣）
        const circle = this.scene.add.circle(width * 0.9, height * 0.1, 100, 0xFFD700, 0.3);
        circle.setDepth(50);
        circle.piSymbols = [];
        
        // 在法陣周圍添加Pi符號
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const piX = width * 0.9 + Math.cos(angle) * 80;
            const piY = height * 0.1 + Math.sin(angle) * 80;
            const piText = this.scene.add.text(piX, piY, 'π', {
                fontSize: '24px',
                fill: '#FFD700',
                fontFamily: 'Arial'
            });
            piText.setOrigin(0.5);
            piText.setDepth(50);
            circle.piSymbols.push(piText);
        }

        // 鏡頭推進動畫序列
        // 使用連續的 tween 來實現（因為 Phaser 3 可能不支持 timeline）
        console.log('開始鏡頭推進動畫...');
        
        // 階段1：緩慢開始，鏡頭開始移動
        this.scene.tweens.add({
            targets: camera,
            scrollX: width * 0.3,
            scrollY: height * 0.6,
            zoom: 1.2,
            duration: 800,
            ease: 'Power1',
            onComplete: () => {
                console.log('階段1完成');
                // 階段2：加速推進，穿過雲霧
                this.scene.tweens.add({
                    targets: camera,
                    scrollX: width * 0.7,
                    scrollY: height * 0.3,
                    zoom: 1.8,
                    duration: 1200,
                    ease: 'Power2',
                    onComplete: () => {
                        console.log('階段2完成');
                        // 階段3：快速推進到法陣
                        this.scene.tweens.add({
                            targets: camera,
                            scrollX: width * 0.9,
                            scrollY: height * 0.1,
                            zoom: 2.5,
                            duration: 1000,
                            ease: 'Power3',
                            onComplete: () => {
                                console.log('階段3完成');
                                // 階段4：法陣發光
                                this.scene.tweens.add({
                                    targets: circle,
                                    scale: 2,
                                    alpha: 1,
                                    duration: 500,
                                    ease: 'Power2',
                                    onComplete: () => {
                                        console.log('階段4完成');
                                        // 所有動畫完成
                                        this.onAnimationComplete(camera, originalScrollX, originalScrollY, originalZoom, pathGuide, circle, callback);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        // 讓Pi符號旋轉
        circle.piSymbols.forEach((pi, i) => {
            this.scene.tweens.add({
                targets: pi,
                angle: 360,
                duration: 2000,
                repeat: -1,
                ease: 'Linear'
            });
        });

        // 白色閃光轉場（在階段4的 onComplete 中處理）
        // 這部分已經移到 onAnimationComplete 之前
    }

    /**
     * 動畫完成回調
     */
    onAnimationComplete(camera, originalScrollX, originalScrollY, originalZoom, pathGuide, circle, callback) {
        console.log('動畫時間線完成');
        const { width, height } = this.scene.cameras.main;
        
        // 白色閃光轉場
        const flash = this.scene.add.rectangle(width / 2, height / 2, width, height, 0xFFFFFF);
        flash.setDepth(200);
        flash.setAlpha(0);
        
        // 閃光出現
        this.scene.tweens.add({
            targets: flash,
            alpha: 1,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // 重置相機
                camera.setScroll(originalScrollX, originalScrollY);
                camera.setZoom(originalZoom);
                console.log('相機已重置');
                
                // 清理視覺元素
                if (pathGuide) pathGuide.destroy();
                if (circle) {
                    circle.destroy();
                    if (circle.piSymbols) {
                        circle.piSymbols.forEach(pi => pi.destroy());
                    }
                }
                console.log('視覺元素已清理');
                
                // 閃光消失
                this.scene.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        flash.destroy();
                        // 執行回調
                        if (callback) {
                            console.log('執行回調函數...');
                            try {
                                callback();
                                console.log('回調執行成功');
                            } catch (error) {
                                console.error('回調執行失敗:', error);
                            }
                        } else {
                            console.warn('沒有回調函數');
                        }
                    }
                });
            }
        });
    }

    /**
     * 菜單項動作處理
     */
    async onStartNewGame() {
        console.log('初踏仙途 - 開始新遊戲');
        
        // 確保 Player 存在
        if (!window.gameData.player) {
            const { Player } = await import('../core/Player.js');
            window.gameData.player = new Player();
            console.log('✓ Player 已創建');
        }
        
        // 切換到加載動畫場景
        try {
            console.log('準備切換到 LoadingScene...');
            this.scene.scene.start('LoadingScene');
            console.log('✓ 已切換到加載動畫場景');
        } catch (error) {
            console.error('場景切換失敗:', error);
            // 如果失敗，直接進入遊戲場景
            try {
                this.scene.scene.start('GameScene');
                console.log('✓ 使用備用方法直接進入遊戲場景');
            } catch (e2) {
                console.error('備用方法也失敗:', e2);
            }
        }
    }

    async onContinueGame() {
        console.log('再續前緣 - 繼續遊戲');
        try {
            const response = await fetch('/api/load');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.playerData) {
                    // 動態導入 Player
                    const { Player } = await import('../core/Player.js');
                    window.gameData.player = Player.fromJSON(data.playerData);
                    this.scene.scene.start('GameScene');
                } else {
                    alert('沒有找到保存的遊戲進度');
                }
            }
        } catch (error) {
            console.error('加載遊戲失敗:', error);
            alert('加載遊戲失敗，請檢查網絡連接');
        }
    }

    onSettings() {
        console.log('玄法設置 - 遊戲設置');
        alert('設置功能開發中...');
    }

    onSaveLoad() {
        console.log('卷藏洞天 - 讀取/存儲進度');
        alert('存檔功能開發中...');
    }

    onExit() {
        console.log('辭歸塵世 - 退出遊戲');
        if (confirm('確定要退出遊戲嗎？')) {
            window.close();
        }
    }

    /**
     * 清理資源
     */
    destroy() {
        this.menuItems.forEach(item => {
            if (item.glow) {
                item.glow.destroy();
            }
            item.destroy();
        });
        this.menuItems = [];
    }
}

