/**
 * 攻略场景 - 使用BaseScene重构
 */
import { BaseScene } from '../core/BaseScene.js';
import * as Layout from '../core/LayoutConfig.js';

export class GuideScene extends BaseScene {
    constructor() {
        super({ key: 'GuideScene' });
        this.isModal = true;
        this.selectedCategory = 0;
        this.selectedTopic = 0;
        this.contentElements = [];
    }
    
    create() {
        this.preCreate();
        
        // 布局参数
        this.layout = {
            sidebarWidth: 220,
            sidebarX: 130,
            contentX: this.width / 2 + 80,
            contentWidth: this.width - 300,
            headerY: 45,
            categoryStartY: 130,
            categoryHeight: 55,
            categoryGap: 8,
            contentStartY: 120
        };
        
        // 初始化数据
        this.initGuideData();
        
        // 创建UI
        this.createBackground();
        this.createHeader();
        this.createSidebar();
        this.createContentArea();
        this.createFooter();
        
        // 显示初始内容
        this.renderContent();
    }
    
    createBackground() {
        // 完全遮挡底层的背景
        this.createModalBackground(0.95);
        
        // 主面板
        this.createPanel(this.centerX, this.centerY, this.width - 40, this.height - 40, {
            borderColor: 0x4a90e2
        });
    }
    
