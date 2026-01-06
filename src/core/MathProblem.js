/**
 * 数学题目类
 * 生成和管理数学题目，集成数学概念系统
 */
export class MathProblem {
    constructor(difficulty = 1, topic = 'arithmetic', operation = null, conceptId = null) {
        this.difficulty = difficulty;
        this.topic = topic;
        this.operation = operation; // 指定具体的运算类型：'+', '-', '*', '/' 或几何类型：'circle', 'triangle', 'rectangle' 等
        this.conceptId = conceptId; // 关联的数学概念ID
        this.problem = '';
        this.correctAnswer = 0;
        this.options = [];
        this.explanation = ''; // 题目解释，连接到数学概念
        this.generate();
    }
    
    /**
     * 根据难度和主题生成题目
     */
    generate() {
        // 如果有关联的数学概念，生成概念相关的题目
        if (this.conceptId) {
            this.generateConceptualProblem();
            return;
        }
        
        switch (this.topic) {
            case 'arithmetic':
                this.generateArithmetic();
                break;
            case 'algebra':
                this.generateAlgebra();
                break;
            case 'geometry':
                this.generateGeometry();
                break;
            case 'function':
                this.generateFunction();
                break;
            case 'fraction':
                this.generateFraction();
                break;
            case 'decimal':
                this.generateDecimal();
                break;
            default:
                this.generateArithmetic();
        }
    }
    
    /**
     * 生成基于数学概念的题目
     */
    generateConceptualProblem() {
        switch (this.conceptId) {
            case 'peano_axioms':
                this.generatePeanoAxiomsProblem();
                break;
            case 'irrational_discovery':
                this.generateIrrationalProblem();
                break;
            case 'functional_thinking':
                this.generateFunctionalThinkingProblem();
                break;
            case 'distance_metrics':
                this.generateDistanceMetricsProblem();
                break;
            case 'epsilon_delta':
                this.generateEpsilonDeltaProblem();
                break;
            case 'zeno_paradoxes':
                this.generateZenoParadoxProblem();
                break;
            case 'staircase_paradox':
                this.generateStaircaseParadoxProblem();
                break;
            case 'schwarz_lantern':
                this.generateSchwarzLanternProblem();
                break;
            case 'variable_abstraction':
                this.generateVariableAbstractionProblem();
                break;
            case 'equation_solving':
                this.generateEquationSolvingProblem();
                break;
            case 'euclidean_axioms':
                this.generateEuclideanAxiomsProblem();
                break;
            case 'trigonometric_circle':
                this.generateTrigonometricCircleProblem();
                break;
            case 'continuity_concept':
                this.generateContinuityProblem();
                break;
            case 'derivative_definition':
                this.generateDerivativeProblem();
                break;
            case 'real_analysis':
                this.generateRealAnalysisProblem();
                break;
            case 'measure_theory':
                this.generateMeasureTheoryProblem();
                break;
            default:
                // 如果概念ID不匹配，回退到常规题目生成
                this.generateArithmetic();
        }
    }
    
    /**
     * 皮亚诺公理相关题目
     */
    generatePeanoAxiomsProblem() {
        const problemTypes = [
            'successor_function',
            'induction_base',
            'natural_number_properties'
        ];
        
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'successor_function':
                const n = Math.floor(Math.random() * 10) + 1;
                this.problem = `根据皮亚诺公理，自然数 ${n} 的后继数是什么？`;
                this.correctAnswer = n + 1;
                this.explanation = '皮亚诺公理规定每个自然数都有唯一的后继数，即 S(n) = n + 1';
                break;
            case 'induction_base':
                this.problem = '数学归纳法的基础步骤是证明什么？';
                this.correctAnswer = 0; // 选择题形式
                this.options = ['P(0)成立', 'P(n)成立', 'P(n+1)成立', '所有情况都成立'];
                this.explanation = '数学归纳法首先需要证明基础情况P(0)成立';
                return; // 直接返回，不生成数值选项
            case 'natural_number_properties':
                this.problem = '根据皮亚诺公理，0是哪个自然数的后继数？';
                this.correctAnswer = -1; // 表示"不是任何数的后继数"
                this.options = ['1', '没有这样的数', '-1', '∞'];
                this.explanation = '皮亚诺公理明确规定：0不是任何自然数的后继数';
                return;
        }
        
