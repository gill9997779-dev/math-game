/**
 * 動態背景系統
 * 實現流動的雲霧、閃爍的數學公式星座、夕陽光影效果
 */
export class DynamicBackground {
    constructor(scene) {
        this.scene = scene;
        this.clouds = [];
        this.formulas = [];
        this.godRays = null;
        this.sunPosition = { x: 0, y: 0 };
        this.time = 0;
    }

    /**
     * 創建完整的動態背景
     */
    create() {
        const { width, height } = this.scene.cameras.main;
        
        // 創建基礎背景（如果有圖片就使用，否則使用漸變）
        this.createBaseBackground();
        
        // 已禁用所有動態效果，避免白色閃爍干擾
        // 如果需要可以取消註釋下面的代碼
        
        // 創建流動的雲霧（已禁用）
        // this.createFlowingClouds();
        
        // 創建閃爍的數學公式星座（已禁用）
        // this.createFormulaConstellations();
        
        // 創建夕陽光影效果（God Rays）（已禁用，避免白色閃爍）
        // this.createGodRays();
        
        // 開始更新循環（已禁用，因為沒有動態效果需要更新）
        // this.scene.events.on('update', this.update, this);
    }

    /**
     * 創建基礎背景
     */
    createBaseBackground() {
        const { width, height } = this.scene.cameras.main;
        
        // 優先使用背景圖片
        if (this.scene.textures.exists('game_background')) {
            this.baseBg = this.scene.add.image(width / 2, height / 2, 'game_background');
            const scaleX = width / this.baseBg.width;
            const scaleY = height / this.baseBg.height;
            this.baseBg.setScale(Math.max(scaleX, scaleY));
            this.baseBg.setDepth(-10);
        } else {
            // 使用漸變背景
            const graphics = this.scene.add.graphics();
            const steps = 100;
            const color1 = 0x1a1a2e;  // 深藍色
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
            
            graphics.setDepth(-10);
            this.baseBg = graphics;
        }
    }

    /**
     * 創建流動的雲霧
     */
    createFlowingClouds() {
        const { width, height } = this.scene.cameras.main;
        
        // 創建多層雲霧，營造深度感
        for (let layer = 0; layer < 3; layer++) {
            const cloudCount = 5 + layer * 2;
            const layerClouds = [];
            const speed = 0.2 + layer * 0.1;  // 不同層次速度不同
            const alpha = 0.3 - layer * 0.05;  // 遠景更透明
            
            for (let i = 0; i < cloudCount; i++) {
                const cloud = this.scene.add.graphics();
                cloud.setDepth(-5 + layer);
                
                // 創建不規則的雲霧形狀
                const x = Math.random() * width;
                const y = height * 0.3 + Math.random() * height * 0.4;  // 主要在山巒區域
                const size = 100 + Math.random() * 150;
                
                cloud.fillStyle(0xffffff, alpha);
                cloud.fillCircle(x, y, size);
                cloud.fillCircle(x + size * 0.5, y, size * 0.8);
                cloud.fillCircle(x - size * 0.5, y, size * 0.8);
                cloud.fillCircle(x, y - size * 0.5, size * 0.6);
                
                layerClouds.push({
                    graphics: cloud,
                    x: x,
                    y: y,
                    speed: speed,
                    offset: Math.random() * Math.PI * 2
                });
            }
            
            this.clouds.push(layerClouds);
        }
    }

    /**
     * 創建閃爍的數學公式星座（已禁用）
     */
    createFormulaConstellations() {
        // 已禁用閃爍的數學公式星座，避免白色半透明內容干擾
        // 如果需要可以取消註釋下面的代碼
        /*
        const { width, height } = this.scene.cameras.main;
        
        // 數學公式列表
        const formulas = [
            'π', 'e', '∞', '∑', '∫', '√', 'α', 'β', 'γ', 'θ',
            'φ', 'λ', 'μ', 'σ', 'Δ', '∇', '∂', 'Ω', 'Ψ', 'Φ'
        ];
        
        // 在天空區域創建公式星座
        for (let i = 0; i < 15; i++) {
            const x = width * 0.1 + Math.random() * width * 0.8;
            const y = height * 0.1 + Math.random() * height * 0.3;  // 天空區域
            const formula = formulas[Math.floor(Math.random() * formulas.length)];
            
            const text = this.scene.add.text(x, y, formula, {
                fontSize: Math.random() * 20 + 15 + 'px',
                fill: '#FFD700',
                fontFamily: 'Arial, sans-serif',
                alpha: 0.4
            });
            text.setDepth(-3);
            
            // 添加呼吸般的閃爍動畫
            const baseAlpha = 0.3 + Math.random() * 0.2;
            const blinkSpeed = 2000 + Math.random() * 2000;
            const offset = Math.random() * Math.PI * 2;
            
            this.scene.tweens.add({
                targets: text,
                alpha: { from: baseAlpha, to: baseAlpha + 0.3 },
                duration: blinkSpeed,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: offset * 1000
            });
            
            this.formulas.push({
                text: text,
                baseAlpha: baseAlpha,
                blinkSpeed: blinkSpeed
            });
        }
        */
    }

