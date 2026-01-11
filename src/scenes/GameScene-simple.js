// 简化版 GameScene - 用于测试
const Scene = Phaser.Scene;

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create(data = {}) {
        console.log('=== GameScene create() 被调用 ===');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建简单背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // 显示标题
        this.add.text(width / 2, height / 2 - 100, '数道仙途', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Microsoft YaHei, Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // 显示在线时长测试信息
        this.add.text(width / 2, height / 2, '在线时长记录功能测试', {
            fontSize: '24px',
            fill: '#50E3C2',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        // 显示状态
        this.add.text(width / 2, height / 2 + 50, '✅ 游戏加载成功！', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Microsoft YaHei, Arial'
        }).setOrigin(0.5);
        
        // 简单的在线时长显示（不依赖复杂的系统）
        this.timeText = this.add.text(width - 150, 30, '00:00:00', {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // 简单的时长计数器
        this.startTime = Date.now();
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTime,
            callbackScope: this,
            loop: true
        });
        
        console.log('✅ 简化版 GameScene 初始化完成');
    }
    
    updateTime() {
        if (this.timeText) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.timeText.setText(timeString);
        }
    }
}