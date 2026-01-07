/**
 * 增强版数学题目系统
 * 更多趣味性题型和情境化问题
 */

export class EnhancedMathProblem {
    constructor(difficulty = 1, topic = 'arithmetic', options = {}) {
        this.difficulty = difficulty;
        this.topic = topic;
        this.problem = '';
        this.correctAnswer = 0;
        this.options = [];
        this.explanation = '';
        this.hint = '';
        this.category = '';
        this.storyContext = '';
        
        this.generate();
    }
    
    generate() {
        // 随机选择题目类型增加趣味性
        const generators = [
            () => this.generateStoryProblem(),
            () => this.generatePatternProblem(),
            () => this.generateVisualProblem(),
            () => this.generateSpeedProblem(),
            () => this.generateLogicProblem()
        ];
        
        // 根据难度选择合适的生成器
        if (this.difficulty <= 2) {
            // 低难度：故事题和速算题为主
            const simpleGenerators = [
                () => this.generateStoryProblem(),
                () => this.generateSpeedProblem(),
                () => this.generatePatternProblem()
            ];
            simpleGenerators[Math.floor(Math.random() * simpleGenerators.length)]();
        } else {
            generators[Math.floor(Math.random() * generators.length)]();
        }
    }
    
    /**
     * 生成故事情境题
     */
    generateStoryProblem() {
        this.category = '修仙故事';
        
        const stories = [
            this.generatePillStory(),
            this.generateSpiritStoneStory(),
            this.generateCultivationStory(),
            this.generateBattleStory(),
            this.generateTreasureStory()
        ];
        
        const story = stories[Math.floor(Math.random() * stories.length)];
        this.problem = story.problem;
        this.correctAnswer = story.answer;
        this.storyContext = story.context;
        this.hint = story.hint;
        this.generateOptions();
    }
    
    generatePillStory() {
        const pills = Math.floor(Math.random() * 10 * this.difficulty) + 5;
        const days = Math.floor(Math.random() * 5) + 2;
        const perDay = Math.floor(pills / days);
        const answer = pills - perDay * days;
        
        return {
            context: '炼丹',
            problem: `道友炼制了 ${pills} 颗回气丹，每天服用 ${perDay} 颗修炼。${days} 天后还剩多少颗？`,
            answer: answer,
            hint: `总数 - 每天用量 × 天数`
        };
    }
    
    generateSpiritStoneStory() {
        const stones = Math.floor(Math.random() * 100 * this.difficulty) + 50;
        const spend = Math.floor(Math.random() * stones * 0.6) + 10;
        const earn = Math.floor(Math.random() * 50) + 20;
        
        return {
            context: '灵石交易',
            problem: `你有 ${stones} 块灵石，购买法器花费 ${spend} 块，完成任务获得 ${earn} 块。现在有多少灵石？`,
            answer: stones - spend + earn,
            hint: `原有 - 花费 + 获得`
        };
    }
    
    generateCultivationStory() {
        const baseExp = Math.floor(Math.random() * 50 * this.difficulty) + 20;
        const multiplier = Math.floor(Math.random() * 3) + 2;
        const bonus = Math.floor(Math.random() * 20) + 10;
        
        return {
            context: '修炼',
            problem: `基础修为 ${baseExp} 点，使用悟性丹后效果翻 ${multiplier} 倍，再加上连击奖励 ${bonus} 点。总共获得多少修为？`,
            answer: baseExp * multiplier + bonus,
            hint: `基础 × 倍数 + 奖励`
        };
    }
    
    generateBattleStory() {
        const playerAtk = Math.floor(Math.random() * 50 * this.difficulty) + 30;
        const enemyDef = Math.floor(Math.random() * 20) + 10;
        const hits = Math.floor(Math.random() * 3) + 2;
        
        return {
            context: '战斗',
            problem: `你的攻击力 ${playerAtk}，妖兽防御 ${enemyDef}。每次攻击造成（攻击-防御）点伤害，${hits} 次攻击共造成多少伤害？`,
            answer: (playerAtk - enemyDef) * hits,
            hint: `(攻击 - 防御) × 次数`
        };
    }
    
