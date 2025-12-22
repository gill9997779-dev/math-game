/**
 * 资源预加载场景
 * 用于加载游戏所需的图片、音频等资源
 */
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;
        
        // 显示加载进度
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 200, height / 2 - 30, 400, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, '加载资源中...', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2, '0%', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // 监听加载进度
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x667eea, 1);
            progressBar.fillRect(width / 2 - 190, height / 2 - 20, 380 * value, 30);
            percentText.setText(Math.round(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            console.log('所有资源加载完成');
            console.log('已加载的纹理:', Object.keys(this.textures.list));
        });

        // ========== 在这里加载你的图片资源 ==========
        
        // 加载游戏背景图片（数学修仙主题）
        // 将背景图片命名为 'game_background.png' 并放在 assets/images/ 目录下
        // 如果图片不存在，游戏会使用渐变背景
        // 注意：如果图片文件不存在，会显示404错误，但游戏仍可正常运行
        this.load.image('game_background', 'assets/images/game_background.png');
        console.log('开始加载背景图片: assets/images/game_background.png');
        
        // 加载加载动画场景的背景图片（魔法阵、数字路径、人物场景）
        // 将图片命名为 'loading_background.png' 并放在 assets/images/ 目录下
        this.load.image('loading_background', 'assets/images/loading_background.png');
        console.log('开始加载加载动画背景图片: assets/images/loading_background.png');
        
        // 加载主菜单背景图片（如果存在）
        // 注意：menu_background.png 文件不存在，已註釋掉
        // 主菜單現在使用 DynamicBackground 系統（流動雲霧、閃爍公式、夕陽光影）
        // 如果將來需要，可以取消註釋並添加 menu_background.png 文件
        // this.load.image('menu_background', 'assets/images/menu_background.png');
        
        // 示例：加载按钮图片
        // 将你的图片放在 assets/images/ 目录下
        // this.load.image('button_normal', 'assets/images/button_normal.png');
        // this.load.image('button_hover', 'assets/images/button_hover.png');
        // this.load.image('button_pressed', 'assets/images/button_pressed.png');
        
        // 示例：加载选项按钮图片
        // this.load.image('option_button', 'assets/images/option_button.png');
        // this.load.image('option_button_hover', 'assets/images/option_button_hover.png');
        
        // 示例：加载其他游戏资源
        // this.load.image('player', 'assets/images/player.png');
        // this.load.image('spirit', 'assets/images/math_spirit.png');
        // this.load.image('resource_herb', 'assets/images/herb.png');
        // this.load.image('resource_ore', 'assets/images/ore.png');
        
        // 如果使用精灵图集（spritesheet）
        // this.load.spritesheet('buttons', 'assets/images/buttons.png', {
        //     frameWidth: 200,
        //     frameHeight: 60
        // });

        // ========== 加载完成后的处理 ==========
        // 监听加载错误
        this.load.on('filecomplete', (key, type, data) => {
            console.log(`✓ 资源加载成功: ${key} (${type})`);
        });
        
        this.load.on('loaderror', (file) => {
            console.warn(`⚠ 资源加载失败: ${file.key} - ${file.url}`);
            console.warn('   这不会影响游戏运行，将使用默认背景');
        });
        
        // 如果没有资源需要加载，直接完成
        if (this.load.list.size === 0) {
            console.log('没有资源需要加载');
            this.load.emit('complete');
        } else {
            console.log(`开始加载 ${this.load.list.size} 个资源...`);
        }
    }

    create() {
        console.log('资源加载完成');
        // 加载完成后，可以在这里初始化一些全局资源
        
        // 延迟一下再切换到启动场景
        this.time.delayedCall(500, () => {
            this.scene.start('BootScene');
        });
    }
}