    createHeader() {
        this.createTitle('📚 数学功法秘籍', this.layout.headerY);
        this.createSubtitle('掌握数学奥义，提升修为境界', this.layout.headerY + 35);
        
        // 关闭按钮
        const closeBtn = this.add.text(this.width - 50, 40, '✕', {
            fontSize: '28px',
            fill: '#ff6b6b',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.setDepth(Layout.DEPTH.MODAL_CONTENT + 10);
        closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
        closeBtn.on('pointerout', () => closeBtn.setScale(1.0));
        closeBtn.on('pointerdown', () => this.closeScene());
        this.addUI(closeBtn);
    }
    
    createSidebar() {
        // 侧边栏背景
        const sidebarBg = this.add.rectangle(
            this.layout.sidebarX, this.centerY + 20,
            this.layout.sidebarWidth, this.height - 160,
            0x16213e, 0.9
        );
        sidebarBg.setStrokeStyle(2, 0x4a90e2);
        sidebarBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        this.addUI(sidebarBg);
        
        // 分类标题
        const catTitle = this.add.text(this.layout.sidebarX, 105, '📖 知识分类', {
            fontSize: '16px',
            fill: '#50e3c2',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        catTitle.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.addUI(catTitle);
        
        // 创建分类按钮
        this.categoryButtons = [];
        this.guides.forEach((guide, index) => {
            const y = this.layout.categoryStartY + index * (this.layout.categoryHeight + this.layout.categoryGap);
            this.createCategoryButton(guide, index, y);
        });
    }
    
    createCategoryButton(guide, index, y) {
        const isSelected = index === this.selectedCategory;
        const btnWidth = this.layout.sidebarWidth - 20;
        
        // 按钮背景
        const btnBg = this.add.rectangle(this.layout.sidebarX, y, btnWidth, this.layout.categoryHeight, 
            isSelected ? guide.color : 0x1a1a2e, isSelected ? 0.6 : 0.4);
        btnBg.setStrokeStyle(2, guide.color);
        btnBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        btnBg.setInteractive({ useHandCursor: true });
        this.addUI(btnBg);
        
        // 图标
        const icon = this.add.text(this.layout.sidebarX - btnWidth/2 + 25, y, guide.icon, {
            fontSize: '20px'
        }).setOrigin(0.5);
        icon.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(icon);
        
        // 名称
        const name = this.add.text(this.layout.sidebarX + 10, y - 8, guide.category, {
            fontSize: '14px',
            fill: isSelected ? '#FFD700' : '#fff',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        name.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(name);
        
        // 描述
        const desc = this.add.text(this.layout.sidebarX + 10, y + 12, guide.description, {
            fontSize: '11px',
            fill: '#888',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        desc.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.addUI(desc);
        
        // 交互
        btnBg.on('pointerover', () => {
            if (index !== this.selectedCategory) {
                btnBg.setFillStyle(guide.color, 0.3);
            }
        });
        btnBg.on('pointerout', () => {
            if (index !== this.selectedCategory) {
                btnBg.setFillStyle(0x1a1a2e, 0.4);
            }
        });
        btnBg.on('pointerdown', () => {
            this.selectedCategory = index;
            this.selectedTopic = 0;
            this.scene.restart();
        });
        
        this.categoryButtons.push({ bg: btnBg, name, guide });
    }
    
    createContentArea() {
        // 内容区背景
        const contentBg = this.add.rectangle(
            this.layout.contentX, this.centerY + 20,
            this.layout.contentWidth, this.height - 160,
            0x1a1a2e, 0.85
        );
        contentBg.setStrokeStyle(2, 0x667eea);
        contentBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 1);
        this.addUI(contentBg);
    }
    
    createFooter() {
        const footerY = this.height - 35;
        const hint = this.add.text(this.centerX, footerY, '💡 使用方向键或鼠标浏览 • ESC返回 • 空格键收藏', {
            fontSize: '13px',
            fill: '#666',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0.5);
        hint.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.addUI(hint);
        
        // ESC关闭
        this.input.keyboard.on('keydown-ESC', () => this.closeScene());
    }

    
    renderContent() {
        // 清除旧内容
        this.contentElements.forEach(el => el.destroy());
        this.contentElements = [];
        
        const guide = this.guides[this.selectedCategory];
        const topic = guide.topics[this.selectedTopic];
        if (!topic) return;
        
        const x = this.layout.contentX;
        const startY = this.layout.contentStartY;
        const w = this.layout.contentWidth - 40;
        let y = startY;
        
        // 主题标签（如果有多个）
        if (guide.topics.length > 1) {
            y = this.renderTopicTabs(guide, x, y, w);
        }
        
        // 主题标题
        y = this.renderTopicTitle(topic, guide, x, y, w);
        
        // 核心原理
        y = this.renderSection('📖 核心原理', topic.principle, x, y, w, '#50e3c2');
        
        // 核心公式
        y = this.renderFormula(topic.formula, guide.color, x, y, w);
        
        // 示例解析
        if (topic.example) {
            y = this.renderExample(topic.example, x, y, w);
        }
        
        // 修炼技巧
        if (topic.tips && topic.tips.length > 0) {
            y = this.renderTips(topic.tips, x, y, w);
        }
    }
    
    renderTopicTabs(guide, x, y, w) {
        const tabWidth = Math.min(100, (w - 20) / guide.topics.length);
        const startX = x - (guide.topics.length * tabWidth) / 2;
        
        guide.topics.forEach((topic, index) => {
            const tabX = startX + index * tabWidth + tabWidth / 2;
            const isSelected = index === this.selectedTopic;
            
            const tabBg = this.add.rectangle(tabX, y, tabWidth - 4, 28,
                isSelected ? guide.color : 0x333344, isSelected ? 0.8 : 0.5);
            tabBg.setStrokeStyle(1, guide.color);
            tabBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
            tabBg.setInteractive({ useHandCursor: true });
            this.contentElements.push(tabBg);
            
            const tabText = this.add.text(tabX, y, topic.name, {
                fontSize: '12px',
                fill: isSelected ? '#fff' : '#aaa',
                fontFamily: Layout.FONTS.FAMILY
            }).setOrigin(0.5);
            tabText.setDepth(Layout.DEPTH.MODAL_CONTENT + 4);
            this.contentElements.push(tabText);
            
            tabBg.on('pointerdown', () => {
                this.selectedTopic = index;
                this.renderContent();
            });
        });
        
        return y + 40;
    }
    
    renderTopicTitle(topic, guide, x, y, w) {
        const titleBg = this.add.rectangle(x, y + 25, w, 50, guide.color, 0.25);
        titleBg.setStrokeStyle(2, guide.color);
        titleBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.contentElements.push(titleBg);
        
        const icon = this.add.text(x - w/2 + 35, y + 25, topic.icon, { fontSize: '28px' }).setOrigin(0.5);
        icon.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(icon);
        
        const title = this.add.text(x - w/2 + 80, y + 25, topic.name, {
            fontSize: '22px',
            fill: '#FFD700',
            fontFamily: Layout.FONTS.FAMILY
        }).setOrigin(0, 0.5);
        title.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(title);
        
        const level = this.add.text(x + w/2 - 40, y + 25, topic.level, {
            fontSize: '12px',
            fill: '#fff',
            fontFamily: Layout.FONTS.FAMILY,
            backgroundColor: `#${guide.color.toString(16).padStart(6, '0')}`,
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        level.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(level);
        
        return y + 70;
    }
    
    renderSection(title, content, x, y, w, color) {
        const sectionTitle = this.add.text(x - w/2, y, title, {
            fontSize: '16px',
            fill: color,
            fontFamily: Layout.FONTS.FAMILY
        });
        sectionTitle.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(sectionTitle);
        
        const sectionText = this.add.text(x - w/2, y + 25, content, {
            fontSize: '13px',
            fill: '#ddd',
            fontFamily: Layout.FONTS.FAMILY,
            wordWrap: { width: w }
        });
        sectionText.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(sectionText);
        
        return y + 25 + sectionText.height + 20;
    }
    
    renderFormula(formula, color, x, y, w) {
        const title = this.add.text(x - w/2, y, '🔢 核心公式', {
            fontSize: '16px',
            fill: '#f5a623',
            fontFamily: Layout.FONTS.FAMILY
        });
        title.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(title);
        
        const formulaBg = this.add.rectangle(x, y + 45, w, 36, 0x2a2a2a, 0.9);
        formulaBg.setStrokeStyle(1, color);
        formulaBg.setDepth(Layout.DEPTH.MODAL_CONTENT + 2);
        this.contentElements.push(formulaBg);
        
        const formulaText = this.add.text(x, y + 45, formula, {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        formulaText.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(formulaText);
        
        return y + 85;
    }
    
    renderExample(example, x, y, w) {
        const title = this.add.text(x - w/2, y, '💡 示例解析', {
            fontSize: '16px',
            fill: '#9013fe',
            fontFamily: Layout.FONTS.FAMILY
        });
        title.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(title);
        
        const problem = this.add.text(x - w/2, y + 25, `题目：${example.problem}`, {
            fontSize: '14px',
            fill: '#FFD700',
            fontFamily: Layout.FONTS.FAMILY
        });
        problem.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(problem);
        
        // 解答（限制高度）
        const solutionLines = example.solution.split('\n').slice(0, 8).join('\n');
        const solution = this.add.text(x - w/2, y + 50, solutionLines, {
            fontSize: '12px',
            fill: '#ccc',
            fontFamily: 'Courier New, monospace',
            wordWrap: { width: w }
        });
        solution.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(solution);
        
        return y + 50 + Math.min(solution.height, 120) + 20;
    }
    
    renderTips(tips, x, y, w) {
        const title = this.add.text(x - w/2, y, '⚡ 修炼技巧', {
            fontSize: '16px',
            fill: '#b8e986',
            fontFamily: Layout.FONTS.FAMILY
        });
        title.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
        this.contentElements.push(title);
        
        let tipY = y + 25;
        tips.slice(0, 4).forEach(tip => {
            const tipText = this.add.text(x - w/2, tipY, tip, {
                fontSize: '12px',
                fill: '#ccc',
                fontFamily: Layout.FONTS.FAMILY,
                wordWrap: { width: w }
            });
            tipText.setDepth(Layout.DEPTH.MODAL_CONTENT + 3);
            this.contentElements.push(tipText);
            tipY += tipText.height + 6;
        });
        
        return tipY + 10;
    }
    
    initGuideData() {
        this.guides = [
            {
                category: '基础运算',
                icon: '🔢',
                color: 0x4a90e2,
                description: '数学运算的基础功法',
                topics: [
                    {
                        name: '加法心法', level: '入门', icon: '➕',
                        principle: '加法遵循交换律和结合律，是数学运算的基石。',
                        formula: 'a + b = c',
                        example: { problem: '计算：25 + 37', solution: '方法一（竖式）：\n  25\n+ 37\n----\n  62' },
                        tips: ['💡 凑整法：将接近整十的数先凑成整十', '🎯 分解法：将复杂数分解为简单数相加']
                    },
                    {
                        name: '减法心法', level: '入门', icon: '➖',
                        principle: '减法是加法的逆运算，掌握借位是关键。',
                        formula: 'a - b = c',
                        example: { problem: '计算：82 - 35', solution: '方法一（竖式借位）：\n  82\n- 35\n----\n  47' },
                        tips: ['📝 借位法：不够减时向前一位借1当10', '✅ 加法验算：用加法检验减法结果']
                    },
                    {
                        name: '乘法心法', level: '进阶', icon: '✖️',
                        principle: '乘法是连加的简化，掌握乘法口诀是基础。',
                        formula: 'a × b = c',
                        example: { problem: '计算：23 × 5', solution: '23 × 5 = 20×5 + 3×5 = 100 + 15 = 115' },
                        tips: ['📊 九九表：熟记乘法口诀', '🔄 交换律：a×b = b×a']
                    },
                    {
                        name: '除法心法', level: '进阶', icon: '➗',
                        principle: '除法是乘法的逆运算，表示平均分配。',
                        formula: 'a ÷ b = c',
                        example: { problem: '计算：84 ÷ 7', solution: '84 ÷ 7 = 12\n验算：12 × 7 = 84 ✓' },
                        tips: ['📏 长除法：标准的除法计算方法', '✖️ 乘法验算：商×除数=被除数']
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
                        name: '方程求解', level: '高级', icon: '⚖️',
                        principle: '方程表示等量关系，通过等式性质求解未知数。',
                        formula: 'ax + b = c → x = (c-b)/a',
                        example: { problem: '解方程：3x + 5 = 14', solution: '3x = 14 - 5\n3x = 9\nx = 3' },
                        tips: ['⚖️ 等式性质：两边同时加减乘除相同数', '🔄 移项变号：加变减，减变加']
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
                        name: '面积计算', level: '中级', icon: '📏',
                        principle: '面积表示平面图形所占空间的大小。',
                        formula: '矩形=长×宽, 三角形=底×高÷2',
                        example: { problem: '正方形边长5cm，求面积', solution: '面积 = 5 × 5 = 25 cm²' },
                        tips: ['📐 基本公式：熟记各图形面积公式', '✂️ 分解组合：复杂图形分解为简单图形']
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
                        name: '函数概念', level: '高级', icon: '📈',
                        principle: '函数描述一个变量如何依赖于另一个变量。',
                        formula: 'y = f(x)',
                        example: { problem: 'f(x) = 2x + 1，求f(3)', solution: 'f(3) = 2×3 + 1 = 7' },
                        tips: ['📝 定义域：函数有意义的x值范围', '📊 值域：函数可能取到的y值范围']
                    }
                ]
            }
        ];
    }
    
    shutdown() {
        this.contentElements.forEach(el => el.destroy());
        this.contentElements = [];
        super.shutdown();
    }
}