    /**
     * 創建夕陽光影效果（God Rays/體積光）
     */
    createGodRays() {
        const { width, height } = this.scene.cameras.main;
        
        // 夕陽位置（右上角）
        this.sunPosition = {
            x: width * 0.85,
            y: height * 0.2
        };
        
        // 創建多層光影效果
        this.godRays = this.scene.add.container(this.sunPosition.x, this.sunPosition.y);
        this.godRays.setDepth(-2);
        
        // 創建多條光線
        for (let i = 0; i < 8; i++) {
            const ray = this.scene.add.graphics();
            const angle = -Math.PI / 4 + (i - 4) * 0.15;  // 從左上到右下
            const length = width * 0.6;
            const width_ray = 3 + Math.random() * 2;
            
            // 創建漸變光線
            ray.lineStyle(width_ray, 0xFFD700, 0.2);
            ray.beginPath();
            ray.moveTo(0, 0);
            ray.lineTo(
                Math.cos(angle) * length,
                Math.sin(angle) * length
            );
            ray.strokePath();
            
            this.godRays.add(ray);
            
            // 添加光線強度變化動畫
            this.scene.tweens.add({
                targets: ray,
                alpha: { from: 0.15, to: 0.35 },
                duration: 3000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 200
            });
        }
        
        // 創建光暈效果
        const glow = this.scene.add.circle(
            this.sunPosition.x,
            this.sunPosition.y,
            80,
            0xFFD700,
            0.3
        );
        glow.setDepth(-2);
        
        this.scene.tweens.add({
            targets: glow,
            scale: { from: 1, to: 1.3 },
            alpha: { from: 0.2, to: 0.4 },
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.sunGlow = glow;
    }

    /**
     * 更新動畫
     */
    update(time, delta) {
        this.time += delta;
        
        // 更新雲霧流動
        const { width, height } = this.scene.cameras.main;
        
        this.clouds.forEach((layer, layerIndex) => {
            layer.forEach(cloud => {
                // 水平流動
                cloud.x += cloud.speed * (delta / 16);
                
                // 垂直輕微波動
                cloud.y += Math.sin(this.time * 0.001 + cloud.offset) * 0.5;
                
                // 如果移出屏幕，從另一側重新進入
                if (cloud.x > width + 200) {
                    cloud.x = -200;
                    cloud.y = height * 0.3 + Math.random() * height * 0.4;
                }
                
                // 更新圖形位置
                cloud.graphics.clear();
                cloud.graphics.fillStyle(0xffffff, 0.3 - layerIndex * 0.05);
                const size = 100 + Math.random() * 150;
                cloud.graphics.fillCircle(cloud.x, cloud.y, size);
                cloud.graphics.fillCircle(cloud.x + size * 0.5, cloud.y, size * 0.8);
                cloud.graphics.fillCircle(cloud.x - size * 0.5, cloud.y, size * 0.8);
                cloud.graphics.fillCircle(cloud.x, cloud.y - size * 0.5, size * 0.6);
            });
        });
    }

    /**
     * 清理資源
     */
    destroy() {
        this.scene.events.off('update', this.update, this);
        
        if (this.clouds) {
            this.clouds.forEach(layer => {
                layer.forEach(cloud => cloud.graphics.destroy());
            });
        }
        
        if (this.formulas) {
            this.formulas.forEach(formula => formula.text.destroy());
        }
        
        if (this.godRays) {
            this.godRays.destroy();
        }
        
        if (this.sunGlow) {
            this.sunGlow.destroy();
        }
    }
}

