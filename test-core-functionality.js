/**
 * 核心功能测试脚本
 * 在Node.js环境中测试核心逻辑
 */

// 模拟浏览器环境
if (typeof global !== 'undefined') {
    global.window = global.window || {};
    if (!global.navigator) {
        global.navigator = { userAgent: 'test' };
    }
}

async function testEnhancedMathProblem() {
    console.log('🧮 测试增强版数学题目系统...');
    
    try {
        // 动态导入模块
        const { EnhancedMathProblem } = await import('./src/core/EnhancedMathProblem.js');
        
        // 测试不同难度和类型的题目
        const testCases = [
            { difficulty: 1, topic: 'arithmetic' },
            { difficulty: 2, topic: 'arithmetic' },
            { difficulty: 3, topic: 'arithmetic' }
        ];
        
        for (const testCase of testCases) {
            const problem = new EnhancedMathProblem(testCase.difficulty, testCase.topic);
            
            console.log(`  ✓ 难度${testCase.difficulty}: ${problem.category}`);
            console.log(`    题目: ${problem.problem}`);
            console.log(`    答案: ${problem.correctAnswer}`);
            console.log(`    选项: ${problem.options.join(', ')}`);
            console.log(`    提示: ${problem.hint}`);
            
            // 验证题目完整性
            if (!problem.problem || problem.correctAnswer === undefined || problem.options.length === 0) {
                throw new Error(`题目生成不完整: 难度${testCase.difficulty}`);
            }
            
            // 验证答案检查
            const isCorrect = problem.checkAnswer(problem.correctAnswer);
            if (!isCorrect) {
                throw new Error(`答案检查失败: ${problem.correctAnswer}`);
            }
            
            console.log(`    ✅ 答案验证通过\n`);
        }
        
        console.log('✅ 增强版数学题目系统测试通过！\n');
        return true;
        
    } catch (error) {
        console.error('❌ 增强版数学题目系统测试失败:', error.message);
        return false;
    }
}

async function testRewardSystem() {
    console.log('🎁 测试奖励系统...');
    
    try {
        const { RewardSystem } = await import('./src/core/RewardSystem.js');
        
        const rewardSystem = new RewardSystem();
        
        // 测试答题奖励计算
        const mockPlayer = { realm: '筑基', getExpMultiplier: () => 1.2 };
        const reward = rewardSystem.calculateAnswerReward(true, 5, 2, mockPlayer);
        
        console.log(`  ✓ 答题奖励计算:`);
        console.log(`    基础奖励: ${reward.exp} 经验, ${reward.gold} 金币`);
        console.log(`    连击奖励: ${reward.bonus.length} 个额外奖励`);
        
        if (reward.exp <= 0) {
            throw new Error('奖励经验值应该大于0');
        }
        
        // 测试掉落系统
        console.log(`  ✓ 掉落系统测试:`);
        for (let i = 0; i < 5; i++) {
            const drop = rewardSystem.generateRandomDrop(2, 3);
            if (drop) {
                console.log(`    掉落: ${drop.name} (${drop.rarity}) x${drop.quantity}`);
            } else {
                console.log(`    本次无掉落`);
            }
        }
        
        // 测试每日奖励
        const dailyReward = rewardSystem.getDailyReward(1);
        console.log(`  ✓ 每日奖励: ${dailyReward.rewards.length} 个奖励项`);
        
        console.log('✅ 奖励系统测试通过！\n');
        return true;
        
    } catch (error) {
        console.error('❌ 奖励系统测试失败:', error.message);
        return false;
    }
}

async function testUIComponents() {
    console.log('🎨 测试UI组件系统...');
    
    try {
        const { UIComponents } = await import('./src/core/UIComponents.js');
        
        // 创建模拟场景
        const mockScene = {
            add: {
                graphics: () => ({
                    fillStyle: () => {},
                    fillRect: () => {},
                    lineStyle: () => {},
                    strokeRoundedRect: () => {},
                    clear: () => {},
                    setDepth: () => {}
                }),
                text: () => ({
                    setOrigin: () => ({ setDepth: () => {} }),
                    setDepth: () => {},
                    setInteractive: () => ({ on: () => {} })
                }),
                rectangle: () => ({
                    setStrokeStyle: () => {},
                    setInteractive: () => ({ on: () => {} }),
                    setDepth: () => {}
                }),
                container: () => ({
                    add: () => {},
                    setDepth: () => {},
                    updateProgress: () => {}
                }),
                circle: () => ({ setStrokeStyle: () => {} })
            },
            tweens: { add: () => {} },
            cameras: { main: { width: 800, height: 600 } },
            time: { delayedCall: () => {} }
        };
        
        const ui = new UIComponents(mockScene);
        
        console.log('  ✓ UIComponents 实例创建成功');
        
        // 测试组件创建方法是否存在
        const methods = [
            'createGradientButton',
            'createCard', 
            'createProgressBar',
            'createIconButton',
            'createTabs',
            'showNotification',
            'showConfirmDialog'
        ];
        
        for (const method of methods) {
            if (typeof ui[method] !== 'function') {
                throw new Error(`方法 ${method} 不存在`);
            }
            console.log(`    ✓ ${method} 方法存在`);
        }
        
        console.log('✅ UI组件系统测试通过！\n');
        return true;
        
    } catch (error) {
        console.error('❌ UI组件系统测试失败:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 开始运行核心功能测试...\n');
    
    const results = [];
    
    results.push(await testEnhancedMathProblem());
    results.push(await testRewardSystem());
    results.push(await testUIComponents());
    
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    console.log('📊 测试结果汇总:');
    console.log(`  通过: ${passedTests}/${totalTests}`);
    console.log(`  成功率: ${Math.round(passedTests / totalTests * 100)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有核心功能测试通过！');
        process.exit(0);
    } else {
        console.log('⚠️  部分测试失败，请检查错误信息');
        process.exit(1);
    }
}

// 运行测试
runAllTests().catch(error => {
    console.error('💥 测试运行失败:', error);
    process.exit(1);
});