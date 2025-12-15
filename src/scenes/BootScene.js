// Phaser 从全局对象获取
const { Scene } = Phaser;

export class BootScene extends Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    create() {
        console.log('=== BootScene create() 被调用 ===');
        const { width, height } = this.cameras.main;
        console.log('Canvas 尺寸:', width, height);
        
        // 启动场景使用渐变背景（背景图片只在GameScene中使用）
        this.createGradientBackground();
    }
    
    createGradientBackground() {
        const { width, height } = this.cameras.main;
        const graphics = this.add.graphics();
        const steps = 100;
        const color1 = 0x1a1a2e;  // 深蓝色
        const color2 = 0x2d1b4e;  // 深紫色
        
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
        
        graphics.setDepth(0);
        console.log('✓ BootScene 渐变背景已创建');
        
        // 先显示测试文本，确认场景正常工作
        const testText = this.add.text(width / 2, height / 2 - 100, '数道仙途', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#667eea',
            strokeThickness: 4
        });
        testText.setOrigin(0.5);
        console.log('✓ 标题文本已创建:', testText);
        
        // 显示状态文本
        const statusText = this.add.text(width / 2, height / 2, '游戏正在初始化...', {
            fontSize: '28px',
            fill: '#50e3c2',
            fontFamily: 'Arial, sans-serif'
        });
        statusText.setOrigin(0.5);
        console.log('✓ 状态文本已创建:', statusText);
        
        // 添加一个可见的矩形，确保场景真的在工作
        const rect = this.add.rectangle(width / 2, height / 2 + 150, 300, 50, 0x667eea);
        const buttonText = this.add.text(width / 2, height / 2 + 150, '点击进入游戏', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        buttonText.setOrigin(0.5);
        rect.setInteractive({ useHandCursor: true });
        rect.on('pointerdown', () => {
            console.log('按钮被点击，切换到主菜单');
            this.scene.start('MainMenuScene');
        });
        console.log('✓ 按钮已创建');
        
        // 隐藏页面上的 loading 元素
        if (typeof document !== 'undefined') {
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.style.display = 'none';
                console.log('✓ 页面 loading 元素已隐藏');
            }
        }
        
        console.log('BootScene 完全初始化完成');
        
        // 延迟切换到主菜单
        this.time.delayedCall(3000, () => {
            console.log('3秒后自动切换到 MainMenuScene...');
            try {
                this.scene.start('MainMenuScene');
            } catch (error) {
                console.error('切换场景失败:', error);
                statusText.setText('切换场景失败: ' + error.message);
                statusText.setColor('#ff6b6b');
            }
        });
    }
}

