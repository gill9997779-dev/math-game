/**
 * 按钮工厂类
 * 用于创建各种类型的按钮（文本按钮、图片按钮等）
 */
export class ButtonFactory {
    /**
     * 创建图片按钮
     * @param {Phaser.Scene} scene - 场景对象
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} textureKey - 图片资源键名
     * @param {string} hoverTextureKey - 悬停时的图片资源键名（可选）
     * @param {string} text - 按钮文字（可选）
     * @param {Function} callback - 点击回调函数
     * @param {Object} options - 额外选项
     * @returns {Phaser.GameObjects.Container} 按钮容器
     */
    static createImageButton(scene, x, y, textureKey, hoverTextureKey, text, callback, options = {}) {
        const {
            scale = 1,
            textStyle = {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontFamily: 'Arial, sans-serif'
            },
            textOffsetY = 0,
            depth = 10
        } = options;

        // 创建按钮容器
        const container = scene.add.container(x, y);
        container.setDepth(depth);

        // 创建按钮图片
        let buttonImage;
        if (scene.textures.exists(textureKey)) {
            buttonImage = scene.add.image(0, 0, textureKey);
        } else {
            // 如果图片不存在，使用占位矩形
            console.warn(`图片资源 "${textureKey}" 不存在，使用占位图形`);
            buttonImage = scene.add.rectangle(0, 0, 200, 60, 0x667eea);
        }
        buttonImage.setScale(scale);
        container.add(buttonImage);

        // 如果有文字，添加文字
        let buttonText = null;
        if (text) {
            buttonText = scene.add.text(0, textOffsetY, text, textStyle);
            buttonText.setOrigin(0.5);
            container.add(buttonText);
        }

        // 设置交互区域（使用图片的尺寸）
        const width = buttonImage.width * scale;
        const height = buttonImage.height * scale;
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        // 点击事件
        container.on('pointerdown', () => {
            if (callback) callback();
        });

        // 悬停效果
        let hoverImage = null;
        if (hoverTextureKey && scene.textures.exists(hoverTextureKey)) {
            hoverImage = scene.add.image(0, 0, hoverTextureKey);
            hoverImage.setScale(scale);
            hoverImage.setVisible(false);
            container.add(hoverImage);
        }

        container.on('pointerover', () => {
            if (hoverImage) {
                buttonImage.setVisible(false);
                hoverImage.setVisible(true);
            } else {
                buttonImage.setTint(0xcccccc); // 变亮效果
                if (buttonText) {
                    buttonText.setScale(1.1);
                }
            }
            container.setScale(1.05);
        });

        container.on('pointerout', () => {
            if (hoverImage) {
                buttonImage.setVisible(true);
                hoverImage.setVisible(false);
            } else {
                buttonImage.clearTint();
                if (buttonText) {
                    buttonText.setScale(1.0);
                }
            }
            container.setScale(1.0);
        });

        // 保存引用以便后续操作
        container.buttonImage = buttonImage;
        container.buttonText = buttonText;
        container.hoverImage = hoverImage;

        return container;
    }

    /**
     * 创建文本按钮（兼容现有代码）
     * @param {Phaser.Scene} scene - 场景对象
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} text - 按钮文字
     * @param {Function} callback - 点击回调函数
     * @param {Object} style - 文本样式
     * @returns {Phaser.GameObjects.Text} 文本按钮
     */
    static createTextButton(scene, x, y, text, callback, style = {}) {
        const defaultStyle = {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#667eea',
            padding: { x: 30, y: 15 },
            ...style
        };

        const button = scene.add.text(x, y, text, defaultStyle);
        button.setOrigin(0.5);
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => {
            if (callback) callback();
        });
        button.on('pointerover', () => {
            button.setTint(0x764ba2);
            button.setScale(1.05);
        });
        button.on('pointerout', () => {
            button.clearTint();
            button.setScale(1.0);
        });

        return button;
    }

    /**
     * 创建图形按钮（使用 Phaser 图形）
     * @param {Phaser.Scene} scene - 场景对象
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} color - 颜色值
     * @param {string} text - 按钮文字（可选）
     * @param {Function} callback - 点击回调函数
     * @param {Object} options - 额外选项
     * @returns {Phaser.GameObjects.Container} 按钮容器
     */
    static createShapeButton(scene, x, y, width, height, color, text, callback, options = {}) {
        const {
            borderRadius = 10,
            hoverColor = null,
            textStyle = {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontFamily: 'Arial, sans-serif'
            },
            depth = 10
        } = options;

        const container = scene.add.container(x, y);
        container.setDepth(depth);

        // 创建圆角矩形
        const graphics = scene.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
        container.add(graphics);

        // 添加文字
        let buttonText = null;
        if (text) {
            buttonText = scene.add.text(0, 0, text, textStyle);
            buttonText.setOrigin(0.5);
            container.add(buttonText);
        }

        // 设置交互
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        container.on('pointerdown', () => {
            if (callback) callback();
        });

        // 悬停效果
        container.on('pointerover', () => {
            if (hoverColor) {
                graphics.clear();
                graphics.fillStyle(hoverColor);
                graphics.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
            } else {
                container.setScale(1.05);
            }
            if (buttonText) {
                buttonText.setScale(1.1);
            }
        });

        container.on('pointerout', () => {
            if (hoverColor) {
                graphics.clear();
                graphics.fillStyle(color);
                graphics.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
            } else {
                container.setScale(1.0);
            }
            if (buttonText) {
                buttonText.setScale(1.0);
            }
        });

        container.graphics = graphics;
        container.buttonText = buttonText;
        container.originalColor = color;
        container.hoverColor = hoverColor;

        return container;
    }
}

