/**
 * 数学概念系统 - 基于认知体系报告的深度数学概念
 * 每个概念都包含理论背景、直觉解释、严格定义和交互式探索
 */

export class MathematicalConcept {
    constructor(id, config) {
        this.id = id;
        this.name = config.name;
        this.category = config.category;
        this.level = config.level;
        this.description = config.description;
        this.intuition = config.intuition;
        this.formalDefinition = config.formalDefinition;
        this.historicalContext = config.historicalContext;
        this.prerequisites = config.prerequisites || [];
        this.applications = config.applications || [];
        this.paradoxes = config.paradoxes || [];
        this.interactiveElements = config.interactiveElements || [];
        this.unlocked = false;
    }
    
    /**
     * 检查概念是否可以解锁
     */
    canUnlock(player) {
        return this.prerequisites.every(prereq => 
            player.masteredConcepts.includes(prereq)
        );
    }
    
    /**
     * 获取概念的探索挑战
     */
    getExplorationChallenges() {
        return this.interactiveElements.map(element => ({
            type: element.type,
            title: element.title,
            description: element.description,
            challenge: element.challenge
        }));
    }
}

/**
 * 数学概念库 - 完整的认知体系
 */
export class ConceptLibrary {
    constructor() {
        this.concepts = new Map();
        this.initializeConcepts();
    }
    
