// Phaser 从全局对象获取
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

/**
 * 攻略场景 - 显示各关卡数学问题的详细解释和攻略
 */
export class GuideScene extends Scene {
    constructor() {
        super({ key: 'GuideScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 半透明背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.95);
        
        // 标题
        const titleText = this.add.text(width / 2, 50, '功法攻略', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei',
            stroke: '#9013FE',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // 攻略分类
        const guides = [
            {
                category: '四则运算',
                icon: '🔢',
                topics: [
                    {
                        name: '加法',
                        explanation: '加法是最基本的数学运算。将两个或多个数相加，得到它们的和。',
                        formula: 'a + b = c',
                        example: '例如：5 + 3 = 8\n解释：将5和3相加，得到8。可以理解为有5个苹果，再增加3个，总共8个。',
                        tips: '• 加法满足交换律：a + b = b + a\n• 加法满足结合律：(a + b) + c = a + (b + c)\n• 任何数加0都等于它本身'
                    },
                    {
                        name: '减法',
                        explanation: '减法是加法的逆运算。从一个数中减去另一个数，得到差。',
                        formula: 'a - b = c (其中 a ≥ b)',
                        example: '例如：8 - 3 = 5\n解释：从8中减去3，得到5。可以理解为有8个苹果，吃掉3个，还剩5个。',
                        tips: '• 减法不满足交换律：a - b ≠ b - a\n• 任何数减0都等于它本身\n• 相同数相减等于0'
                    },
                    {
                        name: '乘法',
                        explanation: '乘法是加法的快速形式。将相同的数相加多次，可以用乘法表示。',
                        formula: 'a × b = c',
                        example: '例如：4 × 3 = 12\n解释：4乘以3，等于4加4加4，得到12。可以理解为3组，每组4个，总共12个。',
                        tips: '• 乘法满足交换律：a × b = b × a\n• 乘法满足结合律：(a × b) × c = a × (b × c)\n• 任何数乘以1都等于它本身\n• 任何数乘以0都等于0'
                    },
                    {
                        name: '除法',
                        explanation: '除法是乘法的逆运算。将一个数分成若干等份，每份是多少。',
                        formula: 'a ÷ b = c (其中 a = b × c)',
                        example: '例如：12 ÷ 3 = 4\n解释：将12分成3等份，每份是4。可以理解为12个苹果，平均分给3个人，每人4个。',
                        tips: '• 除法不满足交换律：a ÷ b ≠ b ÷ a\n• 任何数除以1都等于它本身\n• 0不能作为除数\n• 相同数相除等于1'
                    }
                ]
            },
            {
                category: '代数',
                icon: '📐',
                topics: [
                    {
                        name: '一元一次方程',
                        explanation: '一元一次方程是只含有一个未知数，且未知数的最高次数为1的方程。',
                        formula: 'ax + b = c，求 x',
                        example: '例如：3x + 5 = 14\n解：3x = 14 - 5 = 9\n     x = 9 ÷ 3 = 3\n解释：通过移项和化简，将未知数x单独放在一边，求出x的值。',
                        tips: '• 移项时，加变减，减变加\n• 系数化为1：两边同时除以未知数的系数\n• 检验：将求出的值代入原方程验证'
                    },
                    {
                        name: '不等式',
                        explanation: '不等式表示两个数或表达式之间的大小关系。',
                        formula: 'ax + b > c 或 ax + b < c',
                        example: '例如：2x + 3 > 7\n解：2x > 7 - 3 = 4\n     x > 4 ÷ 2 = 2\n解释：解不等式的方法与方程类似，但要注意不等号的方向。',
                        tips: '• 移项规则与方程相同\n• 两边同时乘以或除以负数时，不等号方向要改变\n• 解集通常用区间表示'
                    }
                ]
            },
            {
                category: '几何',
                icon: '🔺',
                topics: [
                    {
                        name: '圆形',
                        explanation: '圆是平面上所有到定点（圆心）距离相等的点的集合。',
                        formula: '面积：S = πr²，周长：C = 2πr（π ≈ 3.14）',
                        example: '例如：半径为5的圆\n面积 = 3.14 × 5² = 3.14 × 25 = 78.5\n周长 = 2 × 3.14 × 5 = 31.4\n解释：半径是圆心到圆周的距离，π是圆周率，约等于3.14。',
                        tips: '• 圆的面积与半径的平方成正比\n• 圆的周长与半径成正比\n• 直径 = 2 × 半径'
                    },
                    {
                        name: '三角形',
                        explanation: '三角形是由三条边围成的封闭图形。',
                        formula: '面积：S = 底 × 高 ÷ 2，周长：C = 边1 + 边2 + 边3，内角和 = 180°',
                        example: '例如：底为8，高为6的三角形\n面积 = 8 × 6 ÷ 2 = 24\n解释：三角形面积等于底乘以高再除以2。可以理解为将三角形补成矩形，面积是矩形的一半。',
                        tips: '• 任意三角形的内角和都是180°\n• 等边三角形三边相等，三个角都是60°\n• 等腰三角形两边相等，底角相等'
                    },
                    {
                        name: '矩形',
                        explanation: '矩形是四个角都是直角的四边形，对边相等。',
                        formula: '面积：S = 长 × 宽，周长：C = 2(长 + 宽)',
                        example: '例如：长为10，宽为7的矩形\n面积 = 10 × 7 = 70\n周长 = 2 × (10 + 7) = 34\n解释：矩形面积等于长乘以宽，周长等于长和宽之和的2倍。',
                        tips: '• 正方形是特殊的矩形（长=宽）\n• 矩形的对角线相等\n• 矩形面积可以理解为有多少个单位正方形'
                    },
                    {
                        name: '平行四边形',
                        explanation: '平行四边形是对边平行且相等的四边形。',
                        formula: '面积：S = 底 × 高，周长：C = 2(底 + 邻边)',
                        example: '例如：底为6，高为4的平行四边形\n面积 = 6 × 4 = 24\n解释：平行四边形面积等于底乘以高。可以理解为将平行四边形变形为矩形，面积不变。',
                        tips: '• 平行四边形对边平行且相等\n• 平行四边形对角相等\n• 高是垂直于底的线段长度'
                    },
                    {
                        name: '梯形',
                        explanation: '梯形是只有一组对边平行的四边形。',
                        formula: '面积：S = (上底 + 下底) × 高 ÷ 2',
                        example: '例如：上底为3，下底为7，高为4的梯形\n面积 = (3 + 7) × 4 ÷ 2 = 10 × 4 ÷ 2 = 20\n解释：梯形面积等于上底和下底之和乘以高再除以2。可以理解为两个相同梯形可以拼成一个平行四边形。',
                        tips: '• 梯形的上底和下底是平行的两条边\n• 高是两底之间的垂直距离\n• 等腰梯形两腰相等'
                    }
                ]
            },
            {
                category: '函数',
                icon: '📊',
                topics: [
                    {
                        name: '一次函数',
                        explanation: '一次函数是形如 f(x) = ax + b 的函数，其中a和b是常数。',
                        formula: 'f(x) = ax + b',
                        example: '例如：f(x) = 2x + 3，当 x = 5 时\nf(5) = 2 × 5 + 3 = 10 + 3 = 13\n解释：将x的值代入函数表达式，先计算乘法，再计算加法，得到函数值。',
                        tips: '• a是斜率，表示函数图像的倾斜程度\n• b是截距，表示函数图像与y轴的交点\n• 当a > 0时，函数递增；当a < 0时，函数递减'
                    },
                    {
                        name: '二次函数',
                        explanation: '二次函数是形如 f(x) = ax² + bx + c 的函数，其中a、b、c是常数，a ≠ 0。',
                        formula: 'f(x) = ax² + bx + c',
                        example: '例如：f(x) = x² + 2x + 1，当 x = 3 时\nf(3) = 3² + 2×3 + 1 = 9 + 6 + 1 = 16\n解释：先计算x的平方，再计算一次项和常数项，最后相加。',
                        tips: '• 二次函数的图像是抛物线\n• 当a > 0时，抛物线开口向上；当a < 0时，开口向下\n• 顶点坐标：(-b/(2a), f(-b/(2a)))'
                    }
                ]
            },
            {
                category: '分数',
                icon: '🔢',
                topics: [
                    {
                        name: '分数运算',
                        explanation: '分数表示一个整体被分成若干等份，取其中的几份。',
                        formula: '加法/减法：先通分，再运算；乘法：分子乘分子，分母乘分母；除法：乘以倒数',
                        example: '例如：1/3 + 1/4\n通分：4/12 + 3/12 = 7/12\n解释：不同分母的分数相加，需要先找到公分母（最小公倍数），将分数化为同分母后再相加。',
                        tips: '• 通分：找到分母的最小公倍数（LCM）\n• 约分：找到分子分母的最大公约数（GCD）\n• 分数乘法：分子乘分子，分母乘分母\n• 分数除法：乘以除数的倒数'
                    },
                    {
                        name: '分数化简',
                        explanation: '分数化简是将分数化为最简形式，即分子和分母没有公因数。',
                        formula: '找到最大公约数（GCD），分子分母同时除以GCD',
                        example: '例如：12/18\nGCD(12, 18) = 6\n化简：12÷6 / 18÷6 = 2/3\n解释：找到12和18的最大公约数6，将分子和分母同时除以6，得到最简分数。',
                        tips: '• 最大公约数（GCD）：两个数共有的最大因数\n• 最简分数：分子和分母互质\n• 可以用辗转相除法求GCD'
                    }
                ]
            },
            {
                category: '小数',
                icon: '🔢',
                topics: [
                    {
                        name: '小数运算',
                        explanation: '小数是分数的另一种表示形式，小数点后的数字表示十分位、百分位等。',
                        formula: '对齐小数点，按位运算',
                        example: '例如：3.5 + 2.7\n对齐小数点：\n  3.5\n+ 2.7\n------\n  6.2\n解释：小数加减法要先将小数点对齐，然后按位相加或相减，最后点上小数点。',
                        tips: '• 加减法：对齐小数点，按位运算\n• 乘法：先按整数乘法计算，再确定小数位数\n• 除法：移动小数点，转化为整数除法\n• 注意保留有效数字'
                    },
                    {
                        name: '小数与分数转换',
                        explanation: '小数和分数可以相互转换，小数可以写成分母为10、100、1000等的分数。',
                        formula: '小数转分数：看小数位数，分母为10的幂；分数转小数：分子除以分母',
                        example: '例如：0.75 = 75/100 = 3/4\n解释：0.75有两位小数，所以分母是100，分子是75。然后约分得到3/4。',
                        tips: '• 一位小数：分母是10\n• 两位小数：分母是100\n• 三位小数：分母是1000\n• 分数转小数：直接除法'
                    }
                ]
            }
        ];
        
        // 创建分类选择
        const categorySpacing = 150;
        const startX = 150;
        const categoryY = 120;
        let selectedCategory = 0;
        let selectedTopic = 0;
        
        const categoryButtons = [];
        const categoryIcons = [];
        
        guides.forEach((guide, index) => {
            const x = startX + index * categorySpacing;
            const icon = this.add.text(x, categoryY, guide.icon, {
                fontSize: '40px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            const name = this.add.text(x, categoryY + 50, guide.category, {
                fontSize: '18px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
            
            icon.on('pointerdown', () => {
                selectedCategory = index;
                selectedTopic = 0;
                updateDisplay();
            });
            
            icon.on('pointerover', () => {
                icon.setTint(0x50e3c2);
            });
            
            icon.on('pointerout', () => {
                if (selectedCategory !== index) {
                    icon.clearTint();
                }
            });
            
            categoryButtons.push(icon);
            categoryIcons.push({ icon, name });
        });
        
        // 攻略内容显示区域
        let contentPanel = null;
        
        const updateDisplay = () => {
            // 清除旧内容
            if (contentPanel) {
                contentPanel.destroy();
            }
            
            // 更新分类按钮高亮
            categoryButtons.forEach((btn, index) => {
                if (index === selectedCategory) {
                    btn.setTint(0xFFD700);
                } else {
                    btn.clearTint();
                }
            });
            
            const currentGuide = guides[selectedCategory];
            const currentTopic = currentGuide.topics[selectedTopic];
            
            // 创建内容面板
            contentPanel = this.add.container(width / 2, height / 2 + 50);
            
            // 背景
            const bg = this.add.rectangle(0, 0, width - 100, height - 200, 0x1a1a2e, 0.9);
            bg.setStrokeStyle(3, 0xFFD700);
            contentPanel.add(bg);
            
            // 主题选择（如果有多个主题）
            if (currentGuide.topics.length > 1) {
                const topicButtons = [];
                currentGuide.topics.forEach((topic, index) => {
                    const btn = this.add.text(-400 + index * 150, -280, topic.name, {
                        fontSize: '18px',
                        fill: index === selectedTopic ? '#FFD700' : '#fff',
                        fontFamily: 'Microsoft YaHei',
                        backgroundColor: index === selectedTopic ? '#9013FE' : '#333',
                        padding: { x: 15, y: 8 }
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                    
                    btn.on('pointerdown', () => {
                        selectedTopic = index;
                        updateDisplay();
                    });
                    
                    topicButtons.push(btn);
                    contentPanel.add(btn);
                });
            }
            
            // 主题名称
            const topicTitle = this.add.text(0, -220, currentTopic.name, {
                fontSize: '32px',
                fill: '#FFD700',
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            contentPanel.add(topicTitle);
            
            // 解释
            const explanation = this.add.text(0, -150, currentTopic.explanation, {
                fontSize: '20px',
                fill: '#fff',
                fontFamily: 'Microsoft YaHei',
                wordWrap: { width: width - 200 },
                align: 'center'
            }).setOrigin(0.5);
            contentPanel.add(explanation);
            
            // 公式
            const formula = this.add.text(0, -80, `公式：${currentTopic.formula}`, {
                fontSize: '22px',
                fill: '#50e3c2',
                fontFamily: 'Microsoft YaHei',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5);
            contentPanel.add(formula);
            
            // 示例
            const example = this.add.text(0, 0, `示例：\n${currentTopic.example}`, {
                fontSize: '18px',
                fill: '#E8D5B7',
                fontFamily: 'Microsoft YaHei',
                wordWrap: { width: width - 200 },
                align: 'left',
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5);
            contentPanel.add(example);
            
            // 技巧提示
            const tips = this.add.text(0, 150, `技巧提示：\n${currentTopic.tips}`, {
                fontSize: '16px',
                fill: '#B8E986',
                fontFamily: 'Microsoft YaHei',
                wordWrap: { width: width - 200 },
                align: 'left',
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5);
            contentPanel.add(tips);
        };
        
        // 初始显示
        updateDisplay();
        
        // 关闭按钮
        const closeButton = this.add.text(width / 2, height - 50, '返回 (ESC)', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#667eea',
            padding: { x: 30, y: 15 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.stop())
        .on('pointerover', () => closeButton.setTint(0x764ba2))
        .on('pointerout', () => closeButton.clearTint());
        
        // ESC 键关闭
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();
        });
    }
}

