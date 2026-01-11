/**
 * UI管理器 - 统一管理HTML弹窗和Phaser场景的UI
 * 解决UI重叠、场景切换混乱的问题
 */
export class UIManager {
    constructor() {
        this.activeModals = new Map(); // 当前打开的弹窗
        this.modalStack = []; // 弹窗堆栈，用于管理层级
        this.container = null;
        this.initialized = false;
    }
    
    /**
     * 初始化UI容器
     */
    init() {
        if (this.initialized) return;
        
        // 创建UI容器（覆盖在Phaser画布上方）
        this.container = document.createElement('div');
        this.container.id = 'ui-container';
        this.container.innerHTML = `
            <style>
                #ui-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1000;
                    font-family: 'Microsoft YaHei', sans-serif;
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: auto;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                
                .modal-overlay.active {
                    opacity: 1;
                }
                
                .modal-panel {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 2px solid #667eea;
                    border-radius: 12px;
                    padding: 20px;
                    max-width: 90%;
                    max-height: 85%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 15px;
                }
                
                .modal-title {
                    font-size: 28px;
                    color: #FFD700;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                    margin: 0;
                }
                
                .modal-close {
                    background: #444;
                    border: none;
                    color: #fff;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.2s;
                }
                
                .modal-close:hover {
                    background: #667eea;
                    transform: scale(1.1);
                }
                
                .modal-body {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 10px;
                }
                
                .modal-footer {
                    padding-top: 15px;
                    border-top: 1px solid #333;
                    margin-top: 15px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
                
                /* 滚动条样式 */
                .modal-body::-webkit-scrollbar {
                    width: 8px;
                }
                
                .modal-body::-webkit-scrollbar-track {
                    background: #1a1a2e;
                    border-radius: 4px;
                }
                
                .modal-body::-webkit-scrollbar-thumb {
                    background: #667eea;
                    border-radius: 4px;
                }
                
                /* 通用按钮样式 */
                .ui-btn {
                    padding: 12px 30px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                
                .ui-btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .ui-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
                }
                
                .ui-btn-secondary {
                    background: #333;
                    color: #aaa;
                }
                
                .ui-btn-secondary:hover {
                    background: #444;
                    color: #fff;
                }
                
                .ui-btn-success {
                    background: linear-gradient(135deg, #50e3c2 0%, #3cba92 100%);
                    color: #1a1a2e;
                }
                
                .ui-btn-danger {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
                    color: white;
                }
                
                .ui-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none !important;
                }
            </style>
        `;
        
        // 插入到游戏容器中
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.position = 'relative';
            gameContainer.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }
        
        // 监听ESC键关闭最上层弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                const topModal = this.modalStack[this.modalStack.length - 1];
                this.closeModal(topModal);
            }
        });
        
        this.initialized = true;
        console.log('UIManager 初始化完成');
    }

    
    /**
     * 打开弹窗
     * @param {string} id - 弹窗唯一ID
     * @param {object} options - 配置选项
     */
    openModal(id, options = {}) {
        if (!this.initialized) this.init();
        
        // 如果已存在，先关闭
        if (this.activeModals.has(id)) {
            this.closeModal(id);
        }
        
        const {
            title = '弹窗',
            content = '',
            width = '800px',
            height = 'auto',
            showClose = true,
            onClose = null,
            buttons = []
        } = options;
        
        // 创建弹窗元素
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.dataset.modalId = id;
        
        let buttonsHtml = '';
        if (buttons.length > 0) {
            buttonsHtml = `<div class="modal-footer">
                ${buttons.map((btn, i) => `
                    <button class="ui-btn ui-btn-${btn.type || 'primary'}" data-btn-index="${i}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>`;
        }
        
        overlay.innerHTML = `
            <div class="modal-panel" style="width: ${width}; height: ${height};">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    ${showClose ? '<button class="modal-close">×</button>' : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttonsHtml}
            </div>
        `;
        
        this.container.appendChild(overlay);
        
        // 绑定关闭按钮
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(id));
        }
        
        // 绑定按钮事件
        buttons.forEach((btn, i) => {
            const btnEl = overlay.querySelector(`[data-btn-index="${i}"]`);
            if (btnEl && btn.onClick) {
                btnEl.addEventListener('click', () => btn.onClick(this, id));
            }
        });
        
        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(id);
            }
        });
        
        // 保存引用
        this.activeModals.set(id, { overlay, onClose, options });
        this.modalStack.push(id);
        
        // 动画显示
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        return overlay;
    }
    
    /**
     * 关闭弹窗
     */
    closeModal(id) {
        const modal = this.activeModals.get(id);
        if (!modal) return;
        
        const { overlay, onClose } = modal;
        
        // 动画隐藏
        overlay.classList.remove('active');
        
        setTimeout(() => {
            overlay.remove();
            this.activeModals.delete(id);
            
            const stackIndex = this.modalStack.indexOf(id);
            if (stackIndex > -1) {
                this.modalStack.splice(stackIndex, 1);
            }
            
            if (onClose) onClose();
        }, 200);
    }
    
    /**
     * 关闭所有弹窗
     */
    closeAll() {
        [...this.activeModals.keys()].forEach(id => this.closeModal(id));
    }
    
    /**
     * 更新弹窗内容
     */
    updateModalContent(id, content) {
        const modal = this.activeModals.get(id);
        if (!modal) return;
        
        const body = modal.overlay.querySelector('.modal-body');
        if (body) {
            body.innerHTML = content;
        }
    }
    
    /**
     * 获取弹窗DOM元素
     */
    getModalElement(id) {
        const modal = this.activeModals.get(id);
        return modal ? modal.overlay : null;
    }
    
    /**
     * 显示提示消息
     */
    showToast(message, type = 'info', duration = 2000) {
        if (!this.initialized) this.init();
        
        const colors = {
            info: '#667eea',
            success: '#50e3c2',
            warning: '#f5a623',
            error: '#ff6b6b'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            pointer-events: auto;
            transition: transform 0.3s ease;
            z-index: 2000;
        `;
        toast.textContent = message;
        
        this.container.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// 全局单例
export const uiManager = new UIManager();