        this.generateOptions();
    }
    
    /**
     * 无理数发现相关题目
     */
    generateIrrationalProblem() {
        const problemTypes = ['sqrt2_proof', 'rational_vs_irrational', 'decimal_expansion'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'sqrt2_proof':
                this.problem = '√2 ≈ 1.414... 是无理数，这意味着什么？';
                this.correctAnswer = 1;
                this.options = [
                    '它不能表示为两个整数的比',
                    '它是负数',
                    '它等于某个分数',
                    '它不存在'
                ];
                this.explanation = '无理数的定义：不能表示为两个整数之比的实数';
                return;
            case 'rational_vs_irrational':
                const a = Math.floor(Math.random() * 9) + 1;
                const b = Math.floor(Math.random() * 9) + 1;
                this.problem = `${a}/${b} 和 √2 相乘的结果是什么类型的数？`;
                this.correctAnswer = 1;
                this.options = ['有理数', '无理数', '整数', '自然数'];
                this.explanation = '有理数与无理数相乘（除非有理数为0）结果是无理数';
                return;
            case 'decimal_expansion':
                this.problem = '无理数的小数展开有什么特点？';
                this.correctAnswer = 0;
                this.options = [
                    '无限不循环',
                    '有限小数',
                    '无限循环',
                    '整数'
                ];
                this.explanation = '无理数的小数展开是无限不循环的';
                return;
        }
    }
    
    /**
     * 函数思维相关题目
     */
    generateFunctionalThinkingProblem() {
        const problemTypes = ['function_definition', 'domain_range', 'composition'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'function_definition':
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 10);
                const x = Math.floor(Math.random() * 5) + 1;
                this.problem = `函数 f(x) = ${a}x + ${b}，求 f(${x})`;
                this.correctAnswer = a * x + b;
                this.explanation = `函数是一种映射关系，f(${x}) = ${a} × ${x} + ${b} = ${this.correctAnswer}`;
                break;
            case 'domain_range':
                this.problem = '函数 f(x) = 1/x 的定义域是什么？';
                this.correctAnswer = 2;
                this.options = ['所有实数', '所有正数', '除0外的所有实数', '所有整数'];
                this.explanation = '分母不能为0，所以定义域是除0外的所有实数';
                return;
            case 'composition':
                const c = Math.floor(Math.random() * 3) + 1;
                const d = Math.floor(Math.random() * 3) + 1;
                this.problem = `设 f(x) = ${c}x，g(x) = x + ${d}，求 f(g(1))`;
                this.correctAnswer = c * (1 + d);
                this.explanation = `先算 g(1) = 1 + ${d} = ${1 + d}，再算 f(${1 + d}) = ${c} × ${1 + d} = ${this.correctAnswer}`;
                break;
        }
        
        this.generateOptions();
    }
    
    /**
     * 距离度量相关题目
     */
    generateDistanceMetricsProblem() {
        const problemTypes = ['euclidean_distance', 'manhattan_distance', 'distance_comparison'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'euclidean_distance':
                const x1 = Math.floor(Math.random() * 10);
                const y1 = Math.floor(Math.random() * 10);
                const x2 = Math.floor(Math.random() * 10);
                const y2 = Math.floor(Math.random() * 10);
                const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                this.problem = `点A(${x1}, ${y1})到点B(${x2}, ${y2})的欧几里得距离是多少？`;
                this.correctAnswer = Math.round(distance * 100) / 100;
                this.explanation = `欧几里得距离公式：d = √[(x₂-x₁)² + (y₂-y₁)²] = √[${(x2-x1)**2} + ${(y2-y1)**2}] = ${this.correctAnswer}`;
                break;
            case 'manhattan_distance':
                const mx1 = Math.floor(Math.random() * 10);
                const my1 = Math.floor(Math.random() * 10);
                const mx2 = Math.floor(Math.random() * 10);
                const my2 = Math.floor(Math.random() * 10);
                this.problem = `在网格城市中，从(${mx1}, ${my1})到(${mx2}, ${my2})的曼哈顿距离是多少？`;
                this.correctAnswer = Math.abs(mx2 - mx1) + Math.abs(my2 - my1);
                this.explanation = `曼哈顿距离 = |x₂-x₁| + |y₂-y₁| = ${Math.abs(mx2-mx1)} + ${Math.abs(my2-my1)} = ${this.correctAnswer}`;
                break;
            case 'distance_comparison':
                this.problem = '在同样的两点间，哪种距离通常最短？';
                this.correctAnswer = 0;
                this.options = ['欧几里得距离', '曼哈顿距离', '切比雪夫距离', '都一样'];
                this.explanation = '欧几里得距离是直线距离，通常是最短的';
                return;
        }
        
        this.generateOptions();
    }
    
    /**
     * ε-δ定义相关题目
     */
    generateEpsilonDeltaProblem() {
        const problemTypes = ['limit_definition', 'epsilon_delta_game', 'limit_calculation'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'limit_definition':
                this.problem = 'ε-δ定义中，ε表示什么？';
                this.correctAnswer = 0;
                this.options = ['函数值的误差范围', '自变量的变化', '极限值', '函数的斜率'];
                this.explanation = 'ε表示函数值与极限值之间允许的误差范围';
                return;
            case 'epsilon_delta_game':
                this.problem = '在ε-δ博弈中，如果挑战者给出ε=0.1，你需要找到什么？';
                this.correctAnswer = 1;
                this.options = ['更小的ε', '对应的δ', '极限值', '函数值'];
                this.explanation = '你需要找到δ，使得当|x-c|<δ时，|f(x)-L|<ε';
                return;
            case 'limit_calculation':
                const a = Math.floor(Math.random() * 5) + 1;
                this.problem = `lim(x→2) ${a}x = ?`;
                this.correctAnswer = a * 2;
                this.explanation = `连续函数的极限等于函数值：lim(x→2) ${a}x = ${a} × 2 = ${this.correctAnswer}`;
                break;
        }
        
        this.generateOptions();
    }
    
    /**
     * 芝诺悖论相关题目
     */
    generateZenoParadoxProblem() {
        const problemTypes = ['achilles_turtle', 'dichotomy', 'infinite_series'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'achilles_turtle':
                this.problem = '阿喀琉斯追龟悖论的数学解答是什么？';
                this.correctAnswer = 2;
                this.options = ['阿喀琉斯永远追不上', '乌龟会停下来', '无穷级数收敛', '时间会停止'];
                this.explanation = '无穷级数1/2 + 1/4 + 1/8 + ... = 1，所以阿喀琉斯能追上乌龟';
                return;
            case 'dichotomy':
                this.problem = '二分法悖论中，走完1米需要经过多少个步骤？';
                this.correctAnswer = 3;
                this.options = ['有限个', '2个', '10个', '无穷个'];
                this.explanation = '理论上需要无穷个步骤，但无穷级数收敛到有限值';
                return;
            case 'infinite_series':
                this.problem = '1/2 + 1/4 + 1/8 + 1/16 + ... = ?';
                this.correctAnswer = 1;
                this.explanation = '这是几何级数，首项a=1/2，公比r=1/2，和为a/(1-r) = (1/2)/(1-1/2) = 1';
                break;
        }
        
        this.generateOptions();
    }
    
    /**
     * 阶梯悖论相关题目
     */
    generateStaircaseParadoxProblem() {
        const problemTypes = ['staircase_length', 'convergence_types', 'arc_length'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'staircase_length':
                this.problem = '单位正方形中，阶梯逼近对角线时，阶梯的长度始终是多少？';
                this.correctAnswer = 2;
                this.explanation = '无论阶梯多么细密，总长度始终是水平段长度1 + 垂直段长度1 = 2';
                break;
            case 'convergence_types':
                this.problem = '阶梯悖论说明了什么？';
                this.correctAnswer = 1;
                this.options = ['函数收敛', '一致收敛不等于弧长收敛', '极限不存在', '数学是错的'];
                this.explanation = '阶梯函数一致收敛于对角线，但弧长不收敛，说明需要更强的收敛条件';
                return;
            case 'arc_length':
                this.problem = '对角线的实际长度是多少？';
                this.correctAnswer = Math.round(Math.sqrt(2) * 100) / 100;
                this.explanation = `对角线长度 = √(1² + 1²) = √2 ≈ ${this.correctAnswer}`;
                break;
        }
        
        this.generateOptions();
    }
    
    /**
     * 施瓦茨灯笼相关题目
     */
    generateSchwarzLanternProblem() {
        const problemTypes = ['lantern_concept', 'surface_area', 'folding_effect'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'lantern_concept':
                this.problem = '施瓦茨灯笼悖论发生在哪个维度？';
                this.correctAnswer = 2;
                this.options = ['一维（长度）', '二维（面积）', '三维（体积）', '四维（时空）'];
                this.explanation = '施瓦茨灯笼是关于曲面面积的悖论，发生在二维';
                return;
            case 'surface_area':
                const r = Math.floor(Math.random() * 5) + 1;
                const h = Math.floor(Math.random() * 5) + 1;
                this.problem = `半径${r}，高${h}的圆柱面积是多少？`;
                this.correctAnswer = Math.round(2 * Math.PI * r * h * 100) / 100;
                this.explanation = `圆柱侧面积 = 2πrh = 2π × ${r} × ${h} ≈ ${this.correctAnswer}`;
                break;
            case 'folding_effect':
                this.problem = '灯笼的褶皱越密，面积会怎样？';
                this.correctAnswer = 0;
                this.options = ['趋向无穷大', '保持不变', '趋向于0', '无法确定'];
                this.explanation = '褶皱越密，表面积越大，理论上可以趋向无穷大';
                return;
        }
        
        this.generateOptions();
    }
    
    /**
     * 变量抽象化相关题目
     */
    generateVariableAbstractionProblem() {
        const problemTypes = ['symbol_meaning', 'pattern_generalization', 'substitution'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'symbol_meaning':
                this.problem = '在代数中，字母x通常表示什么？';
                this.correctAnswer = 0;
                this.options = ['未知数或变量', '乘号', '坐标轴', '常数'];
                this.explanation = '在代数中，字母（如x）用来表示未知数或变量，这是数学抽象化的重要体现';
                return;
            case 'pattern_generalization':
                const a = Math.floor(Math.random() * 5) + 2;
                this.problem = `观察规律：1×${a}=${a}, 2×${a}=${2*a}, 3×${a}=${3*a}，用字母表示这个规律：`;
                this.correctAnswer = 1;
                this.options = [`${a}×n=${a}n`, `n×${a}=${a}n`, `x×${a}=${a}x`, `${a}+n=n+${a}`];
                this.explanation = `这个规律可以抽象为：n×${a}=${a}n，其中n代表任意自然数`;
                return;
            case 'substitution':
                const b = Math.floor(Math.random() * 5) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                this.problem = `如果x = ${c}，那么 ${b}x + 1 = ?`;
                this.correctAnswer = b * c + 1;
                this.explanation = `将x = ${c}代入表达式：${b} × ${c} + 1 = ${b * c} + 1 = ${this.correctAnswer}`;
                break;
        }
        
        this.generateOptions();
    }
    
    /**
     * 方程求解相关题目
     */
    generateEquationSolvingProblem() {
        const problemTypes = ['linear_equation', 'balance_concept', 'equation_steps'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'linear_equation':
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 10) + 1;
                const x = Math.floor(Math.random() * 5) + 1;
                const c = a * x + b;
                this.problem = `解方程：${a}x + ${b} = ${c}`;
                this.correctAnswer = x;
                this.explanation = `${a}x = ${c} - ${b} = ${c - b}，所以 x = ${c - b}/${a} = ${x}`;
                break;
            case 'balance_concept':
                this.problem = '方程就像天平，两边必须保持什么？';
                this.correctAnswer = 0;
                this.options = ['平衡（相等）', '不等', '递增', '递减'];
                this.explanation = '方程的本质是等式，就像天平两边必须保持平衡（相等）';
                return;
            case 'equation_steps':
                this.problem = '解方程的第一步通常是什么？';
                this.correctAnswer = 1;
                this.options = ['直接猜答案', '化简和整理', '检验答案', '画图'];
                this.explanation = '解方程的第一步是化简和整理，使方程变得更容易求解';
                return;
        }
        
        this.generateOptions();
    }
    
    /**
     * 欧几里得公理相关题目
     */
    generateEuclideanAxiomsProblem() {
        const problemTypes = ['axiom_content', 'parallel_postulate', 'geometric_construction'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'axiom_content':
                this.problem = '欧几里得第一公设说的是什么？';
                this.correctAnswer = 0;
                this.options = [
                    '任意两点可以连成一条直线',
                    '所有直角都相等',
                    '可以任意延长线段',
                    '平行线永不相交'
                ];
                this.explanation = '欧几里得第一公设：任意两点可以连成一条直线';
                return;
            case 'parallel_postulate':
                this.problem = '欧几里得第五公设（平行公理）在数学史上有什么特殊意义？';
                this.correctAnswer = 2;
                this.options = [
                    '它是最简单的公理',
                    '它可以从其他公理推导',
                    '它的独立性导致了非欧几何的发现',
                    '它是错误的'
                ];
                this.explanation = '第五公设的独立性问题困扰数学家2000多年，最终导致了非欧几何的发现';
                return;
            case 'geometric_construction':
                this.problem = '用尺规作图可以完成以下哪个构造？';
                this.correctAnswer = 0;
                this.options = [
                    '作角的平分线',
                    '三等分任意角',
                    '化圆为方',
                    '倍立方'
                ];
                this.explanation = '作角的平分线是经典的尺规作图问题，而其他三个是著名的不可能问题';
                return;
        }
    }
    
    /**
     * 三角函数圆相关题目
     */
    generateTrigonometricCircleProblem() {
        const problemTypes = ['unit_circle', 'trig_values', 'trig_identity'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'unit_circle':
                this.problem = '在单位圆上，角度0°对应的点坐标是什么？';
                this.correctAnswer = 0;
                this.options = ['(1, 0)', '(0, 1)', '(-1, 0)', '(0, -1)'];
                this.explanation = '在单位圆上，0°角对应的点在x轴正方向，坐标为(1, 0)';
                return;
            case 'trig_values':
                const angles = [30, 45, 60];
                const angle = angles[Math.floor(Math.random() * angles.length)];
                const values = {
                    30: { sin: 0.5, cos: Math.sqrt(3)/2 },
                    45: { sin: Math.sqrt(2)/2, cos: Math.sqrt(2)/2 },
                    60: { sin: Math.sqrt(3)/2, cos: 0.5 }
                };
                this.problem = `sin(${angle}°) = ?`;
                this.correctAnswer = Math.round(values[angle].sin * 1000) / 1000;
                this.explanation = `sin(${angle}°) = ${this.correctAnswer}，这是单位圆上的特殊角值`;
                break;
            case 'trig_identity':
                this.problem = '三角恒等式 sin²θ + cos²θ = ? 对所有角θ都成立';
                this.correctAnswer = 1;
                this.explanation = '根据勾股定理，单位圆上任意点到原点的距离都是1，所以sin²θ + cos²θ = 1';
                break;
        }
        
        this.generateOptions();
    }
    
    /**
     * 连续性概念相关题目
     */
    generateContinuityProblem() {
        const problemTypes = ['continuity_definition', 'discontinuity_types', 'continuous_properties'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'continuity_definition':
                this.problem = '函数在某点连续的定义是什么？';
                this.correctAnswer = 1;
                this.options = [
                    '函数在该点有定义',
                    '极限存在且等于函数值',
                    '函数在该点可导',
                    '函数在该点单调'
                ];
                this.explanation = '函数在点c连续当且仅当 lim(x→c) f(x) = f(c)';
                return;
            case 'discontinuity_types':
                this.problem = '函数f(x) = 1/x在x = 0处是什么类型的间断？';
                this.correctAnswer = 0;
                this.options = ['无穷间断', '跳跃间断', '可去间断', '连续'];
                this.explanation = '函数1/x在x = 0处无定义且极限为无穷，属于无穷间断';
                return;
            case 'continuous_properties':
                this.problem = '连续函数在闭区间上一定具有什么性质？';
                this.correctAnswer = 2;
                this.options = ['单调性', '可导性', '有界性和最值', '周期性'];
                this.explanation = '根据最值定理，连续函数在闭区间上一定有界且能取到最大值和最小值';
                return;
        }
    }
    
    /**
     * 导数定义相关题目
     */
    generateDerivativeProblem() {
        const problemTypes = ['derivative_definition', 'geometric_meaning', 'derivative_calculation'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'derivative_definition':
                this.problem = '导数的定义式是什么？';
                this.correctAnswer = 0;
                this.options = [
                    'lim(h→0) [f(x+h) - f(x)] / h',
                    'lim(x→∞) f(x)',
                    '∫f(x)dx',
                    'f(x+1) - f(x)'
                ];
                this.explanation = '导数定义为函数增量与自变量增量比值的极限';
                return;
            case 'geometric_meaning':
                this.problem = '导数的几何意义是什么？';
                this.correctAnswer = 1;
                this.options = ['函数值', '切线斜率', '函数的积分', '函数的最值'];
                this.explanation = '导数的几何意义是函数图像在该点处切线的斜率';
                return;
            case 'derivative_calculation':
                const n = Math.floor(Math.random() * 5) + 2;
                this.problem = `函数f(x) = x^${n}的导数是什么？`;
                this.correctAnswer = 0;
                this.options = [`${n}x^${n-1}`, `x^${n-1}`, `${n}x^${n}`, `x^${n+1}`];
                this.explanation = `根据幂函数求导法则：(x^n)' = nx^(n-1)`;
                return;
        }
    }
    
    /**
     * 实分析基础相关题目
     */
    generateRealAnalysisProblem() {
        const problemTypes = ['completeness', 'convergence', 'compactness'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'completeness':
                this.problem = '实数的完备性是指什么？';
                this.correctAnswer = 0;
                this.options = [
                    '每个Cauchy序列都收敛',
                    '每个序列都有极限',
                    '每个函数都连续',
                    '每个集合都有界'
                ];
                this.explanation = '实数的完备性：每个Cauchy序列都在实数中收敛';
                return;
            case 'convergence':
                this.problem = '数列收敛的Cauchy判别法是什么？';
                this.correctAnswer = 1;
                this.options = [
                    '数列单调有界',
                    '对任意ε>0，存在N使得m,n>N时|a_m-a_n|<ε',
                    '数列有界',
                    '数列递增'
                ];
                this.explanation = 'Cauchy判别法：数列收敛当且仅当它是Cauchy序列';
                return;
            case 'compactness':
                this.problem = '在实数中，哪种集合是紧致的？';
                this.correctAnswer = 2;
                this.options = ['开集', '无界集', '有界闭集', '可数集'];
                this.explanation = 'Heine-Borel定理：实数中的集合紧致当且仅当它有界且闭';
                return;
        }
    }
    
    /**
     * 测度论基础相关题目
     */
    generateMeasureTheoryProblem() {
        const problemTypes = ['measure_properties', 'lebesgue_measure', 'measurable_sets'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (type) {
            case 'measure_properties':
                this.problem = '测度的基本性质不包括哪一个？';
                this.correctAnswer = 3;
                this.options = ['非负性', '空集测度为0', '可数可加性', '乘法性'];
                this.explanation = '测度具有非负性、空集测度为0、可数可加性，但不具有乘法性';
                return;
            case 'lebesgue_measure':
                this.problem = '区间[0,1]的Lebesgue测度是多少？';
                this.correctAnswer = 1;
                this.explanation = '区间[0,1]的Lebesgue测度等于其长度，即1';
                break;
            case 'measurable_sets':
                this.problem = 'Cantor集的Lebesgue测度是多少？';
                this.correctAnswer = 0;
                this.explanation = 'Cantor集是不可数的，但其Lebesgue测度为0，这是测度论的经典例子';
                break;
        }
        
        this.generateOptions();
    }
    
    /**
     * 生成四则运算题目
     */
    generateArithmetic() {
        // 如果指定了运算类型，使用指定的；否则随机选择
        const operations = ['+', '-', '*', '/'];
        const op = this.operation || operations[Math.floor(Math.random() * operations.length)];
        
        let a, b, answer;
        
        switch (op) {
            case '+':
                a = Math.floor(Math.random() * 50 * this.difficulty) + 1;
                b = Math.floor(Math.random() * 50 * this.difficulty) + 1;
                answer = a + b;
                this.problem = `${a} + ${b} = ?`;
                break;
            case '-':
                // 确保 a > b，避免负数结果
                a = Math.floor(Math.random() * 50 * this.difficulty) + 20;
                b = Math.floor(Math.random() * (a - 1)) + 1; // b 最大为 a-1，确保 a > b
                answer = a - b;
                this.problem = `${a} - ${b} = ?`;
                break;
            case '*':
                a = Math.floor(Math.random() * 12 * this.difficulty) + 1;
                b = Math.floor(Math.random() * 12 * this.difficulty) + 1;
                answer = a * b;
                this.problem = `${a} × ${b} = ?`;
                break;
            case '/':
                b = Math.floor(Math.random() * 12 * this.difficulty) + 1;
                answer = Math.floor(Math.random() * 12 * this.difficulty) + 1;
                a = b * answer;
                this.problem = `${a} ÷ ${b} = ?`;
                break;
        }
        
        this.correctAnswer = answer;
        this.generateOptions();
    }
    
    /**
     * 生成代数题目
     */
    generateAlgebra() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const x = Math.floor(Math.random() * 10) + 1; // 随机生成 x 值
        const c = a * x + b; // 根据 x 计算 c
        
        this.problem = `如果 ${a}x + ${b} = ${c}，那么 x = ?`;
        this.correctAnswer = x; // 使用计算出的 x 值
        this.generateOptions();
    }
    
    /**
     * 生成几何题目
     * 支持多种图形类型和性质
     */
    generateGeometry() {
        // 如果指定了图形类型（通过operation参数），使用指定的；否则随机选择
        const geometryTypes = ['circle', 'rectangle', 'triangle', 'parallelogram', 'trapezoid', 'square'];
        const geometryType = this.operation || geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
        
        let problem, answer;
        
        switch (geometryType) {
            case 'circle':
                // 圆形：面积或周长
                const radius = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                if (Math.random() > 0.5) {
                    // 面积
                    answer = Math.round(3.14 * radius * radius);
                    problem = `【圆形】半径为 ${radius} 的圆，面积是多少？（π ≈ 3.14，公式：S = πr²）`;
                } else {
                    // 周长
                    answer = Math.round(2 * 3.14 * radius);
                    problem = `【圆形】半径为 ${radius} 的圆，周长是多少？（π ≈ 3.14，公式：C = 2πr）`;
                }
                break;
                
            case 'rectangle':
                // 矩形/长方形：面积或周长
                const width = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const height = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                if (Math.random() > 0.5) {
                    // 面积
                    answer = width * height;
                    problem = `【矩形】长为 ${width}，宽为 ${height} 的长方形，面积是多少？（公式：S = 长 × 宽）`;
                } else {
                    // 周长
                    answer = 2 * (width + height);
                    problem = `【矩形】长为 ${width}，宽为 ${height} 的长方形，周长是多少？（公式：C = 2(长 + 宽)）`;
                }
                break;
                
            case 'square':
                // 正方形：面积或周长
                const side = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                if (Math.random() > 0.5) {
                    // 面积
                    answer = side * side;
                    problem = `【正方形】边长为 ${side} 的正方形，面积是多少？（公式：S = 边长²）`;
                } else {
                    // 周长
                    answer = 4 * side;
                    problem = `【正方形】边长为 ${side} 的正方形，周长是多少？（公式：C = 4 × 边长）`;
                }
                break;
                
            case 'triangle':
                // 三角形：面积、周长或角度
                const base = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const triHeight = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const side1 = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const side2 = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const side3 = base; // 使用底边作为第三边
                
                const questionType = Math.floor(Math.random() * 3);
                if (questionType === 0) {
                    // 面积
                    answer = Math.round((base * triHeight) / 2);
                    problem = `【三角形】底为 ${base}，高为 ${triHeight} 的三角形，面积是多少？（公式：S = 底 × 高 ÷ 2）`;
                } else if (questionType === 1) {
                    // 周长
                    answer = side1 + side2 + side3;
                    problem = `【三角形】三边长分别为 ${side1}、${side2}、${side3} 的三角形，周长是多少？（公式：C = 边1 + 边2 + 边3）`;
                } else {
                    // 角度（内角和）
                    answer = 180;
                    problem = `【三角形】任意三角形的三个内角之和是多少度？（三角形内角和定理）`;
                }
                break;
                
            case 'parallelogram':
                // 平行四边形：面积或周长
                const paraBase = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const paraHeight = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const paraSide = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                if (Math.random() > 0.5) {
                    // 面积
                    answer = paraBase * paraHeight;
                    problem = `【平行四边形】底为 ${paraBase}，高为 ${paraHeight} 的平行四边形，面积是多少？（公式：S = 底 × 高）`;
                } else {
                    // 周长
                    answer = 2 * (paraBase + paraSide);
                    problem = `【平行四边形】底为 ${paraBase}，邻边为 ${paraSide} 的平行四边形，周长是多少？（公式：C = 2(底 + 邻边)）`;
                }
                break;
                
            case 'trapezoid':
                // 梯形：面积
                const topBase = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                const bottomBase = Math.floor(Math.random() * 10 * this.difficulty) + topBase + 1;
                const trapHeight = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                answer = Math.round(((topBase + bottomBase) * trapHeight) / 2);
                problem = `【梯形】上底为 ${topBase}，下底为 ${bottomBase}，高为 ${trapHeight} 的梯形，面积是多少？（公式：S = (上底 + 下底) × 高 ÷ 2）`;
                break;
                
            default:
                // 默认使用圆形
                const defRadius = Math.floor(Math.random() * 10 * this.difficulty) + 1;
                answer = Math.round(3.14 * defRadius * defRadius);
                problem = `【圆形】半径为 ${defRadius} 的圆，面积是多少？（π ≈ 3.14，公式：S = πr²）`;
        }
        
        this.problem = problem;
        this.correctAnswer = answer;
        this.generateOptions();
    }
    
    /**
     * 生成函数题目
     */
    generateFunction() {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10);
        const x = Math.floor(Math.random() * 10) + 1;
        const y = a * x + b;
        
        this.problem = `函数 f(x) = ${a}x + ${b}，当 x = ${x} 时，f(x) = ?`;
        this.correctAnswer = y;
        this.generateOptions();
    }
    
    /**
     * 生成分数运算题目
     */
    generateFraction() {
        const operations = ['+', '-', '*', '/'];
        const op = this.operation || operations[Math.floor(Math.random() * operations.length)];
        
        // 生成简单的分数（分母不超过10）
        const denom1 = Math.floor(Math.random() * 8) + 2; // 2-9
        const num1 = Math.floor(Math.random() * (denom1 - 1)) + 1; // 1 到 denom1-1
        const denom2 = Math.floor(Math.random() * 8) + 2;
        const num2 = Math.floor(Math.random() * (denom2 - 1)) + 1;
        
        let answer, answerNum, answerDenom;
        
        switch (op) {
            case '+':
                // 通分后相加
                const lcm = this.lcm(denom1, denom2);
                answerNum = (num1 * (lcm / denom1)) + (num2 * (lcm / denom2));
                answerDenom = lcm;
                const gcd1 = this.gcd(answerNum, answerDenom);
                answerNum /= gcd1;
                answerDenom /= gcd1;
                answer = answerNum / answerDenom;
                this.problem = `${num1}/${denom1} + ${num2}/${denom2} = ?`;
                break;
            case '-':
                const lcm2 = this.lcm(denom1, denom2);
                answerNum = (num1 * (lcm2 / denom1)) - (num2 * (lcm2 / denom2));
                if (answerNum < 0) {
                    // 如果结果为负，交换顺序
                    answerNum = (num2 * (lcm2 / denom2)) - (num1 * (lcm2 / denom1));
                    this.problem = `${num2}/${denom2} - ${num1}/${denom1} = ?`;
                } else {
                    this.problem = `${num1}/${denom1} - ${num2}/${denom2} = ?`;
                }
                answerDenom = lcm2;
                const gcd2 = this.gcd(Math.abs(answerNum), answerDenom);
                answerNum /= gcd2;
                answerDenom /= gcd2;
                answer = answerNum / answerDenom;
                break;
            case '*':
                answerNum = num1 * num2;
                answerDenom = denom1 * denom2;
                const gcd3 = this.gcd(answerNum, answerDenom);
                answerNum /= gcd3;
                answerDenom /= gcd3;
                answer = answerNum / answerDenom;
                this.problem = `${num1}/${denom1} × ${num2}/${denom2} = ?`;
                break;
            case '/':
                answerNum = num1 * denom2;
                answerDenom = denom1 * num2;
                const gcd4 = this.gcd(answerNum, answerDenom);
                answerNum /= gcd4;
                answerDenom /= gcd4;
                answer = answerNum / answerDenom;
                this.problem = `${num1}/${denom1} ÷ ${num2}/${denom2} = ?`;
                break;
        }
        
        // 对于分数运算，如果结果是整数，直接使用整数；否则保留两位小数
        if (Number.isInteger(answer)) {
            this.correctAnswer = answer;
        } else {
            this.correctAnswer = Math.round(answer * 100) / 100; // 保留两位小数
        }
        this.generateOptions();
    }
    
    /**
     * 生成小数运算题目
     */
    generateDecimal() {
        const operations = ['+', '-', '*', '/'];
        const op = this.operation || operations[Math.floor(Math.random() * operations.length)];
        
        // 生成小数（1-2位小数）
        const decimal1 = Math.round((Math.random() * 50 + 1) * 100) / 100;
        const decimal2 = Math.round((Math.random() * 50 + 1) * 100) / 100;
        
        let answer;
        
        switch (op) {
            case '+':
                answer = decimal1 + decimal2;
                this.problem = `${decimal1} + ${decimal2} = ?`;
                break;
            case '-':
                if (decimal1 >= decimal2) {
                    answer = decimal1 - decimal2;
                    this.problem = `${decimal1} - ${decimal2} = ?`;
                } else {
                    answer = decimal2 - decimal1;
                    this.problem = `${decimal2} - ${decimal1} = ?`;
                }
                break;
            case '*':
                answer = Math.round((decimal1 * decimal2) * 100) / 100;
                this.problem = `${decimal1} × ${decimal2} = ?`;
                break;
            case '/':
                // 确保能整除或得到简单的小数（最多两位小数）
                // 先生成整数商，然后反推被除数和除数
                const quotient = Math.floor(Math.random() * 10) + 1; // 1-10
                const divisor = Math.round((Math.random() * 5 + 1) * 100) / 100; // 1.00-6.00，两位小数
                const dividend = Math.round(quotient * divisor * 100) / 100; // 确保能整除
                answer = Math.round((dividend / divisor) * 100) / 100;
                this.problem = `${dividend} ÷ ${divisor} = ?`;
                break;
        }
        
        this.correctAnswer = Math.round(answer * 100) / 100; // 保留两位小数
        this.generateOptions();
    }
    
    /**
     * 计算最大公约数
     */
    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
    
    /**
     * 计算最小公倍数
     */
    lcm(a, b) {
        return Math.abs(a * b) / this.gcd(a, b);
    }
    
    /**
     * 生成选项（正确答案 + 3个干扰项）
     */
    generateOptions() {
        const options = [this.correctAnswer];
        
        // 判断答案是否为整数
        const isInteger = Number.isInteger(this.correctAnswer);
        const isDecimal = !isInteger && this.topic !== 'fraction';
        
        // 生成干扰项
        while (options.length < 4) {
            let wrongAnswer;
            
            if (this.correctAnswer === 0) {
                // 如果答案是0，生成 -10 到 10 之间的整数或小数
                if (isInteger) {
                    wrongAnswer = Math.floor(Math.random() * 20) - 10;
                } else {
                    wrongAnswer = Math.round((Math.random() * 20 - 10) * 100) / 100;
                }
            } else {
                // 根据答案类型生成相应类型的干扰项
                if (isInteger) {
                    // 整数答案：生成整数干扰项
                    const offset = Math.floor(Math.random() * (Math.abs(this.correctAnswer) + 10)) + 1;
                    wrongAnswer = this.correctAnswer + (Math.random() > 0.5 ? offset : -offset);
                } else if (isDecimal) {
                    // 小数答案：生成小数干扰项，保持相同的小数位数
                    const decimalPlaces = this.getDecimalPlaces(this.correctAnswer);
                    const offset = (Math.random() * (Math.abs(this.correctAnswer) + 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
                    wrongAnswer = Math.round((this.correctAnswer + offset) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
                } else {
                    // 分数答案：生成小数干扰项
                    const offset = (Math.random() * (Math.abs(this.correctAnswer) + 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
                    wrongAnswer = Math.round((this.correctAnswer + offset) * 100) / 100;
                }
            }
            
            // 检查是否与已有选项重复（考虑浮点数精度）
            const isDuplicate = options.some(opt => Math.abs(opt - wrongAnswer) < 0.001);
            if (!isDuplicate) {
                options.push(wrongAnswer);
            }
        }
        
        // 打乱选项顺序
        this.options = this.shuffleArray(options);
    }
    
    /**
     * 获取小数位数
     */
    getDecimalPlaces(num) {
        if (Number.isInteger(num)) return 0;
        const str = num.toString();
        if (str.indexOf('.') === -1) return 0;
        return str.split('.')[1].length;
    }
    
    /**
     * 打乱数组
     */
    shuffleArray(array) {
        const shuffled = array.slice(); // 创建数组副本
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }
    
    /**
     * 检查答案（支持小数和分数）
     */
    checkAnswer(answer) {
        // 如果答案是整数，使用精确匹配
        if (Number.isInteger(this.correctAnswer)) {
            return Math.abs(answer - this.correctAnswer) < 0.0001;
        }
        
        // 对于小数运算，根据小数位数确定误差范围
        const decimalPlaces = this.getDecimalPlaces(this.correctAnswer);
        const tolerance = Math.pow(10, -Math.max(decimalPlaces, 2)); // 至少保留两位小数的精度
        
        return Math.abs(answer - this.correctAnswer) < tolerance;
    }
}

/**
 * 题目库管理器
 */
export class ProblemBank {
    constructor() {
        this.problems = [];
        this.conceptLibrary = null; // 将在需要时初始化
    }
    
    /**
     * 初始化概念库（延迟加载）
     */
    initConceptLibrary() {
        if (!this.conceptLibrary) {
            // 动态导入概念库以避免循环依赖
            import('./MathematicalConcept.js').then(module => {
                this.conceptLibrary = new module.ConceptLibrary();
            });
        }
    }
    
    /**
     * 根据区域、难度和数学之灵名称获取题目
     */
    getProblem(zone, difficulty, spiritName = null, player = null) {
        const topicMap = {
            '青石村': 'arithmetic',
            '五行山': 'algebra',
            '上古遗迹': 'geometry',
            '天外天': 'function',
            '天机阁': 'fraction' // 默认使用分数，但会根据数学之灵名称调整
        };
        
        let topic = topicMap[zone] || 'arithmetic';
        let conceptId = null;
        
        // 如果有玩家数据，尝试匹配数学概念
        if (player && this.conceptLibrary) {
            conceptId = this.getRelevantConcept(zone, player.realm, difficulty);
        }
        
        // 根据数学之灵名称确定具体的运算类型和题目类型
        let operation = null;
        if (spiritName) {
            // 优先检查特殊类型（分数、小数）
            if (spiritName.includes('分数')) {
                topic = 'fraction';
            } else if (spiritName.includes('小数')) {
                topic = 'decimal';
            } else if (spiritName.includes('几何') || spiritName.includes('函数')) {
                // 几何和函数类型保持原 topic
                // 不设置 operation，让它们使用对应的 topic
            } else if (spiritName.includes('三角形')) {
                topic = 'geometry';
                operation = 'triangle';
            } else if (spiritName.includes('圆形') || spiritName.includes('圆')) {
                topic = 'geometry';
                operation = 'circle';
            } else if (spiritName.includes('矩形') || spiritName.includes('长方形')) {
                topic = 'geometry';
                operation = 'rectangle';
            } else if (spiritName.includes('正方形')) {
                topic = 'geometry';
                operation = 'square';
            } else if (spiritName.includes('平行四边形')) {
                topic = 'geometry';
                operation = 'parallelogram';
            } else if (spiritName.includes('梯形')) {
                topic = 'geometry';
                operation = 'trapezoid';
            } else if (spiritName.includes('方程') || spiritName.includes('不等式')) {
                // 代数和方程类型保持原 topic
                topic = 'algebra';
            } else if (spiritName.includes('加法') || spiritName.includes('加')) {
                // 四则运算：强制使用 arithmetic topic
                topic = 'arithmetic';
                operation = '+';
            } else if (spiritName.includes('减法') || spiritName.includes('减')) {
                topic = 'arithmetic';
                operation = '-';
            } else if (spiritName.includes('乘法') || spiritName.includes('乘')) {
                topic = 'arithmetic';
                operation = '*';
            } else if (spiritName.includes('除法') || spiritName.includes('除')) {
                topic = 'arithmetic';
                operation = '/';
            }
        }
        
        return new MathProblem(difficulty, topic, operation, conceptId);
    }
    
    /**
     * 根据区域和玩家境界获取相关的数学概念
     */
    getRelevantConcept(zone, realm, difficulty) {
        if (!this.conceptLibrary) {
            this.initConceptLibrary();
            return null;
        }
        
        // 根据区域和境界映射到概念类别
        const zoneConceptMap = {
            '青石村': 'ARITHMETIC_FOUNDATION',
            '五行山': 'ALGEBRAIC_THINKING', 
            '上古遗迹': 'GEOMETRIC_INTUITION',
            '天外天': 'LIMIT_THEORY',
            '天机阁': 'GEOMETRIC_PARADOXES'
        };
        
        const realmConceptMap = {
            '炼气': ['peano_axioms', 'irrational_discovery'],
            '筑基': ['functional_thinking', 'distance_metrics'],
            '金丹': ['distance_metrics', 'epsilon_delta'],
            '元婴': ['epsilon_delta', 'zeno_paradoxes'],
            '化神': ['staircase_paradox', 'schwarz_lantern'],
            '炼虚': ['staircase_paradox', 'schwarz_lantern']
        };
        
        const category = zoneConceptMap[zone];
        const realmConcepts = realmConceptMap[realm] || [];
        
        if (category && realmConcepts.length > 0) {
            // 随机选择一个适合的概念
            const availableConcepts = realmConcepts.filter(conceptId => {
                const concept = this.conceptLibrary.getConcept(conceptId);
                return concept && concept.category === category;
            });
            
            if (availableConcepts.length > 0) {
                return availableConcepts[Math.floor(Math.random() * availableConcepts.length)];
            }
        }
        
        return null;
    }
    
    /**
     * 批量生成题目
     */
    generateBatch(count, zone, difficulty, player = null) {
        const problems = [];
        for (let i = 0; i < count; i++) {
            problems.push(this.getProblem(zone, difficulty, null, player));
        }
        return problems;
    }
    
    /**
     * 获取概念探索题目
     */
    getConceptExplorationProblem(conceptId, difficulty = 1) {
        if (!this.conceptLibrary) {
            this.initConceptLibrary();
            return new MathProblem(difficulty, 'arithmetic');
        }
        
        const concept = this.conceptLibrary.getConcept(conceptId);
        if (!concept) {
            return new MathProblem(difficulty, 'arithmetic');
        }
        
        // 根据概念类别确定题目类型
        let topic = 'arithmetic';
        switch (concept.category) {
            case 'ARITHMETIC_FOUNDATION':
                topic = 'arithmetic';
                break;
            case 'ALGEBRAIC_THINKING':
                topic = 'algebra';
                break;
            case 'GEOMETRIC_INTUITION':
                topic = 'geometry';
                break;
            case 'LIMIT_THEORY':
                topic = 'function';
                break;
            case 'GEOMETRIC_PARADOXES':
                topic = 'geometry';
                break;
        }
        
        return new MathProblem(difficulty, topic, null, conceptId);
    }
}

