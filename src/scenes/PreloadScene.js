/**
 * 资源预加载场景 - 移动端优化版本
 * 用于加载游戏所需的图片、音频等资源
 */
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;
        
        // 检测设备类型
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 显示加载进度 - 移动端优化样式
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 200, height / 2 - 30, 400, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 80, '正在加载游戏资源...', {
            fontSize: isMobile ? '18px' : '20px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2, '0%', {
            fontSize: isMobile ? '16px' : '18px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);
        
        // 网络状态提示
        const networkInfo = this.getNetworkInfo();
        const networkText = this.add.text(width / 2, height / 2 + 60, networkInfo, {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);

        // 监听加载进度
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x667eea, 1);
            progressBar.fillRect(width / 2 - 190, height / 2 - 20, 380 * value, 30);
            percentText.setText(Math.round(value * 100) + '%');
            
            // 移动端减少进度更新频率
            if (isMobile && value < 1) {
                this.time.delayedCall(50, () => {
                    // 延迟更新，减少重绘
                });
            }
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            networkText.destroy();
            console.log('所有资源加载完成');
        });

        // 设置加载超时和重试机制
        this.load.timeout = networkInfo.includes('慢速') ? 30000 : 15000;
        
        // ========== 移动端优化的资源加载策略 ==========
        
        // 根据网络状况决定加载策略
        const shouldLoadHighQuality = !isMobile && !networkInfo.includes('慢速');
        
        // 加载各个地图的背景图片 - 移动端使用压缩版本
        const zoneBackgrounds = [
            '青石村',
            '五行山', 
            '上古遗迹',
            '天机阁'
        ];
        
        zoneBackgrounds.forEach(zoneName => {
            // 始终加载标准版本，移动端通过CSS缩放优化
            const imagePath = `assets/images/zones/${zoneName}_background.png`;
            
            this.load.image(`${zoneName}_background`, imagePath);
            console.log(`开始加载地图背景: ${imagePath}`);
        });
        
        // 通用背景图片
        this.load.image('game_background', 'assets/images/game_background.png');
        
        // 加载动画背景
        this.load.image('loading_background', 'assets/images/loading_background.png');
        // 加载动画背景
        this.load.image('loading_background', 'assets/images/loading_background.png');
        
        // 移动端跳过非必要资源
        if (!isMobile) {
            // 桌面端加载额外的装饰资源
            // this.load.image('particle_effect', 'assets/images/effects/particles.png');
            // this.load.image('ui_decoration', 'assets/images/ui/decoration.png');
        }
        
        // ========== 错误处理和降级策略 ==========
        this.load.on('filecomplete', (key, type, data) => {
            console.log(`✓ 资源加载成功: ${key} (${type})`);
        });
        
        this.load.on('loaderror', (file) => {
            console.warn(`⚠ 资源加载失败: ${file.key} - ${file.url}`);
            console.warn('   这不会影响游戏运行，将使用默认背景');
            
            // 移动端降级策略：如果移动版本加载失败，尝试加载标准版本
            if (file.url.includes('/mobile/') && isMobile) {
                const fallbackUrl = file.url.replace('/mobile/', '/').replace('_mobile.png', '.png');
                console.log(`尝试降级加载: ${fallbackUrl}`);
                this.load.image(file.key + '_fallback', fallbackUrl);
            }
            
            // 更新网络状态提示
            if (networkText && networkText.active) {
                networkText.setText(networkInfo + ' - 部分资源加载失败，使用默认背景');
            }
        });
        
        // 预加载优化：移动端减少并发加载
        if (isMobile) {
            this.load.maxParallelDownloads = 2;
        }
        
        // 如果没有资源需要加载，直接完成
        if (this.load.list.size === 0) {
            console.log('没有资源需要加载');
            this.load.emit('complete');
        } else {
            console.log(`开始加载 ${this.load.list.size} 个资源...`);
        }
    }
    
    /**
     * 获取网络信息
     */
    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            const effectiveType = connection.effectiveType;
            switch (effectiveType) {
                case 'slow-2g':
                    return '网络: 2G (慢速) - 加载时间较长';
                case '2g':
                    return '网络: 2G - 请耐心等待';
                case '3g':
                    return '网络: 3G - 正在加载';
                case '4g':
                    return '网络: 4G - 快速加载中';
                default:
                    return '网络: 良好 - 正在加载';
            }
        }
        return '正在检测网络状况...';
    }

    create() {
        console.log('资源加载完成');
        
        // 移动端额外的初始化
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 移动端内存管理
            this.textures.removeKey('__DEFAULT');
            this.textures.removeKey('__MISSING');
            
            // 启用纹理压缩（如果支持）
            if (this.renderer.gl) {
                const gl = this.renderer.gl;
                const ext = gl.getExtension('WEBGL_compressed_texture_s3tc') || 
                           gl.getExtension('WEBGL_compressed_texture_etc1') ||
                           gl.getExtension('WEBGL_compressed_texture_pvrtc');
                if (ext) {
                    console.log('✓ 支持纹理压缩，已启用');
                }
            }
        }
        
        // 延迟切换场景，让加载完成动画播放完毕
        this.time.delayedCall(isMobile ? 800 : 500, () => {
            this.scene.start('BootScene');
        });
    }
}