    generateTreasureStory() {
        const total = Math.floor(Math.random() * 100) + 50;
        const ratio1 = Math.floor(Math.random() * 3) + 2;
        const ratio2 = Math.floor(Math.random() * 2) + 1;
        const totalRatio = ratio1 + ratio2;
        
        return {
            context: '分宝',
            problem: `发现 ${total} 块灵石，按 ${ratio1}:${ratio2} 分配。多的一方得到多少？`,
            answer: Math.floor(total * ratio1 / totalRatio),
            hint: `总数 × 较大比例 ÷ 比例之和`
        };
    }
    
    /**
     * 生成规律题
     */
    generatePatternProblem() {
        this.category = '找规律';
        
        const patterns = [
            this.generateArithmeticSequence(),
            this.generateGeometricSequence(),
            this.generateFibonacciLike(),
            this.generateAlternatingPattern()
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        this.problem = pattern.problem;
        this.correctAnswer = pattern.answer;
        this.hint = pattern.hint;
        this.generateOptions();
    }
    
    generateArithmeticSequence() {
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = Math.floor(Math.random() * 5 * this.difficulty) + 2;
        const sequence = [start, start + diff, start + diff * 2, start + diff * 3];
        const answer = start + diff * 4;
        
        return {
            problem: `找规律填空：${sequence.join(', ')}, ?`,
            answer: answer,
            hint: `每个数比前一个多 ${diff}`
        };
    }
    
    generateGeometricSequence() {
        const start = Math.floor(Math.random() * 3) + 1;
        const ratio = 2;
        const sequence = [start, start * ratio, start * ratio * ratio];
        const answer = start * ratio * ratio * ratio;
        
        return {
            problem: `找规律填空：${sequence.join(', ')}, ?`,
            answer: answer,
            hint: `每个数是前一个的 ${ratio} 倍`
        };
    }
    
    generateFibonacciLike() {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const sequence = [a, b, a + b, b + a + b];
        const answer = a + b + b + a + b;
        
        return {
            problem: `找规律填空：${sequence.join(', ')}, ?`,
            answer: answer,
            hint: `每个数等于前两个数之和`
        };
    }
    
    generateAlternatingPattern() {
        const base = Math.floor(Math.random() * 10) + 5;
        const add = Math.floor(Math.random() * 3) + 1;
        const sub = Math.floor(Math.random() * 2) + 1;
        const sequence = [base, base + add, base + add - sub, base + add - sub + add];
        const answer = base + add - sub + add - sub;
        
        return {
            problem: `找规律填空：${sequence.join(', ')}, ?`,
            answer: answer,
            hint: `交替加 ${add} 和减 ${sub}`
        };
    }
    
    /**
     * 生成图形/视觉题
     */
    generateVisualProblem() {
        this.category = '图形计算';
        
        const visuals = [
            this.generateShapeCount(),
            this.generateAreaProblem(),
            this.generateAngleProblem()
        ];
        
        const visual = visuals[Math.floor(Math.random() * visuals.length)];
        this.problem = visual.problem;
        this.correctAnswer = visual.answer;
        this.hint = visual.hint;
        this.generateOptions();
    }
    
    generateShapeCount() {
        const rows = Math.floor(Math.random() * 3) + 2;
        const cols = Math.floor(Math.random() * 3) + 2;
        const shapes = ['○', '□', '△'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        return {
            problem: `阵法中有 ${rows} 行 ${cols} 列的 ${shape}，共有多少个？`,
            answer: rows * cols,
            hint: `行数 × 列数`
        };
    }
    
    generateAreaProblem() {
        const side = Math.floor(Math.random() * 10 * this.difficulty) + 3;
        const shapes = [
            { name: '正方形法阵', formula: '边长²', answer: side * side },
            { name: '长方形结界', formula: '长 × 宽', answer: side * (side + 2) }
        ];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        if (shape.name === '正方形法阵') {
            return {
                problem: `${shape.name}边长为 ${side}，面积是多少？`,
                answer: shape.answer,
                hint: shape.formula
            };
        } else {
            return {
                problem: `${shape.name}长 ${side + 2}，宽 ${side}，面积是多少？`,
                answer: shape.answer,
                hint: shape.formula
            };
        }
    }
    
    generateAngleProblem() {
        const angles = [30, 45, 60, 90, 120];
        const angle1 = angles[Math.floor(Math.random() * angles.length)];
        const answer = 180 - angle1;
        
        return {
            problem: `三角阵法中，已知一个角是 ${angle1}°，另一个角是 90°，第三个角是多少度？`,
            answer: answer,
            hint: `三角形内角和 = 180°`
        };
    }
    
    /**
     * 生成速算题
     */
    generateSpeedProblem() {
        this.category = '速算';
        
        const operations = ['+', '-', '×', '÷'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        let a, b, answer;
        
        switch (op) {
            case '+':
                a = Math.floor(Math.random() * 50 * this.difficulty) + 10;
                b = Math.floor(Math.random() * 50 * this.difficulty) + 10;
                answer = a + b;
                this.problem = `${a} + ${b} = ?`;
                this.hint = '直接相加';
                break;
            case '-':
                a = Math.floor(Math.random() * 50 * this.difficulty) + 30;
                b = Math.floor(Math.random() * (a - 5)) + 5;
                answer = a - b;
                this.problem = `${a} - ${b} = ?`;
                this.hint = '直接相减';
                break;
            case '×':
                a = Math.floor(Math.random() * 12 * this.difficulty) + 2;
                b = Math.floor(Math.random() * 12) + 2;
                answer = a * b;
                this.problem = `${a} × ${b} = ?`;
                this.hint = '乘法口诀';
                break;
            case '÷':
                b = Math.floor(Math.random() * 10) + 2;
                answer = Math.floor(Math.random() * 10 * this.difficulty) + 2;
                a = b * answer;
                this.problem = `${a} ÷ ${b} = ?`;
                this.hint = '想乘法';
                break;
        }
        
        this.correctAnswer = answer;
        this.generateOptions();
    }
    
    /**
     * 生成逻辑推理题
     */
    generateLogicProblem() {
        this.category = '逻辑推理';
        
        const logics = [
            this.generateComparisonLogic(),
            this.generateDeductionLogic()
        ];
        
        const logic = logics[Math.floor(Math.random() * logics.length)];
        this.problem = logic.problem;
        this.correctAnswer = logic.answer;
        this.hint = logic.hint;
        this.options = logic.options || [];
        
        if (this.options.length === 0) {
            this.generateOptions();
        }
    }
    
    generateComparisonLogic() {
        const names = ['张三', '李四', '王五'];
        const values = [
            Math.floor(Math.random() * 50) + 10,
            Math.floor(Math.random() * 50) + 10,
            Math.floor(Math.random() * 50) + 10
        ].sort((a, b) => b - a);
        
        return {
            problem: `${names[0]}有 ${values[0]} 块灵石，${names[1]}有 ${values[1]} 块，${names[2]}有 ${values[2]} 块。谁的灵石最多？`,
            answer: 0,
            options: names,
            hint: '比较数字大小'
        };
    }
    
    generateDeductionLogic() {
        const total = Math.floor(Math.random() * 50) + 30;
        const part1 = Math.floor(total * 0.4);
        const part2 = total - part1;
        
        return {
            problem: `甲乙共有 ${total} 块灵石，甲比乙多 ${part1 - part2} 块。甲有多少块？`,
            answer: part1,
            hint: '设甲为x，则乙为(总数-x)，甲-乙=差'
        };
    }
    
    /**
     * 生成选项
     */
    generateOptions() {
        const correct = this.correctAnswer;
        const options = [correct];
        
        // 生成干扰项
        while (options.length < 4) {
            let wrong;
            const variation = Math.floor(Math.random() * 3);
            
            switch (variation) {
                case 0:
                    wrong = correct + Math.floor(Math.random() * 10) + 1;
                    break;
                case 1:
                    wrong = correct - Math.floor(Math.random() * 10) - 1;
                    break;
                case 2:
                    wrong = correct * 2;
                    break;
            }
            
            if (wrong > 0 && !options.includes(wrong)) {
                options.push(wrong);
            }
        }
        
        // 打乱选项
        this.options = options.sort(() => Math.random() - 0.5);
    }
    
    /**
     * 检查答案
     */
    checkAnswer(answer) {
        const numAnswer = typeof answer === 'string' ? parseFloat(answer) : answer;
        return Math.abs(numAnswer - this.correctAnswer) < 0.01;
    }
}

export default EnhancedMathProblem;
