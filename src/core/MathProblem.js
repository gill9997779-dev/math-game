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
     */
    generateGeometry() {
        const shapes = [
            {
                problem: (r) => {
                    const radius = Math.floor(Math.random() * 10) + 1;
                    // 使用题目中说明的 π ≈ 3.14，而不是 Math.PI
                    const area = Math.round(3.14 * radius * radius);
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
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
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
    }
    
    /**
     * 根据区域、难度和数学之灵名称获取题目
     */
    getProblem(zone, difficulty, spiritName = null) {
        const topicMap = {
            '青石村': 'arithmetic',
            '五行山': 'algebra',
            '上古遗迹': 'geometry',
            '天外天': 'function',
            '天机阁': 'fraction' // 默认使用分数，但会根据数学之灵名称调整
        };
        
        let topic = topicMap[zone] || 'arithmetic';
        
        // 根据数学之灵名称确定具体的运算类型和题目类型
        let operation = null;
        if (spiritName) {
            if (spiritName.includes('分数')) {
                topic = 'fraction';
            } else if (spiritName.includes('小数')) {
                topic = 'decimal';
            } else if (spiritName.includes('加法') || spiritName.includes('加')) {
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

