// LoginScene - 使用测试页面验证过的布局
import { DynamicBackground } from '../core/DynamicBackground.js';
import { Logger } from '../core/Logger.js';

const Scene = Phaser.Scene;

export class LoginScene extends Scene {
    constructor() {
        super({ key: 'LoginScene' });
        this.username = '';
    }
    
    create(data = {}) {
        Logger.info('LoginScene 创建');
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        
        this.isNewGame = data.isNewGame || false;
        this.loadGame = data.loadGame || false;
        
        // 背景
        this.dynamicBg = new DynamicBackground(this);
        this.dynamicBg.create();
        
        // 标题
        this.add.text(W/2, 30, '數道仙途', { fontSize: '24px', fill: '#FFD700', stroke: '#FFA500', strokeThickness: 2 }).setOrigin(0.5).setDepth(100);
        
        // 副标题
        const subtitle = this.isNewGame ? '请输入用户名（新游戏）' : this.loadGame ? '请输入用户名（继续游戏）' : '请输入用户名';
        this.add.text(W/2, 60, subtitle, { fontSize: '14px', fill: '#E8D5B7' }).setOrigin(0.5).setDepth(100);
        
        // 输入框 y=100
        this.add.rectangle(W/2, 100, 280, 36, 0x1a1a1a, 0.9).setStrokeStyle(2, 0xFFD700).setDepth(100);
        this.inputText = this.add.text(W/2, 100, '', { fontSize: '18px', fill: '#FFF' }).setOrigin(0.5).setDepth(101);
        this.cursor = this.add.text(W/2, 100, '|', { fontSize: '18px', fill: '#FFD700' }).setOrigin(0.5).setDepth(101);
        this.tweens.add({ targets: this.cursor, alpha: 0, duration: 500, yoyo: true, repeat: -1 });
        
        // 键盘参数 - 与测试页面完全相同
        const btnSize = 30;
        const gapX = 34;
        const gapY = 38;
        const startY = 150;
        
        // 4行字母数字键 - 每行独立居中
        const rows = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
        
        rows.forEach((row, rowIndex) => {
            const chars = row.split('');
            const rowWidth = (chars.length - 1) * gapX; // 修正：按钮之间的总宽度
            const startX = (W - rowWidth) / 2; // 居中起始位置
            const y = startY + rowIndex * gapY;
            
            chars.forEach((char, charIndex) => {
                const x = startX + charIndex * gapX;
                this.createButton(x, y, btnSize, btnSize, char, () => this.addChar(char));
            });
        });
        
        // 特殊按键行
        const specialY = startY + 4 * gapY + 15;
        const spaceW = 100;
        const backW = 70;
        const clearW = 55;
        const gap = 10;
        const totalW = spaceW + backW + clearW + gap * 2;
        const specialStartX = (W - totalW) / 2;
        
        this.createButton(specialStartX + spaceW/2, specialY, spaceW, btnSize, '空格', () => this.addChar(' '), 0x3a5a8a);
        this.createButton(specialStartX + spaceW + gap + backW/2, specialY, backW, btnSize, '退格', () => this.delChar(), 0x8a5a3a);
        this.createButton(specialStartX + spaceW + gap + backW + gap + clearW/2, specialY, clearW, btnSize, '清空', () => this.clearAll(), 0x5a3a3a);
        
        // 底部按钮
        const btnY = H - 50;
        this.createButton(W/2 - 60, btnY, 80, 32, '确认', () => this.onConfirm(), 0x4CAF50);
        this.createButton(W/2 + 60, btnY, 80, 32, '返回', () => this.scene.start('MainMenuScene'), 0xf44336);
    }
    
    createButton(x, y, w, h, label, callback, color = 0x3a3a3a) {
        const bg = this.add.rectangle(x, y, w, h, color, 0.9).setStrokeStyle(1, 0x666666).setInteractive({ useHandCursor: true }).setDepth(100);
        const txt = this.add.text(x, y, label, { fontSize: label.length > 1 ? '11px' : '14px', fill: '#FFFFFF' }).setOrigin(0.5).setDepth(101);
        
        bg.on('pointerdown', () => { callback(); bg.setFillStyle(0x6a6a6a); txt.setTint(0xFFD700); });
        bg.on('pointerup', () => { bg.setFillStyle(color); txt.clearTint(); });
        bg.on('pointerout', () => { bg.setFillStyle(color); txt.clearTint(); });
    }
    
    addChar(c) {
        if (this.username.length < 20) {
            this.username += c;
            this.inputText.setText(this.username);
            this.cursor.x = this.inputText.x + this.inputText.width / 2 + 5;
        }
    }
    
    delChar() {
        this.username = this.username.slice(0, -1);
        this.inputText.setText(this.username);
        this.cursor.x = this.inputText.x + this.inputText.width / 2 + 5;
    }
    
    clearAll() {
        this.username = '';
        this.inputText.setText(this.username);
        this.cursor.x = this.inputText.x + 5;
    }
    
    onConfirm() {
        if (this.username.trim().length < 2) {
            this.showMsg('用户名至少需要2个字符');
            return;
        }
        window.gameData = window.gameData || {};
        window.gameData.username = this.username.trim();
        Logger.info('用户名:', window.gameData.username);
        
        if (this.isNewGame) {
            this.scene.start('GameScene', { isNewGame: true });
        } else if (this.loadGame) {
            this.loadData();
        } else {
            this.scene.start('GameScene');
        }
    }
    
    showMsg(m) {
        if (this.msgText) this.msgText.destroy();
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        this.msgText = this.add.text(W/2, H/2, m, { fontSize: '14px', fill: '#ff6b6b', backgroundColor: '#000000', padding: { x: 10, y: 5 } }).setOrigin(0.5).setDepth(200);
        this.time.delayedCall(2000, () => { if (this.msgText) { this.msgText.destroy(); this.msgText = null; } });
    }
    
    async loadData() {
        try {
            const res = await fetch('/api/load', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: this.username.trim() }) });
            if (res.ok) {
                const d = await res.json();
                if (d.success && d.playerData) {
                    this.scene.start('GameScene', { loadedData: d.playerData, isLoadGame: true });
                } else {
                    this.showMsg('未找到存档，开始新游戏');
                    this.time.delayedCall(1500, () => this.scene.start('GameScene', { isNewGame: true }));
                }
            }
        } catch (e) {
            this.showMsg('加载失败，开始新游戏');
            this.time.delayedCall(1500, () => this.scene.start('GameScene', { isNewGame: true }));
        }
    }
    
    shutdown() {
        if (this.dynamicBg) this.dynamicBg.destroy();
    }
}
