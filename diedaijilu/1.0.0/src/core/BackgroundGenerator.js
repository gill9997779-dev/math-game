/**
 * 背景生成器
 * 当背景图片不存在时，生成临时的渐变背景
 */
export class BackgroundGenerator {
    /**
     * 创建渐变背景（当图片不存在时使用）
     * @param {Phaser.Scene} scene - 场景对象
     * @param {Object} options - 选项
     * @returns {Phaser.GameObjects.Graphics} 背景图形
     */
    static createGradientBackground(scene, options = {}) {
        const { width, height } = scene.cameras.main;
        const {
            color1 = 0x1a1a2e,  // 深蓝色
            color2 = 0x2d1b4e,  // 深紫色
            depth = 0
        } = options;

        // 创建渐变背景
        const graphics = scene.add.graphics();
        
        // 创建垂直渐变效果
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const r1 = (color1 >> 16) & 0xFF;
            const g1 = (color1 >> 8) & 0xFF;
            const b1 = color1 & 0xFF;
            const r2 = (color2 >> 16) & 0xFF;
            const g2 = (color2 >> 8) & 0xFF;
            const b2 = color2 & 0xFF;
            
            const r = Math.floor(r1 + (r2 - r1) * ratio);
            const g = Math.floor(g1 + (g2 - g1) * ratio);
            const b = Math.floor(b1 + (b2 - b1) * ratio);
            
            const color = (r << 16) | (g << 8) | b;
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, (height / steps) * i, width, height / steps);
        }
        
        graphics.setDepth(depth);
        return graphics;
    }

    /**
     * 创建星空背景效果
     * @param {Phaser.Scene} scene - 场景对象
     * @param {Object} options - 选项
     * @returns {Phaser.GameObjects.Container} 背景容器
     */
    static createStarfieldBackground(scene, options = {}) {
        const { width, height } = scene.cameras.main;
        const {
            starCount = 100,
            depth = 0
        } = options;

        const container = scene.add.container(0, 0);
        container.setDepth(depth);

        // 创建渐变背景
        const gradient = this.createGradientBackground(scene, { depth: -1 });
        container.add(gradient);

        // 添加星星
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.8 + 0.2;
            
            const star = scene.add.circle(x, y, size, 0xffffff, alpha);
            container.add(star);
        }

        return container;
    }
}

