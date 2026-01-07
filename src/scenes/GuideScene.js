// Phaser 从全局对象获取
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 功法界面 - 数学知识攻略和学习指南
 * 优化版本：更美观的UI、更好的交互体验、更丰富的内容
 */
export class GuideScene extends Scene {
    constructor() {
        super({ key: 'GuideScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建动态渐变背景
        this.createDynamicBackground();
        
        // 创建粒子效果
        this.createParticleEffects();
        
        // 创建顶部标题栏
        this.createTitleBar();
        
        // 创建侧边栏导航
        this.createSidebar();
        
        // 创建主内容区域
        this.createMainContent();
        
        // 创建底部工具栏
        this.createBottomToolbar();
        
        // 初始化数据
        this.initializeGuideData();
        
        // 设置键盘控制
        this.setupKeyboardControls();
        
        Logger.info('GuideScene 创建完成');
    }
    
    createDynamicBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建渐变背景
        const graphics = this.add.graphics();
        
        // 绘制多层渐变
        const colors = [
            { color: 0x0f0f23, alpha: 1.0 },
            { color: 0x1a1a2e, alpha: 0.9 },
            { color: 0x16213e, alpha: 0.8 },
            { color: 0x0f3460, alpha: 0.7 }
        ];
        
        colors.forEach((colorData, index) => {
            const y = (height / colors.length) * index;
            const nextY = (height / colors.length) * (index + 1);
            
            for (let i = 0; i <= 20; i++) {
                const ratio = i / 20;
                const currentY = y + (nextY - y) * ratio;
                const alpha = colorData.alpha * (1 - ratio * 0.2);
                
                graphics.fillStyle(colorData.color, alpha);
                graphics.fillRect(0, currentY, width, (nextY - y) / 20 + 1);
            }
        });
        
        graphics.setDepth(0);
    }
    
    createParticleEffects() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建知识粒子效果
        this.knowledgeParticles = [];
        
        for (let i = 0; i < 15; i++) {
            const symbols = ['∑', '∫', 'π', '∞', '√', '∆', 'Ω', 'α', 'β', 'γ', '∂', '∇'];
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            
            const particle = this.add.text(
                Math.random() * width,
                Math.random() * height,
                symbol,
                {
                    fontSize: `${12 + Math.random() * 8}px`,
                    fill: '#4a90e2',
                    alpha: 0.3 + Math.random() * 0.4
                }
            );
            
            // 添加漂浮动画
            this.tweens.add({
                targets: particle,
                y: particle.y - 50 - Math.random() * 100,
                x: particle.x + (Math.random() - 0.5) * 100,
                alpha: 0,
                duration: 8000 + Math.random() * 4000,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    particle.y = height + 20;
                    particle.x = Math.random() * width;
                    particle.alpha = 0.3 + Math.random() * 0.4;
                    this.createFloatingAnimation(particle);
                }
            });
            
            this.knowledgeParticles.push(particle);
        }
    }
    
    createFloatingAnimation(particle) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.tweens.add({
            targets: particle,
            y: particle.y - 50 - Math.random() * 100,
            x: particle.x + (Math.random() - 0.5) * 100,
            alpha: 0,
            duration: 8000 + Math.random() * 4000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                if (particle.active) {
                    particle.y = height + 20;
                    particle.x = Math.random() * width;
                    particle.alpha = 0.3 + Math.random() * 0.4;
                    this.createFloatingAnimation(particle);
                }
            }
        });
    }
    
    createTitleBar() {
        const width = this.cameras.main.width;
        
        // 标题栏背景
        const titleBg = this.add.rectangle(width / 2, 40, width, 80, 0x1a1a2e, 0.95);
        titleBg.setStrokeStyle(2, 0x4a90e2, 0.8);
        titleBg.setDepth(10);
        
        // 主标题
        this.titleText = this.add.text(width / 2, 25, '📚 数学功法秘籍', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold',
            stroke: '#4a90e2',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4
            }
        }).setOrigin(0.5).setDepth(11);
        
        // 副标题
        this.subtitleText = this.add.text(width / 2, 55, '掌握数学奥义，提升修为境界', {
            fontSize: '16px',
            fill: '#B8E986',
            fontFamily: 'Microsoft YaHei, Arial',
            alpha: 0.9
        }).setOrigin(0.5).setDepth(11);
        
        // 关闭按钮
        this.closeButton = this.add.text(width - 50, 40, '✕', {
            fontSize: '24px',
            fill: '#ff6b6b',
            fontFamily: 'Arial',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });
        
        this.closeButton.on('pointerover', () => {
            this.closeButton.setScale(1.2);
            this.closeButton.setTint(0xffffff);
        });
        
        this.closeButton.on('pointerout', () => {
            this.closeButton.setScale(1.0);
            this.closeButton.clearTint();
        });
        
        this.closeButton.on('pointerdown', () => {
            this.exitScene();
        });
    }
    
    createSidebar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 侧边栏背景
        this.sidebarBg = this.add.rectangle(120, height / 2, 240, height - 100, 0x16213e, 0.95);
        this.sidebarBg.setStrokeStyle(2, 0x4a90e2, 0.6);
        this.sidebarBg.setDepth(10);
        
        // 侧边栏标题
        this.add.text(120, 110, '📖 知识分类', {
            fontSize: '20px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // 创建分类按钮容器
        this.categoryContainer = this.add.container(0, 0);
        this.categoryContainer.setDepth(11);
        
        this.categoryButtons = [];
        this.selectedCategory = 0;
    }
    
    createMainContent() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 主内容区背景
        this.contentBg = this.add.rectangle(width / 2 + 60, height / 2, width - 300, height - 100, 0x1a1a2e, 0.9);
        this.contentBg.setStrokeStyle(2, 0x667eea, 0.8);
        this.contentBg.setDepth(10);
        
        // 内容容器
        this.contentContainer = this.add.container(0, 0);
        this.contentContainer.setDepth(11);
        
        this.selectedTopic = 0;
    }
    
    createBottomToolbar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 工具栏背景
        const toolbarBg = this.add.rectangle(width / 2, height - 30, width, 60, 0x0f0f23, 0.9);
        toolbarBg.setStrokeStyle(1, 0x4a90e2, 0.5);
        toolbarBg.setDepth(10);
        
        // 导航提示
        this.add.text(width / 2, height - 30, '💡 使用方向键或鼠标浏览 • ESC返回 • 空格键收藏', {
            fontSize: '14px',
            fill: '#888888',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5).setDepth(11);
    }
    
    initializeGuideData() {
        // 优化的攻略数据结构
        this.guides = [
            {
                category: '基础运算',
                icon: '🔢',
                color: 0x4a90e2,
                description: '数学运算的基础功法',
                topics: [
                    {
                        name: '加法心法',
                        level: '入门',
                        icon: '➕',
                        explanation: '加法是数学修炼的第一步，掌握数的合并之道。',
                        formula: 'a + b = c',
                        principle: '加法遵循交换律和结合律，是数学运算的基石。通过理解数量的累积，可以掌握更高深的运算法则。',
                        example: {
                            problem: '计算：25 + 37',
                            solution: '方法一（竖式）：\n  25\n+ 37\n----\n  62\n\n方法二（分解）：\n25 + 37 = 25 + 30 + 7 = 55 + 7 = 62\n\n方法三（凑整）：\n25 + 37 = 25 + 35 + 2 = 60 + 2 = 62',
                            explanation: '多种方法殊途同归，选择最适合的方法能提高计算效率。'
                        },
                        tips: [
                            '💡 凑整法：将接近整十的数先凑成整十',
                            '🎯 分解法：将复杂数分解为简单数相加',
                            '⚡ 竖式法：适合多位数精确计算',
                            '🔄 验算法：用减法验证加法结果'
                        ],
                        advanced: '进阶修炼：掌握多位数加法、小数加法、分数加法',
                        exercises: [
                            { question: '123 + 456 = ?', answer: '579' },
                            { question: '2.5 + 3.7 = ?', answer: '6.2' },
                            { question: '1/3 + 1/6 = ?', answer: '1/2' }
                        ]
                    },
                    {
                        name: '减法心法',
                        level: '入门',
                        icon: '➖',
                        explanation: '减法是加法的逆运算，掌握数的分离之道。',
                        formula: 'a - b = c (其中 a ≥ b)',
                        principle: '减法是求差的运算，理解"还剩多少"的概念是关键。借位和退位是减法的核心技巧。',
                        example: {
                            problem: '计算：82 - 35',
                            solution: '方法一（竖式借位）：\n  82\n- 35\n----\n  47\n\n方法二（分步减）：\n82 - 35 = 82 - 30 - 5 = 52 - 5 = 47\n\n方法三（加法验算）：\n47 + 35 = 82 ✓',
                            explanation: '借位是减法的关键技巧，理解"借一当十"的原理。'
                        },
                        tips: [
                            '📝 借位法：不够减时向前一位借1当10',
                            '🔢 分步减：先减整十，再减个位',
                            '✅ 加法验算：用加法检验减法结果',
                            '🎯 补数法：利用补数简化计算'
                        ],
                        advanced: '进阶修炼：多位数减法、小数减法、负数概念',
                        exercises: [
                            { question: '1000 - 234 = ?', answer: '766' },
                            { question: '5.6 - 2.8 = ?', answer: '2.8' },
                            { question: '3/4 - 1/4 = ?', answer: '1/2' }
                        ]
                    },
                    {
                        name: '乘法心法',
                        level: '进阶',
                        icon: '✖️',
                        explanation: '乘法是连加的简化，掌握数的倍增之道。',
                        formula: 'a × b = c',
                        principle: '乘法表示相同数的重复相加，是面积和体积计算的基础。掌握乘法口诀是修炼的第一步。',
                        example: {
                            problem: '计算：23 × 45',
                            solution: '方法一（竖式）：\n   23\n×  45\n-----\n  115  (23×5)\n 920   (23×40)\n-----\n1035\n\n方法二（分解）：\n23 × 45 = 23 × (40 + 5) = 23×40 + 23×5 = 920 + 115 = 1035',
                            explanation: '分配律是乘法计算的重要工具，可以简化复杂运算。'
                        },
                        tips: [
                            '📊 九九表：熟记乘法口诀是基础',
                            '🔄 交换律：a×b = b×a，选择简单的顺序',
                            '📐 分配律：a×(b+c) = a×b + a×c',
                            '⚡ 特殊数：与10、100、1000相乘的规律'
                        ],
                        advanced: '进阶修炼：多位数乘法、小数乘法、分数乘法',
                        exercises: [
                            { question: '125 × 8 = ?', answer: '1000' },
                            { question: '2.5 × 4 = ?', answer: '10' },
                            { question: '2/3 × 3/4 = ?', answer: '1/2' }
                        ]
                    },
                    {
                        name: '除法心法',
                        level: '进阶',
                        icon: '➗',
                        explanation: '除法是乘法的逆运算，掌握数的均分之道。',
                        formula: 'a ÷ b = c (其中 a = b × c)',
                        principle: '除法表示平均分配或包含关系。理解"每份多少"和"能分几份"是除法的两个基本含义。',
                        example: {
                            problem: '计算：756 ÷ 18',
                            solution: '长除法：\n    42\n   ----\n18)756\n   72↓\n   ---\n    36\n    36\n    ---\n     0\n\n验算：42 × 18 = 756 ✓',
                            explanation: '长除法是处理大数除法的标准方法，每一步都要验证。'
                        },
                        tips: [
                            '📏 长除法：标准的除法计算方法',
                            '🔍 估算法：先估算商的大致范围',
                            '✖️ 乘法验算：商×除数=被除数',
                            '📊 余数处理：理解余数的意义'
                        ],
                        advanced: '进阶修炼：小数除法、分数除法、余数应用',
                        exercises: [
                            { question: '144 ÷ 12 = ?', answer: '12' },
                            { question: '7.2 ÷ 2.4 = ?', answer: '3' },
                            { question: '3/4 ÷ 1/2 = ?', answer: '3/2' }
                        ]
                    }
                ]
            },
            {
                category: '代数奥义',
                icon: '📐',
                color: 0x50e3c2,
                description: '字母与数字的和谐统一',
                topics: [
                    {
                        name: '方程求解',
                        level: '高级',
                        icon: '⚖️',
                        explanation: '方程是数学的核心，掌握未知数的求解之道。',
                        formula: 'ax + b = c',
                        principle: '方程表示等量关系，通过等式的性质来求解未知数。移项和化简是基本技巧。',
                        example: {
                            problem: '解方程：3x + 5 = 14',
                            solution: '步骤一：移项\n3x = 14 - 5\n3x = 9\n\n步骤二：系数化1\nx = 9 ÷ 3\nx = 3\n\n验算：3×3 + 5 = 9 + 5 = 14 ✓',
                            explanation: '移项时要变号，系数化1时两边同时除以系数。'
                        },
                        tips: [
                            '⚖️ 等式性质：两边同时加减乘除相同数',
                            '🔄 移项变号：加变减，减变加',
                            '1️⃣ 系数化1：两边同除以未知数系数',
                            '✅ 验算检查：将解代入原方程验证'
                        ],
                        advanced: '进阶修炼：二元一次方程组、二次方程',
                        exercises: [
                            { question: '2x - 7 = 3', answer: 'x = 5' },
                            { question: '5x + 2 = 3x + 8', answer: 'x = 3' },
                            { question: 'x/2 + 3 = 7', answer: 'x = 8' }
                        ]
                    }
                ]
            },
            {
                category: '几何秘法',
                icon: '🔺',
                color: 0xf5a623,
                description: '形状与空间的奥秘',
                topics: [
                    {
                        name: '面积计算',
                        level: '中级',
                        icon: '📏',
                        explanation: '掌握各种图形面积的计算方法。',
                        formula: '不同图形有不同公式',
                        principle: '面积表示平面图形所占空间的大小，理解基本图形的面积公式是关键。',
                        example: {
                            problem: '计算复合图形面积',
                            solution: '将复合图形分解为基本图形：\n- 矩形：长×宽\n- 三角形：底×高÷2\n- 圆形：π×半径²\n- 梯形：(上底+下底)×高÷2',
                            explanation: '复杂图形可以分解为简单图形的组合。'
                        },
                        tips: [
                            '📐 基本公式：熟记各图形面积公式',
                            '✂️ 分解组合：复杂图形分解为简单图形',
                            '📊 单位统一：注意面积单位的换算',
                            '🔍 实际应用：联系生活中的面积问题'
                        ],
                        advanced: '进阶修炼：立体图形表面积、不规则图形面积',
                        exercises: [
                            { question: '正方形边长5cm，面积=?', answer: '25cm²' },
                            { question: '圆半径3cm，面积≈?', answer: '28.26cm²' },
                            { question: '三角形底6cm高4cm，面积=?', answer: '12cm²' }
                        ]
                    }
                ]
            },
            {
                category: '函数神通',
                icon: '📊',
                color: 0x9013fe,
                description: '变量关系的深层规律',
                topics: [
                    {
                        name: '函数概念',
                        level: '高级',
                        icon: '📈',
                        explanation: '函数描述变量之间的对应关系。',
                        formula: 'y = f(x)',
                        principle: '函数是数学的重要概念，描述一个变量如何依赖于另一个变量。',
                        example: {
                            problem: '理解函数 f(x) = 2x + 1',
                            solution: '当x=1时，f(1) = 2×1 + 1 = 3\n当x=2时，f(2) = 2×2 + 1 = 5\n当x=3时，f(3) = 2×3 + 1 = 7\n\n规律：x每增加1，y增加2',
                            explanation: '函数表示输入和输出的对应关系。'
                        },
                        tips: [
                            '📝 定义域：函数有意义的x值范围',
                            '📊 值域：函数可能取到的y值范围',
                            '📈 图像：函数的可视化表示',
                            '🔄 性质：单调性、奇偶性等'
                        ],
                        advanced: '进阶修炼：二次函数、指数函数、三角函数',
                        exercises: [
                            { question: 'f(x)=x²，f(3)=?', answer: '9' },
                            { question: 'f(x)=2x-1，f(5)=?', answer: '9' },
                            { question: 'f(x)=x+3，f(-2)=?', answer: '1' }
                        ]
                    }
                ]
            }
        ];
        
        // 创建分类按钮
        this.createCategoryButtons();
        
        // 显示初始内容
        this.updateDisplay();
    }
    
    createCategoryButtons() {
        const startY = 150;
        const buttonHeight = 60;
        const buttonSpacing = 10;
        
        this.guides.forEach((guide, index) => {
            const y = startY + index * (buttonHeight + buttonSpacing);
            
            // 按钮背景
            const buttonBg = this.add.rectangle(120, y, 200, buttonHeight, guide.color, 0.2);
            buttonBg.setStrokeStyle(2, guide.color, 0.8);
            buttonBg.setInteractive({ useHandCursor: true });
            buttonBg.setDepth(11);
            
            // 图标
            const icon = this.add.text(60, y, guide.icon, {
                fontSize: '24px'
            }).setOrigin(0.5).setDepth(12);
            
            // 分类名称
            const name = this.add.text(120, y - 8, guide.category, {
                fontSize: '16px',
                fill: '#FFFFFF',
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5).setDepth(12);
            
            // 描述
            const desc = this.add.text(120, y + 12, guide.description, {
                fontSize: '12px',
                fill: '#CCCCCC',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5).setDepth(12);
            
            // 交互效果
            buttonBg.on('pointerover', () => {
                if (this.selectedCategory !== index) {
                    buttonBg.setFillStyle(guide.color, 0.4);
                    buttonBg.setStrokeStyle(2, guide.color, 1.0);
                }
            });
            
            buttonBg.on('pointerout', () => {
                if (this.selectedCategory !== index) {
                    buttonBg.setFillStyle(guide.color, 0.2);
                    buttonBg.setStrokeStyle(2, guide.color, 0.8);
                }
            });
            
            buttonBg.on('pointerdown', () => {
                this.selectCategory(index);
            });
            
            this.categoryButtons.push({
                bg: buttonBg,
                icon: icon,
                name: name,
                desc: desc,
                guide: guide
            });
        });
    }
    
    selectCategory(index) {
        // 更新选中状态
        this.categoryButtons.forEach((button, i) => {
            if (i === index) {
                button.bg.setFillStyle(button.guide.color, 0.6);
                button.bg.setStrokeStyle(3, button.guide.color, 1.0);
                button.name.setFill('#FFD700');
            } else {
                button.bg.setFillStyle(button.guide.color, 0.2);
                button.bg.setStrokeStyle(2, button.guide.color, 0.8);
                button.name.setFill('#FFFFFF');
            }
        });
        
        this.selectedCategory = index;
        this.selectedTopic = 0;
        this.updateDisplay();
    }
    
    updateDisplay() {
        // 清除旧内容
        this.contentContainer.removeAll(true);
        
        const currentGuide = this.guides[this.selectedCategory];
        const currentTopic = currentGuide.topics[this.selectedTopic];
        
        if (!currentTopic) return;
        
        const width = this.cameras.main.width;
        const contentX = width / 2 + 60;
        const contentY = 120;
        const contentWidth = width - 320;
        
        // 主题选择标签（如果有多个主题）
        if (currentGuide.topics.length > 1) {
            this.createTopicTabs(currentGuide, contentX, contentY - 40, contentWidth);
        }
        
        // 主题标题
        const titleContainer = this.add.container(contentX, contentY + 20);
        titleContainer.setDepth(11);
        
        const titleBg = this.add.rectangle(0, 0, contentWidth - 40, 60, currentGuide.color, 0.3);
        titleBg.setStrokeStyle(2, currentGuide.color, 0.8);
        
        const titleIcon = this.add.text(-contentWidth/2 + 40, 0, currentTopic.icon, {
            fontSize: '32px'
        }).setOrigin(0.5);
        
        const titleText = this.add.text(-contentWidth/2 + 100, -8, currentTopic.name, {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        const levelBadge = this.add.text(contentWidth/2 - 40, 0, currentTopic.level, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            backgroundColor: currentGuide.color,
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        
        titleContainer.add([titleBg, titleIcon, titleText, levelBadge]);
        this.contentContainer.add(titleContainer);
        
        // 内容区域
        this.createTopicContent(currentTopic, currentGuide, contentX, contentY + 80, contentWidth);
    }
    
    createTopicTabs(guide, x, y, width) {
        const tabWidth = Math.min(120, (width - 40) / guide.topics.length);
        const startX = x - (guide.topics.length * tabWidth) / 2;
        
        guide.topics.forEach((topic, index) => {
            const tabX = startX + index * tabWidth + tabWidth / 2;
            
            const tabBg = this.add.rectangle(tabX, y, tabWidth - 5, 30, 
                index === this.selectedTopic ? guide.color : 0x333333, 
                index === this.selectedTopic ? 0.8 : 0.5);
            tabBg.setStrokeStyle(1, guide.color, 0.8);
            tabBg.setInteractive({ useHandCursor: true });
            tabBg.setDepth(11);
            
            const tabText = this.add.text(tabX, y, topic.name, {
                fontSize: '12px',
                fill: index === this.selectedTopic ? '#FFFFFF' : '#CCCCCC',
                fontFamily: 'Microsoft YaHei, Arial'
            }).setOrigin(0.5).setDepth(12);
            
            tabBg.on('pointerdown', () => {
                this.selectedTopic = index;
                this.updateDisplay();
            });
            
            this.contentContainer.add([tabBg, tabText]);
        });
    }
    
    createTopicContent(topic, guide, x, y, width) {
        let currentY = y;
        const lineHeight = 25;
        const sectionSpacing = 30;
        
        // 原理说明
        const principleTitle = this.add.text(x - width/2 + 20, currentY, '📖 核心原理', {
            fontSize: '18px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setDepth(11);
        
        currentY += lineHeight;
        
        const principleText = this.add.text(x - width/2 + 20, currentY, topic.principle, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial',
            wordWrap: { width: width - 40 }
        }).setDepth(11);
        
        currentY += principleText.height + sectionSpacing;
        
        // 公式展示
        const formulaTitle = this.add.text(x - width/2 + 20, currentY, '🔢 核心公式', {
            fontSize: '18px',
            fill: '#F5A623',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setDepth(11);
        
        currentY += lineHeight;
        
        const formulaBg = this.add.rectangle(x, currentY + 15, width - 40, 40, 0x2a2a2a, 0.8);
        formulaBg.setStrokeStyle(2, guide.color, 0.6);
        formulaBg.setDepth(10);
        
        const formulaText = this.add.text(x, currentY + 15, topic.formula, {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        currentY += 50 + sectionSpacing;
        
        // 示例解析
        if (topic.example) {
            const exampleTitle = this.add.text(x - width/2 + 20, currentY, '💡 示例解析', {
                fontSize: '18px',
                fill: '#9013FE',
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setDepth(11);
            
            currentY += lineHeight;
            
            const exampleBg = this.add.rectangle(x, currentY + 40, width - 40, 100, 0x1a1a2e, 0.9);
            exampleBg.setStrokeStyle(2, 0x9013FE, 0.6);
            exampleBg.setDepth(10);
            
            const problemText = this.add.text(x - width/2 + 30, currentY + 10, `题目：${topic.example.problem}`, {
                fontSize: '14px',
                fill: '#FFD700',
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setDepth(11);
            
            const solutionText = this.add.text(x - width/2 + 30, currentY + 35, topic.example.solution, {
                fontSize: '12px',
                fill: '#FFFFFF',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: width - 80 }
            }).setDepth(11);
            
            currentY += 110 + sectionSpacing;
        }
        
        // 技巧提示
        if (topic.tips && topic.tips.length > 0) {
            const tipsTitle = this.add.text(x - width/2 + 20, currentY, '⚡ 修炼技巧', {
                fontSize: '18px',
                fill: '#B8E986',
                fontFamily: 'Microsoft YaHei, Arial',
                fontWeight: 'bold'
            }).setDepth(11);
            
            currentY += lineHeight;
            
            topic.tips.forEach((tip, index) => {
                const tipText = this.add.text(x - width/2 + 30, currentY, tip, {
                    fontSize: '13px',
                    fill: '#E8E8E8',
                    fontFamily: 'Microsoft YaHei, Arial',
                    wordWrap: { width: width - 60 }
                }).setDepth(11);
                
                currentY += tipText.height + 8;
            });
        }
        
        this.contentContainer.add([
            principleTitle, principleText, formulaTitle, formulaBg, formulaText
        ]);
        
        if (topic.example) {
            this.contentContainer.add([
                this.add.text(x - width/2 + 20, y + 200, '💡 示例解析', {
                    fontSize: '18px',
                    fill: '#9013FE',
                    fontFamily: 'Microsoft YaHei, Arial',
                    fontWeight: 'bold'
                }).setDepth(11)
            ]);
        }
    }
    
    setupKeyboardControls() {
        // ESC 键关闭
        this.input.keyboard.on('keydown-ESC', () => {
            this.exitScene();
        });
        
        // 方向键导航
        this.input.keyboard.on('keydown-UP', () => {
            if (this.selectedCategory > 0) {
                this.selectCategory(this.selectedCategory - 1);
            }
        });
        
        this.input.keyboard.on('keydown-DOWN', () => {
            if (this.selectedCategory < this.guides.length - 1) {
                this.selectCategory(this.selectedCategory + 1);
            }
        });
        
        this.input.keyboard.on('keydown-LEFT', () => {
            const currentGuide = this.guides[this.selectedCategory];
            if (this.selectedTopic > 0) {
                this.selectedTopic--;
                this.updateDisplay();
            }
        });
        
        this.input.keyboard.on('keydown-RIGHT', () => {
            const currentGuide = this.guides[this.selectedCategory];
            if (this.selectedTopic < currentGuide.topics.length - 1) {
                this.selectedTopic++;
                this.updateDisplay();
            }
        });
    }
    
    exitScene() {
        // 添加退出动画
        this.tweens.add({
            targets: [this.titleText, this.subtitleText],
            alpha: 0,
            y: '-=50',
            duration: 300,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: [this.sidebarBg, this.contentBg],
            scaleX: 0,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.scene.stop();
            }
        });
    }
}