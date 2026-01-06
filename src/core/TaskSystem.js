/**
 * 任务系统
 * 管理游戏中的各种任务（主线、支线、每日任务）
 */
export class TaskSystem {
    constructor() {
        this.tasks = [];
        this.completedTasks = [];
        this.dailyTasks = [];
        this.lastDailyReset = new Date().toDateString();
    }
    
    /**
     * 初始化任务
     */
    initializeTasks(player) {
        // 主线任务
        this.addTask({
            id: 'main_001',
            type: 'main',
            title: '初入仙途',
            description: '解答5道数学题目',
            target: { type: 'solve_problems', count: 5 },
            reward: { exp: 50, items: [{ id: 'herb_001', quantity: 3 }] },
            progress: 0,
            completed: false
        });
        
        this.addTask({
            id: 'main_002',
            type: 'main',
            title: '收集材料',
            description: '收集10个青灵草',
            target: { type: 'collect_item', itemId: 'herb_001', count: 10 },
            reward: { exp: 100, items: [{ id: 'ore_001', quantity: 5 }] },
            progress: 0,
            completed: false
        });
        
        this.addTask({
            id: 'main_003',
            type: 'main',
            title: '突破境界',
            description: '提升到筑基期',
            target: { type: 'reach_realm', realm: '筑基' },
            reward: { exp: 200, items: [{ id: 'herb_002', quantity: 5 }] },
            progress: 0,
            completed: false
        });
        
        // 支线任务
        this.addTask({
            id: 'side_001',
            type: 'side',
            title: '数学大师',
            description: '连续答对10道题目',
            target: { type: 'combo', count: 10 },
            reward: { exp: 150, items: [] },
            progress: 0,
            completed: false
        });
        
        this.addTask({
            id: 'side_002',
            type: 'side',
            title: '探索者',
            description: '探索3个不同的区域',
            target: { type: 'explore_zones', count: 3 },
            reward: { exp: 100, items: [{ id: 'herb_001', quantity: 10 }] },
            progress: 0,
            completed: false
        });
        
        // 初始化每日任务
        this.generateDailyTasks();
    }
    
    /**
     * 生成每日任务
     */
    generateDailyTasks() {
        const today = new Date().toDateString();
        if (today !== this.lastDailyReset) {
            this.dailyTasks = [];
            this.lastDailyReset = today;
        }
        
        if (this.dailyTasks.length === 0) {
            this.dailyTasks = [
                {
                    id: 'daily_001',
                    type: 'daily',
                    title: '每日练习',
                    description: '解答10道题目',
                    target: { type: 'solve_problems', count: 10 },
                    reward: { exp: 80, items: [{ id: 'herb_001', quantity: 5 }] },
                    progress: 0,
                    completed: false
                },
                {
                    id: 'daily_002',
                    type: 'daily',
                    title: '每日收集',
                    description: '收集5个资源',
                    target: { type: 'collect_resources', count: 5 },
                    reward: { exp: 60, items: [] },
                    progress: 0,
                    completed: false
                },
                {
                    id: 'daily_003',
                    type: 'daily',
                    title: '准确率挑战',
                    description: '保持80%以上准确率解答5题',
                    target: { type: 'accuracy_challenge', count: 5, accuracy: 80 },
                    reward: { exp: 100, items: [{ id: 'ore_001', quantity: 3 }] },
                    progress: 0,
                    completed: false,
                    correctCount: 0,
                    totalCount: 0
                }
            ];
        }
    }
    
    /**
     * 添加任务
     */
    addTask(task) {
        if (!this.tasks.find(t => t.id === task.id)) {
            this.tasks.push(task);
        }
    }
    
    /**
     * 更新任务进度
     */
    updateTaskProgress(eventType, data, player) {
        // 更新所有相关任务
        const allTasks = this.tasks.concat(this.dailyTasks);
        
        allTasks.forEach(task => {
            if (task.completed) return;
            
            let updated = false;
            
            switch (task.target.type) {
                case 'solve_problems':
                    if (eventType === 'problem_solved') {
                        task.progress++;
                        updated = true;
                    }
                    break;
                    
                case 'collect_item':
                    if (eventType === 'item_collected' && data.itemId === task.target.itemId) {
                        task.progress++;
                        updated = true;
                    }
                    break;
                    
                case 'collect_resources':
                    if (eventType === 'resource_collected') {
                        task.progress++;
                        updated = true;
                    }
                    break;
                    
                case 'reach_realm':
                    if (eventType === 'realm_up' && player.realm === task.target.realm) {
                        task.progress = task.target.count || 1;
                        updated = true;
                    }
                    break;
                    
                case 'combo':
                    if (eventType === 'combo_achieved' && data.combo >= task.target.count) {
                        task.progress = task.target.count;
                        updated = true;
                    }
                    break;
                    
                case 'explore_zones':
                    if (eventType === 'zone_entered') {
                        const uniqueZones = new Set(data.exploredZones || []);
                        task.progress = uniqueZones.size;
                        updated = true;
                    }
                    break;
                    
                case 'accuracy_challenge':
                    if (eventType === 'problem_answered') {
                        task.totalCount = (task.totalCount || 0) + 1;
                        if (data.correct) {
                            task.correctCount = (task.correctCount || 0) + 1;
                        }
                        const accuracy = task.totalCount > 0 ? (task.correctCount / task.totalCount) * 100 : 0;
                        if (task.totalCount >= task.target.count && accuracy >= task.target.accuracy) {
                            task.progress = task.target.count;
                            updated = true;
                        }
                    }
                    break;
            }
            
            // 检查任务是否完成
            if (updated && task.progress >= (task.target.count || 1)) {
                this.completeTask(task.id, player);
            }
        });
    }
    
    /**
     * 完成任务
     */
    completeTask(taskId, player) {
        const allTasks = this.tasks.concat(this.dailyTasks);
        const task = allTasks.find(t => t.id === taskId);
        
        if (!task || task.completed) return false;
        
        task.completed = true;
        this.completedTasks.push(taskId);
        
        // 发放奖励
        if (task.reward.exp) {
            player.gainExp(task.reward.exp);
        }
        
        if (task.reward.items) {
            task.reward.items.forEach(item => {
                player.addCollectible({ id: item.id, name: item.name, quantity: item.quantity });
            });
        }
        
        return true;
    }
    
    /**
     * 获取活跃任务
     */
    getActiveTasks() {
        const allTasks = this.tasks.concat(this.dailyTasks);
        return allTasks.filter(t => !t.completed);
    }
    
    /**
     * 获取已完成任务
     */
    getCompletedTasks() {
        return this.tasks.filter(t => t.completed);
    }
    
    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            tasks: this.tasks,
            completedTasks: this.completedTasks,
            dailyTasks: this.dailyTasks,
            lastDailyReset: this.lastDailyReset
        };
    }
    
    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        const system = new TaskSystem();
        system.tasks = data.tasks || [];
        system.completedTasks = data.completedTasks || [];
        system.dailyTasks = data.dailyTasks || [];
        system.lastDailyReset = data.lastDailyReset || new Date().toDateString();
        return system;
    }
}

