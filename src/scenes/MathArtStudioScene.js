// Phaser 从全局对象获取
import { UIComponents } from '../core/UIComponents.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 数学艺术工作室场景
 * 函数图形艺术、几何建筑设计、数列音乐创作
 */
export class MathArtStudioScene extends Scene {
    constructor() {
        super({ key: 'MathArtStudioScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // UI组件
        this.ui = new UIComponents(this);
        
        // 当前创作模式
        this.currentMode = 'function'; // 'function', 'geometry', 'music'
        
        // 创建背景
        this.createBackground();
        
        // 创建工作室界面
        this.createStudioInterface();
        
        // 创建模式切换标签
        this.createModeTabs();
        
        // 创建画布区域
        this.createCanvas();
        
        // 创建控制面板
        this.createControlPanel();
        
        // 初始化函数图形模式
        this.initFunctionMode();
        
        Logger.info('MathArtStudioScene 创建完成');
    }
    
    createBackground() {
        // 艺术工作室背景
        const graphics = this.add.graphics();
        this.drawGradientBackground(graphics, 0x0a0a0a, 0x1a1a2e, 0x2d1b4e);
        graphics.setDepth(0);
        
        // 添加网格背景
        this.createGridBackground();
    }
    
    createGridBackground() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.3);
        
        // 绘制网格
        const gridSize = 20;
        for (let x = 0; x < this.cameras.main.width; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.cameras.main.height);
        }
        for (let y = 0; y < this.cameras.main.height; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.cameras.main.width, y);
        }
        graphics.strokePath();
        graphics.setDepth(1);
    }
    
    drawGradientBackground(graphics, color1, color2, color3) {
        const steps = 50;
        const height = this.cameras.main.height;
        
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            let color;
            
            if (ratio < 0.5) {
                const r = ratio * 2;
                color = this.lerpColor(color1, color2, r);
            } else {
                const r = (ratio - 0.5) * 2;
                color = this.lerpColor(color2, color3, r);
            }
            
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, (height / steps) * i, this.cameras.main.width, height / steps + 1);
        }
    }
    
    lerpColor(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;
        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;
        
        const r = Math.floor(r1 + (r2 - r1) * ratio);
        const g = Math.floor(g1 + (g2 - g1) * ratio);
        const b = Math.floor(b1 + (b2 - b1) * ratio);
        
        return (r << 16) | (g << 8) | b;
    }
    
    createStudioInterface() {
        // 标题
        this.add.text(this.cameras.main.width / 2, 40, '🎨 数学艺术工作室', {
            fontSize: '36px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(10);
        
        // 返回按钮
        const returnBtn = this.add.text(50, 40, '← 返回', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0, 0.5).setDepth(10).setInteractive({ useHandCursor: true });
        
        returnBtn.on('pointerover', () => returnBtn.setTint(0x667eea));
        returnBtn.on('pointerout', () => returnBtn.clearTint());
        returnBtn.on('pointerdown', () => this.returnToGame());
    }
    
    createModeTabs() {
        const tabs = [
            { key: 'function', label: '📈 函数图形', desc: '用数学函数创作艺术图案' },
            { key: 'geometry', label: '🏛️ 几何建筑', desc: '设计数学美学建筑' },
            { key: 'music', label: '🎵 数列音乐', desc: '将数学序列转化为音乐' }
        ];
        
        this.tabContainer = this.add.container(this.cameras.main.width / 2, 100);
        this.tabContainer.setDepth(10);
        
        tabs.forEach((tab, index) => {
            const x = (index - 1) * 200;
            const isActive = tab.key === this.currentMode;
            
            // 标签背景
            const bg = this.add.rectangle(x, 0, 180, 60, 
                isActive ? 0x667eea : 0x333333, 0.9);
            bg.setStrokeStyle(2, isActive ? 0xFFD700 : 0x666666);
            bg.setInteractive({ useHandCursor: true });
            
            // 标签文字
            const text = this.add.text(x, -5, tab.label, {
                fontSize: '18px',
                fill: isActive ? '#FFFFFF' : '#AAAAAA',
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            
            // 描述文字
            const desc = this.add.text(x, 15, tab.desc, {
                fontSize: '12px',
                fill: isActive ? '#CCCCCC' : '#888888',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5);
            
            this.tabContainer.add([bg, text, desc]);
            
            // 点击事件
            bg.on('pointerdown', () => this.switchMode(tab.key));
            
            // 悬停效果
            bg.on('pointerover', () => {
                if (tab.key !== this.currentMode) {
                    bg.setFillStyle(0x444444, 0.9);
                }
            });
            bg.on('pointerout', () => {
                if (tab.key !== this.currentMode) {
                    bg.setFillStyle(0x333333, 0.9);
                }
            });
        });
    }
    
    createCanvas() {
        // 画布区域
        this.canvasArea = this.add.container(this.cameras.main.width / 2, 400);
        this.canvasArea.setDepth(5);
        
        // 画布背景
        this.canvasBg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.8);
        this.canvasBg.setStrokeStyle(3, 0x667eea);
        this.canvasArea.add(this.canvasBg);
        
        // 画布图形容器
        this.canvasGraphics = this.add.graphics();
        this.canvasGraphics.setPosition(this.cameras.main.width / 2 - 300, 200);
        this.canvasGraphics.setDepth(6);
    }
    
    createControlPanel() {
        // 控制面板
        this.controlPanel = this.add.container(100, 400);
        this.controlPanel.setDepth(10);
        
        // 面板背景
        const panelBg = this.add.rectangle(0, 0, 180, 400, 0x1a1a2e, 0.9);
        panelBg.setStrokeStyle(2, 0x667eea);
        this.controlPanel.add(panelBg);
        
        // 控制标题
        const title = this.add.text(0, -180, '🎛️ 控制面板', {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        this.controlPanel.add(title);
        
        // 控制元素容器
        this.controlElements = this.add.container(0, -120);
        this.controlPanel.add(this.controlElements);
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // 停止当前模式的动画
        if (this.functionAnimationTimer) {
            this.stopFunctionAnimation();
        }
        
        // 更新标签样式
        this.tabContainer.removeAll(true);
        this.createModeTabs();
        
        // 清空画布
        this.canvasGraphics.clear();
        
        // 清空控制面板
        this.controlElements.removeAll(true);
        
        // 初始化对应模式
        switch (mode) {
            case 'function':
                this.initFunctionMode();
                break;
            case 'geometry':
                this.initGeometryMode();
                break;
            case 'music':
                this.initMusicMode();
                break;
        }
    }
    
    initFunctionMode() {
        Logger.info('初始化函数图形模式');
        
        // 函数输入框
        this.createFunctionControls();
        
        // 默认函数
        this.currentFunction = 'sin(x)';
        this.functionParams = { amplitude: 1, frequency: 1, phase: 0 };
        
        // 动态参数
        this.animationEnabled = true;
        this.animationSpeed = 1;
        this.timeOffset = 0;
        
        // 开始动态绘制
        this.startFunctionAnimation();
    }
    
    createFunctionControls() {
        let yOffset = 0;
        
        // 函数输入
        const funcLabel = this.add.text(0, yOffset, '函数表达式:', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(funcLabel);
        
        yOffset += 30;
        
        // 预设函数按钮
        const presetFunctions = [
            { name: 'sin(x)', label: '正弦波' },
            { name: 'cos(x)', label: '余弦波' },
            { name: 'sin(x) * cos(x)', label: '波浪' },
            { name: 'x * sin(x)', label: '螺旋' },
            { name: 'sin(x) + cos(2*x)', label: '复合波' },
            { name: 'x^2', label: '抛物线' },
            { name: 'abs(sin(x))', label: '绝对值' }
        ];
        
        presetFunctions.forEach((func, index) => {
            const btn = this.add.text(0, yOffset, func.label, {
                fontSize: '12px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial',
                backgroundColor: '#667eea',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerover', () => btn.setTint(0x764ba2));
            btn.on('pointerout', () => btn.clearTint());
            btn.on('pointerdown', () => {
                this.currentFunction = func.name;
                // 动态模式下不需要手动重绘
            });
            
            this.controlElements.add(btn);
            yOffset += 25;
        });
        
        // 参数控制
        yOffset += 20;
        this.createParameterControls(yOffset);
    }
    
    createParameterControls(yOffset) {
        // 振幅控制
        const ampLabel = this.add.text(0, yOffset, '振幅: 1.0', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(ampLabel);
        
        yOffset += 20;
        
        // 振幅按钮
        const ampButtons = [
            { value: 0.5, label: '0.5' },
            { value: 1.0, label: '1.0' },
            { value: 2.0, label: '2.0' }
        ];
        
        ampButtons.forEach((btn, index) => {
            const button = this.add.text(-40 + index * 40, yOffset, btn.label, {
                fontSize: '10px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                backgroundColor: '#4a90e2',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            button.on('pointerdown', () => {
                this.functionParams.amplitude = btn.value;
                ampLabel.setText(`振幅: ${btn.value}`);
                // 动态模式下不需要手动重绘
            });
            
            this.controlElements.add(button);
        });
        
        yOffset += 30;
        
        // 频率控制
        const freqLabel = this.add.text(0, yOffset, '频率: 1.0', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(freqLabel);
        
        yOffset += 20;
        
        // 频率按钮
        const freqButtons = [
            { value: 0.5, label: '0.5' },
            { value: 1.0, label: '1.0' },
            { value: 2.0, label: '2.0' }
        ];
        
        freqButtons.forEach((btn, index) => {
            const button = this.add.text(-40 + index * 40, yOffset, btn.label, {
                fontSize: '10px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                backgroundColor: '#50e3c2',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            button.on('pointerdown', () => {
                this.functionParams.frequency = btn.value;
                freqLabel.setText(`频率: ${btn.value}`);
                // 动态模式下不需要手动重绘
            });
            
            this.controlElements.add(button);
        });
        
        yOffset += 40;
        
        // 动画控制
        const animLabel = this.add.text(0, yOffset, '动画效果:', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(animLabel);
        
        yOffset += 20;
        
        // 动画开关按钮
        this.animToggleBtn = this.add.text(0, yOffset, '⏸️ 暂停', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            backgroundColor: '#FF6B6B',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.animToggleBtn.on('pointerdown', () => {
            this.toggleAnimation();
        });
        
        this.controlElements.add(this.animToggleBtn);
        
        yOffset += 30;
        
        // 动画速度控制
        const speedLabel = this.add.text(0, yOffset, '速度: 1.0x', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(speedLabel);
        
        yOffset += 20;
        
        const speedButtons = [
            { value: 0.5, label: '0.5x' },
            { value: 1.0, label: '1.0x' },
            { value: 2.0, label: '2.0x' }
        ];
        
        speedButtons.forEach((btn, index) => {
            const button = this.add.text(-40 + index * 40, yOffset, btn.label, {
                fontSize: '10px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                backgroundColor: '#9013FE',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            button.on('pointerdown', () => {
                this.animationSpeed = btn.value;
                speedLabel.setText(`速度: ${btn.value}x`);
            });
            
            this.controlElements.add(button);
        });
    }
    
    drawFunction() {
        this.canvasGraphics.clear();
        
        const canvasWidth = 600;
        const canvasHeight = 400;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // 绘制坐标轴
        this.canvasGraphics.lineStyle(2, 0x666666, 0.8);
        this.canvasGraphics.moveTo(0, centerY);
        this.canvasGraphics.lineTo(canvasWidth, centerY);
        this.canvasGraphics.moveTo(centerX, 0);
        this.canvasGraphics.lineTo(centerX, canvasHeight);
        this.canvasGraphics.strokePath();
        
        // 绘制网格线
        this.canvasGraphics.lineStyle(1, 0x333333, 0.3);
        for (let i = 50; i < canvasWidth; i += 50) {
            this.canvasGraphics.moveTo(i, 0);
            this.canvasGraphics.lineTo(i, canvasHeight);
        }
        for (let i = 50; i < canvasHeight; i += 50) {
            this.canvasGraphics.moveTo(0, i);
            this.canvasGraphics.lineTo(canvasWidth, i);
        }
        this.canvasGraphics.strokePath();
        
        // 绘制函数曲线（带动态相位）
        this.drawAnimatedFunction(canvasWidth, canvasHeight, centerX, centerY);
        
        // 添加函数标签
        if (this.functionLabel) {
            this.functionLabel.destroy();
        }
        this.functionLabel = this.add.text(
            this.cameras.main.width / 2 - 280, 
            220, 
            `f(x) = ${this.currentFunction} ${this.animationEnabled ? '(动态)' : '(静态)'}`, 
            {
                fontSize: '16px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 8, y: 4 }
            }
        ).setDepth(7);
    }
    
    drawAnimatedFunction(canvasWidth, canvasHeight, centerX, centerY) {
        const scale = 50; // 缩放因子
        
        // 绘制轨迹效果（淡化的历史曲线）
        if (this.animationEnabled) {
            this.drawFunctionTrails(canvasWidth, canvasHeight, centerX, centerY, scale);
        }
        
        // 绘制主函数曲线
        this.canvasGraphics.lineStyle(3, 0x667eea, 1);
        this.canvasGraphics.beginPath();
        
        let firstPoint = true;
        
        for (let px = 0; px < canvasWidth; px += 2) {
            const x = (px - centerX) / scale;
            let y;
            
            try {
                // 计算函数值（加入时间偏移实现动态效果）
                y = this.evaluateFunction(this.currentFunction, x, this.animationEnabled ? this.timeOffset : 0);
                
                // 应用参数
                y *= this.functionParams.amplitude;
                
                // 转换到画布坐标
                const py = centerY - y * scale;
                
                // 检查是否在画布范围内
                if (py >= -50 && py <= canvasHeight + 50 && !isNaN(y) && isFinite(y)) {
                    if (firstPoint) {
                        this.canvasGraphics.moveTo(px, py);
                        firstPoint = false;
                    } else {
                        this.canvasGraphics.lineTo(px, py);
                    }
                }
            } catch (e) {
                // 忽略计算错误
            }
        }
        
        this.canvasGraphics.strokePath();
        
        // 绘制动态点
        if (this.animationEnabled) {
            this.drawDynamicPoints(canvasWidth, canvasHeight, centerX, centerY, scale);
        }
    }
    
    drawFunctionTrails(canvasWidth, canvasHeight, centerX, centerY, scale) {
        // 绘制3条轨迹线，透明度递减
        const trailOffsets = [-0.3, -0.6, -0.9];
        const alphas = [0.5, 0.3, 0.15];
        
        trailOffsets.forEach((offset, index) => {
            this.canvasGraphics.lineStyle(2, 0x667eea, alphas[index]);
            this.canvasGraphics.beginPath();
            
            let firstPoint = true;
            
            for (let px = 0; px < canvasWidth; px += 4) {
                const x = (px - centerX) / scale;
                
                try {
                    const y = this.evaluateFunction(this.currentFunction, x, this.timeOffset + offset) * this.functionParams.amplitude;
                    const py = centerY - y * scale;
                    
                    if (py >= -50 && py <= canvasHeight + 50 && !isNaN(y) && isFinite(y)) {
                        if (firstPoint) {
                            this.canvasGraphics.moveTo(px, py);
                            firstPoint = false;
                        } else {
                            this.canvasGraphics.lineTo(px, py);
                        }
                    }
                } catch (e) {
                    // 忽略计算错误
                }
            }
            
            this.canvasGraphics.strokePath();
        });
    }
    
    drawDynamicPoints(canvasWidth, canvasHeight, centerX, centerY, scale) {
        // 在函数曲线上绘制移动的亮点
        const pointPositions = [-4, -2, 0, 2, 4]; // x轴上的特殊点
        
        pointPositions.forEach(xPos => {
            try {
                const y = this.evaluateFunction(this.currentFunction, xPos, this.timeOffset) * this.functionParams.amplitude;
                const px = centerX + xPos * scale;
                const py = centerY - y * scale;
                
                if (px >= 0 && px <= canvasWidth && py >= 0 && py <= canvasHeight && !isNaN(y) && isFinite(y)) {
                    // 绘制发光点
                    this.canvasGraphics.fillStyle(0xFFD700, 0.8);
                    this.canvasGraphics.fillCircle(px, py, 6);
                    
                    // 绘制光晕效果
                    this.canvasGraphics.fillStyle(0xFFD700, 0.3);
                    this.canvasGraphics.fillCircle(px, py, 12);
                }
            } catch (e) {
                // 忽略计算错误
            }
        });
    }
    
    evaluateFunction(funcStr, x, timeOffset = 0) {
        // 简单的函数求值器，支持时间偏移
        let expr = funcStr.replace(/x/g, `(${x})`);
        
        // 添加时间变量支持
        if (timeOffset !== 0) {
            // 为支持动态效果的函数添加时间偏移
            if (funcStr.includes('sin') || funcStr.includes('cos')) {
                expr = expr.replace(/Math\.sin\(([^)]+)\)/g, `Math.sin($1 + ${timeOffset})`);
                expr = expr.replace(/Math\.cos\(([^)]+)\)/g, `Math.cos($1 + ${timeOffset})`);
            }
        }
        
        // 替换数学函数
        expr = expr.replace(/sin/g, 'Math.sin');
        expr = expr.replace(/cos/g, 'Math.cos');
        expr = expr.replace(/tan/g, 'Math.tan');
        expr = expr.replace(/abs/g, 'Math.abs');
        expr = expr.replace(/sqrt/g, 'Math.sqrt');
        expr = expr.replace(/\^/g, '**'); // 幂运算
        
        try {
            return eval(expr);
        } catch (e) {
            return 0;
        }
    }
    
    initGeometryMode() {
        Logger.info('初始化几何建筑模式');
        
        // 创建几何控制
        this.createGeometryControls();
        
        // 默认几何图形
        this.currentGeometry = 'pentagon';
        this.geometryParams = { sides: 5, radius: 100, rotation: 0 };
        this.drawGeometry();
    }
    
    createGeometryControls() {
        let yOffset = 0;
        
        // 几何图形选择
        const geoLabel = this.add.text(0, yOffset, '几何图形:', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(geoLabel);
        
        yOffset += 30;
        
        // 预设几何图形
        const geometries = [
            { name: 'triangle', label: '三角形', sides: 3 },
            { name: 'square', label: '正方形', sides: 4 },
            { name: 'pentagon', label: '五边形', sides: 5 },
            { name: 'hexagon', label: '六边形', sides: 6 },
            { name: 'octagon', label: '八边形', sides: 8 },
            { name: 'circle', label: '圆形', sides: 0 }
        ];
        
        geometries.forEach((geo, index) => {
            const btn = this.add.text(0, yOffset, geo.label, {
                fontSize: '12px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial',
                backgroundColor: '#764ba2',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerover', () => btn.setTint(0x9013FE));
            btn.on('pointerout', () => btn.clearTint());
            btn.on('pointerdown', () => {
                this.currentGeometry = geo.name;
                this.geometryParams.sides = geo.sides;
                this.drawGeometry();
            });
            
            this.controlElements.add(btn);
            yOffset += 25;
        });
        
        yOffset += 20;
        
        // 大小控制
        const sizeLabel = this.add.text(0, yOffset, '大小: 100', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(sizeLabel);
        
        yOffset += 20;
        
        const sizeButtons = [
            { value: 50, label: '小' },
            { value: 100, label: '中' },
            { value: 150, label: '大' }
        ];
        
        sizeButtons.forEach((btn, index) => {
            const button = this.add.text(-40 + index * 40, yOffset, btn.label, {
                fontSize: '10px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                backgroundColor: '#B8E986',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            button.on('pointerdown', () => {
                this.geometryParams.radius = btn.value;
                sizeLabel.setText(`大小: ${btn.value}`);
                this.drawGeometry();
            });
            
            this.controlElements.add(button);
        });
    }
    
    drawGeometry() {
        this.canvasGraphics.clear();
        
        const canvasWidth = 600;
        const canvasHeight = 400;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // 绘制背景网格
        this.canvasGraphics.lineStyle(1, 0x333333, 0.3);
        for (let i = 0; i <= canvasWidth; i += 50) {
            this.canvasGraphics.moveTo(i, 0);
            this.canvasGraphics.lineTo(i, canvasHeight);
        }
        for (let i = 0; i <= canvasHeight; i += 50) {
            this.canvasGraphics.moveTo(0, i);
            this.canvasGraphics.lineTo(canvasWidth, i);
        }
        this.canvasGraphics.strokePath();
        
        // 绘制几何图形
        this.canvasGraphics.lineStyle(4, 0x764ba2, 1);
        this.canvasGraphics.fillStyle(0x764ba2, 0.3);
        
        if (this.currentGeometry === 'circle') {
            // 绘制圆形
            this.canvasGraphics.fillCircle(centerX, centerY, this.geometryParams.radius);
            this.canvasGraphics.strokeCircle(centerX, centerY, this.geometryParams.radius);
        } else {
            // 绘制多边形
            const sides = this.geometryParams.sides;
            const radius = this.geometryParams.radius;
            const angleStep = (Math.PI * 2) / sides;
            
            this.canvasGraphics.beginPath();
            
            for (let i = 0; i <= sides; i++) {
                const angle = i * angleStep - Math.PI / 2; // 从顶部开始
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                if (i === 0) {
                    this.canvasGraphics.moveTo(x, y);
                } else {
                    this.canvasGraphics.lineTo(x, y);
                }
            }
            
            this.canvasGraphics.closePath();
            this.canvasGraphics.fillPath();
            this.canvasGraphics.strokePath();
        }
        
        // 添加几何标签
        if (this.geometryLabel) {
            this.geometryLabel.destroy();
        }
        this.geometryLabel = this.add.text(
            this.cameras.main.width / 2 - 280, 
            220, 
            `几何图形: ${this.currentGeometry}`, 
            {
                fontSize: '16px',
                fill: '#764ba2',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 8, y: 4 }
            }
        ).setDepth(7);
    }
    
    initMusicMode() {
        Logger.info('初始化数列音乐模式');
        
        // 创建音乐控制
        this.createMusicControls();
        
        // 默认数列
        this.currentSequence = 'fibonacci';
        this.musicParams = { tempo: 120, octave: 4 };
        this.generateMusic();
    }
    
    createMusicControls() {
        let yOffset = 0;
        
        // 数列选择
        const seqLabel = this.add.text(0, yOffset, '数学数列:', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        this.controlElements.add(seqLabel);
        
        yOffset += 30;
        
        // 预设数列
        const sequences = [
            { name: 'fibonacci', label: '斐波那契' },
            { name: 'prime', label: '质数列' },
            { name: 'square', label: '平方数' },
            { name: 'triangular', label: '三角数' },
            { name: 'factorial', label: '阶乘' }
        ];
        
        sequences.forEach((seq, index) => {
            const btn = this.add.text(0, yOffset, seq.label, {
                fontSize: '12px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial',
                backgroundColor: '#50e3c2',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerover', () => btn.setTint(0x4a9e8f));
            btn.on('pointerout', () => btn.clearTint());
            btn.on('pointerdown', () => {
                this.currentSequence = seq.name;
                this.generateMusic();
            });
            
            this.controlElements.add(btn);
            yOffset += 25;
        });
        
        yOffset += 20;
        
        // 播放按钮
        const playBtn = this.add.text(0, yOffset, '🎵 播放音乐', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: '#FF6B6B',
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        playBtn.on('pointerover', () => playBtn.setTint(0xcc5555));
        playBtn.on('pointerout', () => playBtn.clearTint());
        playBtn.on('pointerdown', () => this.playMusic());
        
        this.controlElements.add(playBtn);
    }
    
    generateMusic() {
        // 生成数列
        const sequence = this.generateSequence(this.currentSequence, 8);
        
        // 清空画布并绘制音符
        this.canvasGraphics.clear();
        
        const canvasWidth = 600;
        const canvasHeight = 400;
        
        // 绘制五线谱
        this.canvasGraphics.lineStyle(2, 0x666666, 0.8);
        for (let i = 1; i <= 5; i++) {
            const y = (canvasHeight / 6) * i;
            this.canvasGraphics.moveTo(50, y);
            this.canvasGraphics.lineTo(canvasWidth - 50, y);
        }
        this.canvasGraphics.strokePath();
        
        // 绘制音符
        const noteWidth = (canvasWidth - 100) / sequence.length;
        sequence.forEach((value, index) => {
            const x = 50 + index * noteWidth + noteWidth / 2;
            const noteHeight = Math.min(5, Math.max(1, value % 5 + 1));
            const y = (canvasHeight / 6) * noteHeight;
            
            // 绘制音符
            this.canvasGraphics.fillStyle(0x50e3c2, 1);
            this.canvasGraphics.fillCircle(x, y, 8);
            
            // 绘制符干
            this.canvasGraphics.lineStyle(3, 0x50e3c2, 1);
            this.canvasGraphics.moveTo(x + 8, y);
            this.canvasGraphics.lineTo(x + 8, y - 40);
            this.canvasGraphics.strokePath();
        });
        
        // 添加数列标签
        if (this.musicLabel) {
            this.musicLabel.destroy();
        }
        this.musicLabel = this.add.text(
            this.cameras.main.width / 2 - 280, 
            220, 
            `数列: ${this.currentSequence} [${sequence.join(', ')}]`, 
            {
                fontSize: '14px',
                fill: '#50e3c2',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 8, y: 4 }
            }
        ).setDepth(7);
        
        this.currentMusicSequence = sequence;
    }
    
    generateSequence(type, length) {
        switch (type) {
            case 'fibonacci':
                const fib = [1, 1];
                for (let i = 2; i < length; i++) {
                    fib[i] = fib[i-1] + fib[i-2];
                }
                return fib;
                
            case 'prime':
                const primes = [];
                let num = 2;
                while (primes.length < length) {
                    if (this.isPrime(num)) {
                        primes.push(num);
                    }
                    num++;
                }
                return primes;
                
            case 'square':
                return Array.from({length}, (_, i) => (i + 1) ** 2);
                
            case 'triangular':
                return Array.from({length}, (_, i) => (i + 1) * (i + 2) / 2);
                
            case 'factorial':
                const fact = [1];
                for (let i = 1; i < length; i++) {
                    fact[i] = fact[i-1] * (i + 1);
                }
                return fact;
                
            default:
                return Array.from({length}, (_, i) => i + 1);
        }
    }
    
    isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) return false;
        }
        return true;
    }
    
    playMusic() {
        if (!this.currentMusicSequence) return;
        
        // 简单的音频反馈（使用 Web Audio API 或显示播放动画）
        Logger.info('播放音乐序列:', this.currentMusicSequence);
        
        // 显示播放动画
        this.showPlayingAnimation();
    }
    
    showPlayingAnimation() {
        // 创建播放动画效果
        const playingText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            '🎵 正在播放... 🎵', 
            {
                fontSize: '32px',
                fill: '#50e3c2',
                fontFamily: 'Microsoft YaHei, Arial',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 20, y: 15 }
            }
        ).setOrigin(0.5).setDepth(100);
        
        // 淡入淡出动画
        this.tweens.add({
            targets: playingText,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1 },
            duration: 500,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                playingText.destroy();
            }
        });
    }
    
    returnToGame() {
        Logger.info('返回游戏主界面');
        this.scene.start('GameScene', { preserveData: true });
    }
    
    startFunctionAnimation() {
        // 启动动画循环
        if (this.functionAnimationTimer) {
            this.functionAnimationTimer.destroy();
        }
        
        this.functionAnimationTimer = this.time.addEvent({
            delay: 50, // 20 FPS
            callback: this.updateFunctionAnimation,
            callbackScope: this,
            loop: true
        });
        
        Logger.info('函数动画已启动');
    }
    
    updateFunctionAnimation() {
        if (!this.animationEnabled) return;
        
        // 更新时间偏移
        this.timeOffset += 0.1 * this.animationSpeed;
        
        // 重绘函数
        this.drawFunction();
    }
    
    toggleAnimation() {
        this.animationEnabled = !this.animationEnabled;
        
        if (this.animToggleBtn) {
            this.animToggleBtn.setText(this.animationEnabled ? '⏸️ 暂停' : '▶️ 播放');
            this.animToggleBtn.setBackgroundColor(this.animationEnabled ? '#FF6B6B' : '#50e3c2');
        }
        
        if (!this.animationEnabled) {
            // 静态模式下重绘一次
            this.drawFunction();
        }
        
        Logger.info(`动画${this.animationEnabled ? '已启动' : '已暂停'}`);
    }
    
    stopFunctionAnimation() {
        if (this.functionAnimationTimer) {
            this.functionAnimationTimer.destroy();
            this.functionAnimationTimer = null;
        }
    }
    
    destroy() {
        // 清理动画定时器
        this.stopFunctionAnimation();
        
        // 清理标签
        if (this.functionLabel) {
            this.functionLabel.destroy();
        }
        if (this.geometryLabel) {
            this.geometryLabel.destroy();
        }
        if (this.musicLabel) {
            this.musicLabel.destroy();
        }
        
        super.destroy();
    }
}