    initializeConcepts() {
        // ==================== 第一层：算术基石 ====================
        
        this.addConcept('peano_axioms', {
            name: '皮亚诺公理',
            category: 'ARITHMETIC_FOUNDATION',
            level: 1,
            description: '定义自然数的五条公理，数学大厦的最初基石',
            intuition: '想象你在数数：1, 2, 3... 皮亚诺公理告诉我们，每个数都有一个"下一个数"，而且这个过程可以无限进行下去。',
            formalDefinition: `
                1. 0是自然数
                2. 每个自然数都有唯一的后继数
                3. 0不是任何数的后继数
                4. 不同自然数的后继数不同
                5. 数学归纳法公理
            `,
            historicalContext: '1889年，意大利数学家朱塞佩·皮亚诺提出这些公理，首次严格定义了自然数系统。',
            interactiveElements: [
                {
                    type: 'construction',
                    title: '构造自然数',
                    description: '从0开始，通过后继函数构造前10个自然数',
                    challenge: 'successor_construction'
                },
                {
                    type: 'proof',
                    title: '数学归纳法证明',
                    description: '证明：对所有自然数n，1+2+...+n = n(n+1)/2',
                    challenge: 'induction_proof'
                }
            ]
        });
        
        this.addConcept('irrational_discovery', {
            name: '无理数的发现',
            category: 'ARITHMETIC_FOUNDATION',
            level: 2,
            description: '√2无法表示为分数，数轴上存在"洞隙"',
            intuition: '想象你试图用分数来表示正方形对角线的长度，却发现这是不可能的！这个发现震撼了古希腊数学界。',
            formalDefinition: '无理数是不能表示为两个整数之比的实数。√2的无理性可通过反证法严格证明。',
            historicalContext: '公元前5世纪，毕达哥拉斯学派发现√2的无理性，这被称为"第一次数学危机"。',
            prerequisites: ['peano_axioms'],
            paradoxes: [
                {
                    name: '毕达哥拉斯悖论',
                    description: '如果一切都是数（有理数），那么√2是什么？',
                    resolution: '需要扩展数系概念，引入无理数'
                }
            ],
            interactiveElements: [
                {
                    type: 'proof',
                    title: '√2无理性证明',
                    description: '使用反证法证明√2不能表示为p/q的形式',
                    challenge: 'sqrt2_irrationality'
                },
                {
                    type: 'visualization',
                    title: '数轴上的洞隙',
                    description: '可视化有理数在数轴上的分布，发现"洞隙"',
                    challenge: 'rational_gaps'
                }
            ]
        });
        
        // ==================== 第二层：代数觉醒 ====================
        
        this.addConcept('functional_thinking', {
            name: '函数思维',
            category: 'ALGEBRAIC_THINKING',
            level: 3,
            description: '从计算转向关系，理解函数作为映射的本质',
            intuition: '函数不是公式，而是一种"机器"：输入x，输出f(x)。重要的是输入输出之间的对应关系。',
            formalDefinition: '函数f: A → B是集合A到集合B的映射，对A中每个元素x，都有B中唯一元素f(x)与之对应。',
            historicalContext: '函数概念由莱布尼茨在17世纪提出，欧拉在18世纪发展了现代记号f(x)。',
            prerequisites: ['irrational_discovery'],
            interactiveElements: [
                {
                    type: 'exploration',
                    title: '函数机器',
                    description: '设计不同的函数"机器"，观察输入输出关系',
                    challenge: 'function_machine'
                },
                {
                    type: 'composition',
                    title: '函数复合',
                    description: '理解f(g(x))的含义，为链式法则做准备',
                    challenge: 'function_composition'
                }
            ]
        });
        
        // ==================== 第三层：几何洞察 ====================
        
        this.addConcept('distance_metrics', {
            name: '距离度量',
            category: 'GEOMETRIC_INTUITION',
            level: 4,
            description: '理解不同的距离定义，为阶梯悖论做铺垫',
            intuition: '从A到B有多远？答案取决于你如何定义"距离"。直线距离？曼哈顿距离？',
            formalDefinition: `
                欧几里得距离：d = √[(x₂-x₁)² + (y₂-y₁)²]
                曼哈顿距离：d = |x₂-x₁| + |y₂-y₁|
                切比雪夫距离：d = max(|x₂-x₁|, |y₂-y₁|)
            `,
            historicalContext: '不同的距离概念在19-20世纪的度量空间理论中得到系统发展。',
            prerequisites: ['functional_thinking'],
            paradoxes: [
                {
                    name: '距离悖论预告',
                    description: '为什么阶梯逼近对角线时，距离不收敛？',
                    resolution: '混淆了不同的度量体系'
                }
            ],
            interactiveElements: [
                {
                    type: 'visualization',
                    title: '距离可视化',
                    description: '在网格上比较不同距离度量的"圆"',
                    challenge: 'distance_circles'
                },
                {
                    type: 'calculation',
                    title: '出租车几何',
                    description: '在曼哈顿网格中找最短路径',
                    challenge: 'taxicab_geometry'
                }
            ]
        });
        
        // ==================== 第四层：极限驯服 ====================
        
        this.addConcept('epsilon_delta', {
            name: 'ε-δ定义',
            category: 'LIMIT_THEORY',
            level: 5,
            description: '极限的严格定义，驯服无穷小的逻辑工具',
            intuition: '这是一场博弈：挑战者给出误差ε，你必须找到对应的δ。如果你总能获胜，极限就存在。',
            formalDefinition: `
                lim(x→c) f(x) = L 当且仅当：
                ∀ε > 0, ∃δ > 0, 使得当 0 < |x-c| < δ 时，|f(x)-L| < ε
            `,
            historicalContext: '19世纪，柯西和魏尔斯特拉斯建立了这个严格定义，结束了微积分的直觉时代。',
            prerequisites: ['distance_metrics'],
            interactiveElements: [
                {
                    type: 'game',
                    title: 'ε-δ博弈',
                    description: '与计算机进行ε-δ挑战，证明极限存在',
                    challenge: 'epsilon_delta_game'
                },
                {
                    type: 'construction',
                    title: '极限构造',
                    description: '为给定函数构造ε-δ证明',
                    challenge: 'limit_construction'
                }
            ]
        });
        
        this.addConcept('zeno_paradoxes', {
            name: '芝诺悖论',
            category: 'LIMIT_THEORY',
            level: 5,
            description: '古希腊的无穷悖论，现代极限理论的历史起点',
            intuition: '阿喀琉斯永远追不上乌龟？无穷个正数相加可能等于有限值！',
            formalDefinition: '二分法悖论的数学解答：1/2 + 1/4 + 1/8 + ... = Σ(1/2ⁿ) = 1',
            historicalContext: '公元前5世纪，芝诺提出这些悖论来支持巴门尼德的"运动是幻觉"理论。',
            prerequisites: ['epsilon_delta'],
            interactiveElements: [
                {
                    type: 'simulation',
                    title: '阿喀琉斯追龟',
                    description: '模拟追赶过程，观察无穷级数收敛',
                    challenge: 'achilles_turtle'
                },
                {
                    type: 'series',
                    title: '几何级数求和',
                    description: '计算无穷几何级数的和',
                    challenge: 'geometric_series'
                }
            ]
        });
        
        // ==================== 第五层：悖论解析 ====================
        
        this.addConcept('staircase_paradox', {
            name: '阶梯悖论',
            category: 'GEOMETRIC_PARADOXES',
            level: 6,
            description: '为什么阶梯逼近对角线时长度不收敛？收敛类型的深刻差异',
            intuition: '位置越来越近，但长度始终是2而不是√2。这揭示了"逼近"概念的微妙性。',
            formalDefinition: `
                阶梯函数fn(x)一致收敛于f(x)=x，但弧长不收敛：
                L(fn) = 2 ↛ L(f) = √2
                原因：需要C¹收敛（导数也收敛）才能保证弧长收敛
            `,
            historicalContext: '这个悖论展示了19世纪分析学中发现的收敛性微妙差异。',
            prerequisites: ['zeno_paradoxes'],
            paradoxes: [
                {
                    name: '长度悖论',
                    description: '为什么位置收敛但长度不收敛？',
                    resolution: '一致收敛不等于C¹收敛'
                }
            ],
            interactiveElements: [
                {
                    type: 'animation',
                    title: '阶梯细分动画',
                    description: '观察阶梯如何逼近对角线，但长度保持不变',
                    challenge: 'staircase_animation'
                },
                {
                    type: 'calculation',
                    title: '弧长积分',
                    description: '计算不同曲线的弧长，理解积分公式',
                    challenge: 'arc_length_integral'
                }
            ]
        });
        
        this.addConcept('schwarz_lantern', {
            name: '施瓦茨灯笼',
            category: 'GEOMETRIC_PARADOXES',
            level: 7,
            description: '三维空间的面积悖论，褶皱效应的数学解释',
            intuition: '像手风琴包裹管子，褶皱越密，用纸量越大，甚至可以无限大！',
            formalDefinition: `
                圆柱面积 = 2πrh
                灯笼面积 ≈ 2πrh√(1 + K(M/N²)²)
                当M ≫ N²时，面积 → ∞
            `,
            historicalContext: '1880年，赫尔曼·施瓦茨发现这个反例，影响了现代微分几何学。',
            prerequisites: ['staircase_paradox'],
            interactiveElements: [
                {
                    type: '3d_visualization',
                    title: '灯笼构造',
                    description: '3D可视化灯笼的构造过程和面积计算',
                    challenge: 'lantern_construction'
                },
                {
                    type: 'parameter_study',
                    title: '参数研究',
                    description: '调整M和N的比值，观察面积变化',
                    challenge: 'parameter_analysis'
                }
            ]
        });
        
        // ==================== 补充概念：代数觉醒层 ====================
        
        this.addConcept('variable_abstraction', {
            name: '变量抽象化',
            category: 'ALGEBRAIC_THINKING',
            level: 3,
            description: '从具体数字到抽象符号的思维跃迁',
            intuition: 'x不是一个神秘的符号，而是"任意数"的代表。这是人类思维的一次伟大抽象。',
            formalDefinition: '变量是可以取不同值的符号，代表数学对象的抽象表示。',
            historicalContext: '16世纪，韦达首次系统使用字母表示未知数和已知量，开创了符号代数。',
            prerequisites: ['functional_thinking'],
            applications: ['方程求解', '函数表示', '公式推导'],
            interactiveElements: [
                {
                    type: 'substitution',
                    title: '符号替换',
                    description: '体验用字母替换具体数字的抽象过程',
                    challenge: 'symbol_substitution'
                },
                {
                    type: 'pattern_recognition',
                    title: '模式识别',
                    description: '从具体例子中抽象出一般规律',
                    challenge: 'pattern_abstraction'
                }
            ]
        });
        
        this.addConcept('equation_solving', {
            name: '方程求解',
            category: 'ALGEBRAIC_THINKING',
            level: 3,
            description: '寻找未知数的系统方法',
            intuition: '方程就像一个平衡的天平，我们要保持平衡的同时找到未知的重量。',
            formalDefinition: '方程是含有未知数的等式，求解就是找到使等式成立的未知数值。',
            historicalContext: '古巴比伦人就会解二次方程，但现代方程理论由阿拉伯数学家花拉子米建立。',
            prerequisites: ['variable_abstraction'],
            applications: ['线性方程组', '二次方程', '函数零点'],
            interactiveElements: [
                {
                    type: 'balance_game',
                    title: '天平游戏',
                    description: '通过天平模型理解方程变换的本质',
                    challenge: 'equation_balance'
                },
                {
                    type: 'step_by_step',
                    title: '逐步求解',
                    description: '学习系统的方程求解步骤',
                    challenge: 'systematic_solving'
                }
            ]
        });
        
        // ==================== 补充概念：几何洞察层 ====================
        
        this.addConcept('euclidean_axioms', {
            name: '欧几里得公理',
            category: 'GEOMETRIC_INTUITION',
            level: 4,
            description: '几何学的逻辑基础，空间的公理化描述',
            intuition: '从最简单、最显然的事实出发，构建整个几何世界。就像用积木搭建城堡。',
            formalDefinition: `
                1. 任意两点可以连成一条直线
                2. 任意线段可以延长
                3. 以任意点为圆心、任意长度为半径可作圆
                4. 所有直角都相等
                5. 平行公理（第五公设）
            `,
            historicalContext: '公元前300年，欧几里得在《几何原本》中建立了几何学的公理体系。',
            prerequisites: ['distance_metrics'],
            paradoxes: [
                {
                    name: '第五公设争议',
                    description: '平行公理是否可以从其他公理推导？',
                    resolution: '非欧几何的发现证明了第五公设的独立性'
                }
            ],
            interactiveElements: [
                {
                    type: 'construction',
                    title: '尺规作图',
                    description: '使用圆规和直尺进行几何构造',
                    challenge: 'compass_ruler_construction'
                },
                {
                    type: 'proof_exploration',
                    title: '几何证明',
                    description: '体验从公理到定理的逻辑推导',
                    challenge: 'geometric_proof'
                }
            ]
        });
        
        this.addConcept('trigonometric_circle', {
            name: '三角函数圆',
            category: 'GEOMETRIC_INTUITION',
            level: 4,
            description: '单位圆上的三角函数，几何与代数的完美结合',
            intuition: '想象一个人在圆形跑道上跑步，他的水平和垂直位置就是余弦和正弦值。',
            formalDefinition: `
                在单位圆上，角θ对应的点坐标为(cos θ, sin θ)
                tan θ = sin θ / cos θ
                sin²θ + cos²θ = 1
            `,
            historicalContext: '三角函数起源于古代天文学，现代定义由欧拉在18世纪完善。',
            prerequisites: ['euclidean_axioms'],
            applications: ['周期现象', '波动方程', '复数表示'],
            interactiveElements: [
                {
                    type: 'circle_animation',
                    title: '单位圆动画',
                    description: '观察角度变化时三角函数值的变化',
                    challenge: 'unit_circle_exploration'
                },
                {
                    type: 'wave_generation',
                    title: '波形生成',
                    description: '从圆周运动到正弦波的转换',
                    challenge: 'sine_wave_generation'
                }
            ]
        });
        
        // ==================== 补充概念：极限驯服层 ====================
        
        this.addConcept('continuity_concept', {
            name: '连续性概念',
            category: 'LIMIT_THEORY',
            level: 5,
            description: '函数的连续性，直觉与严格定义的统一',
            intuition: '连续的函数就像一笔画成的曲线，中间没有断点或跳跃。',
            formalDefinition: `
                函数f在点c连续当且仅当：
                lim(x→c) f(x) = f(c)
                即：极限存在且等于函数值
            `,
            historicalContext: '连续性概念由柯西在19世纪严格化，是现代分析学的基础。',
            prerequisites: ['epsilon_delta'],
            applications: ['中间值定理', '最值定理', '一致连续性'],
            interactiveElements: [
                {
                    type: 'discontinuity_explorer',
                    title: '间断点探索',
                    description: '识别和分类函数的间断点',
                    challenge: 'discontinuity_classification'
                },
                {
                    type: 'continuous_deformation',
                    title: '连续变形',
                    description: '观察函数的连续变化过程',
                    challenge: 'function_morphing'
                }
            ]
        });
        
        this.addConcept('derivative_definition', {
            name: '导数定义',
            category: 'LIMIT_THEORY',
            level: 5,
            description: '瞬时变化率的精确定义，微积分的核心概念',
            intuition: '导数就是函数在某点的"瞬时速度"，就像汽车仪表盘上的瞬时速度。',
            formalDefinition: `
                f'(x) = lim(h→0) [f(x+h) - f(x)] / h
                几何意义：切线斜率
                物理意义：瞬时变化率
            `,
            historicalContext: '牛顿和莱布尼茨在17世纪独立发明微积分，导数概念由此诞生。',
            prerequisites: ['continuity_concept'],
            applications: ['优化问题', '物理运动', '经济边际分析'],
            interactiveElements: [
                {
                    type: 'tangent_approximation',
                    title: '切线逼近',
                    description: '观察割线如何逼近切线',
                    challenge: 'secant_to_tangent'
                },
                {
                    type: 'rate_calculation',
                    title: '变化率计算',
                    description: '计算各种实际问题的变化率',
                    challenge: 'practical_derivatives'
                }
            ]
        });
        
        // ==================== 补充概念：高等分析层 ====================
        
        this.addConcept('real_analysis', {
            name: '实分析基础',
            category: 'ADVANCED_ANALYSIS',
            level: 6,
            description: '实数系统的严格分析，现代数学分析的基石',
            intuition: '实分析就是用最严格的逻辑来研究我们熟悉的实数和函数。',
            formalDefinition: `
                研究实数上的函数、序列、级数的收敛性
                核心概念：完备性、紧致性、连通性
                基本定理：Bolzano-Weierstrass定理、Heine-Borel定理
            `,
            historicalContext: '19世纪末20世纪初，数学家们为微积分建立了严格的逻辑基础。',
            prerequisites: ['derivative_definition', 'schwarz_lantern'],
            applications: ['泛函分析', '偏微分方程', '概率论'],
            interactiveElements: [
                {
                    type: 'convergence_tests',
                    title: '收敛性判别',
                    description: '学习各种收敛性判别方法',
                    challenge: 'convergence_analysis'
                },
                {
                    type: 'compactness_exploration',
                    title: '紧致性探索',
                    description: '理解紧致集的性质和应用',
                    challenge: 'compactness_properties'
                }
            ]
        });
        
        this.addConcept('measure_theory', {
            name: '测度论基础',
            category: 'ADVANCED_ANALYSIS',
            level: 6,
            description: '长度、面积、体积的抽象推广',
            intuition: '测度论告诉我们如何在抽象空间中"测量"集合的"大小"。',
            formalDefinition: `
                测度μ是定义在σ-代数上的非负可数可加函数
                Lebesgue测度是欧几里得空间中长度概念的推广
                可测函数和Lebesgue积分
            `,
            historicalContext: '20世纪初，Lebesgue发展了测度论，革命性地改进了积分理论。',
            prerequisites: ['real_analysis'],
            applications: ['概率论', '调和分析', '偏微分方程'],
            interactiveElements: [
                {
                    type: 'measure_construction',
                    title: '测度构造',
                    description: '从简单集合构造复杂集合的测度',
                    challenge: 'measure_building'
                },
                {
                    type: 'integration_comparison',
                    title: '积分比较',
                    description: '比较Riemann积分和Lebesgue积分',
                    challenge: 'integration_methods'
                }
            ]
        });
    }
    
    addConcept(id, config) {
        this.concepts.set(id, new MathematicalConcept(id, config));
    }
    
    getConcept(id) {
        return this.concepts.get(id);
    }
    
    getConceptsByCategory(category) {
        return Array.from(this.concepts.values())
            .filter(concept => concept.category === category);
    }
    
    getAvailableConcepts(player) {
        return Array.from(this.concepts.values())
            .filter(concept => concept.canUnlock(player));
    }
}