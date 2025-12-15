/**
 * 数学题目类
 * 生成和管理数学题目
 */
export class MathProblem {
    constructor(difficulty = 1, topic = 'arithmetic', operation = null) {
        this.difficulty = difficulty;
        this.topic = topic;
        this.operation = operation; // 指定具体的运算类型：'+', '-', '*', '/'
        this.problem = '';
        this.correctAnswer = 0;
        this.options = [];
        this.generate();
    }
    
    /**
     * 根据难度和主题生成题目
     */
    generate() {
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
            default:
                this.generateArithmetic();
        }
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
                a = Math.floor(Math.random() * 50 * this.difficulty) + 20;
                b = Math.floor(Math.random() * a) + 1;
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
     */
    generateGeometry() {
        const shapes = [
            {
                problem: (r) => {
                    const radius = Math.floor(Math.random() * 10) + 1;
                    const area = Math.round(Math.PI * radius * radius);
                    return { problem: `圆的半径为 ${radius}，面积是多少？（π ≈ 3.14）`, answer: area };
                }
            },
            {
                problem: (r) => {
                    const width = Math.floor(Math.random() * 10) + 1;
                    const height = Math.floor(Math.random() * 10) + 1;
                    const area = width * height;
                    return { problem: `长方形的长为 ${width}，宽为 ${height}，面积是多少？`, answer: area };
                }
            },
            {
                problem: (r) => {
                    const base = Math.floor(Math.random() * 10) + 1;
                    const height = Math.floor(Math.random() * 10) + 1;
                    const area = Math.round((base * height) / 2);
                    return { problem: `三角形的底为 ${base}，高为 ${height}，面积是多少？`, answer: area };
                }
            }
        ];
        
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const result = shape.problem();
        this.problem = result.problem;
        this.correctAnswer = result.answer;
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
     * 生成选项（正确答案 + 3个干扰项）
     */
    generateOptions() {
        const options = [this.correctAnswer];
        
        // 生成干扰项
        while (options.length < 4) {
            let wrongAnswer;
            if (this.correctAnswer === 0) {
                wrongAnswer = Math.floor(Math.random() * 20) - 10;
            } else {
                const offset = Math.floor(Math.random() * (Math.abs(this.correctAnswer) + 10)) + 1;
                wrongAnswer = this.correctAnswer + (Math.random() > 0.5 ? offset : -offset);
            }
            
            if (!options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        
        // 打乱选项顺序
        this.options = this.shuffleArray(options);
    }
    
    /**
     * 打乱数组
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * 检查答案
     */
    checkAnswer(answer) {
        return Math.abs(answer - this.correctAnswer) < 0.01;
    }
}

/**
 * 题目库管理器
 */
export class ProblemBank {
    constructor() {
        this.problems = [];
    }
    
    /**
     * 根据区域、难度和数学之灵名称获取题目
     */
    getProblem(zone, difficulty, spiritName = null) {
        const topicMap = {
            '青石村': 'arithmetic',
            '五行山': 'algebra',
            '上古遗迹': 'geometry',
            '天外天': 'function'
        };
        
        const topic = topicMap[zone] || 'arithmetic';
        
        // 根据数学之灵名称确定具体的运算类型
        let operation = null;
        if (spiritName) {
            if (spiritName.includes('加法') || spiritName.includes('加')) {
                operation = '+';
            } else if (spiritName.includes('减法') || spiritName.includes('减')) {
                operation = '-';
            } else if (spiritName.includes('乘法') || spiritName.includes('乘')) {
                operation = '*';
            } else if (spiritName.includes('除法') || spiritName.includes('除')) {
                operation = '/';
            }
        }
        
        return new MathProblem(difficulty, topic, operation);
    }
    
    /**
     * 批量生成题目
     */
    generateBatch(count, zone, difficulty) {
        const problems = [];
        for (let i = 0; i < count; i++) {
            problems.push(this.getProblem(zone, difficulty));
        }
        return problems;
    }
}

