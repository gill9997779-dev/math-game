/**
 * 背景管理器
 * 统一管理游戏背景的显示
 */
export class BackgroundManager {
    /**
     * 创建背景图片
     * @param {Phaser.Scene} scene - 场景对象
     * @param {string} textureKey - 图片资源键名，默认为 'game_background'
     * @param {Object} options - 选项
     * @returns {Phaser.GameObjects.Image} 背景图片对象
     */
    static createBackground(scene, textureKey = 'game_background', options = {}) {
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        const {
            fitMode = 'cover',  // 'cover', 'contain', 'stretch'
            depth = 0,
            alpha = 1,
            tint = null
        } = options;

        // 检查图片是否存在
        if (!scene.textures.exists(textureKey)) {
            console.warn(`背景图片 "${textureKey}" 不存在，使用默认背景色`);
            // 使用默认背景色
            const bg = scene.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
            bg.setDepth(depth);
            bg.setAlpha(alpha);
            return bg;
        }

        // 创建背景图片
        const bg = scene.add.image(width / 2, height / 2, textureKey);
        bg.setDepth(depth);
        bg.setAlpha(alpha);
        
        if (tint) {
            bg.setTint(tint);
        }

        // 根据模式调整图片大小
        const imgWidth = bg.width;
        const imgHeight = bg.height;
        const scaleX = width / imgWidth;
        const scaleY = height / imgHeight;

        switch (fitMode) {
            case 'cover':
                // 覆盖整个屏幕，可能会裁剪
                const scale = Math.max(scaleX, scaleY);
                bg.setScale(scale);
                break;
            case 'contain':
                // 完整显示，可能会有黑边
                const minScale = Math.min(scaleX, scaleY);
                bg.setScale(minScale);
                break;
            case 'stretch':
                // 拉伸填满屏幕
                bg.setScale(scaleX, scaleY);
                break;
            default:
                bg.setScale(scaleX, scaleY);
        }

        return bg;
    }

    /**
     * 创建带遮罩的背景（用于弹窗场景）
     * @param {Phaser.Scene} scene - 场景对象
     * @param {string} textureKey - 背景图片键名
     * @param {number} overlayAlpha - 遮罩透明度（0-1）
     * @param {Object} options - 选项
     * @returns {Object} 包含背景和遮罩的对象
     */
    static createBackgroundWithOverlay(scene, textureKey = 'game_background', overlayAlpha = 0.7, options = {}) {
        const { width, height } = scene.cameras.main;
        
        // 创建背景
        const backgroundOptions = Object.assign({}, options, { depth: 0 });
        const background = this.createBackground(scene, textureKey, backgroundOptions);

        // 创建半透明遮罩
        const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, overlayAlpha);
        overlay.setDepth(1);

        return {
            background,
            overlay
        };
    }
}

