/**
 * 统一布局配置 - 所有界面共用
 * 解决UI重叠和位置混乱问题
 */

// 游戏画布尺寸
export const CANVAS = {
    WIDTH: 1200,
    HEIGHT: 800
};

// 颜色配置
export const COLORS = {
    // 背景
    BG_DARK: 0x1a1a2e,
    BG_PANEL: 0x16213e,
    BG_OVERLAY: 0x000000,
    
    // 主题色
    PRIMARY: 0x667eea,
    SECONDARY: 0x764ba2,
    ACCENT: 0xFFD700,
    
    // 状态色
    SUCCESS: 0x50e3c2,
    WARNING: 0xf5a623,
    DANGER: 0xff6b6b,
    
    // 文字
    TEXT_WHITE: '#ffffff',
    TEXT_GOLD: '#FFD700',
    TEXT_GRAY: '#aaaaaa',
    TEXT_DARK: '#666666'
};

// 字体配置
export const FONTS = {
    FAMILY: 'Microsoft YaHei, sans-serif',
    
    // 字号
    SIZE_TITLE: '36px',
    SIZE_SUBTITLE: '24px',
    SIZE_BODY: '18px',
    SIZE_SMALL: '14px',
    SIZE_BUTTON: '18px'
};

// 按钮配置
export const BUTTON = {
    // 标准按钮
    STANDARD: {
        width: 120,
        height: 45,
        fontSize: '18px',
        padding: { x: 20, y: 12 }
    },
    // 小按钮
    SMALL: {
        width: 80,
        height: 35,
        fontSize: '14px',
        padding: { x: 12, y: 8 }
    },
    // 大按钮
    LARGE: {
        width: 180,
        height: 55,
        fontSize: '22px',
        padding: { x: 30, y: 15 }
    }
};

// 弹窗/面板布局
export const PANEL = {
    // 全屏弹窗
    FULLSCREEN: {
        margin: 30,
        padding: 20,
        headerHeight: 60,
        footerHeight: 70
    },
    // 标准弹窗
    STANDARD: {
        width: 800,
        height: 600,
        padding: 20
    },
    // 小弹窗
    SMALL: {
        width: 500,
        height: 400,
        padding: 15
    }
};

// 列表/卡片布局
export const LIST = {
    CARD_HEIGHT: 90,
    CARD_GAP: 10,
    CARD_PADDING: 15,
    MAX_VISIBLE: 5
};

// 主界面按钮位置（右侧菜单）
export const MAIN_MENU_BUTTONS = {
    startX: CANVAS.WIDTH - 80,  // 右侧边距
    startY: 150,                 // 起始Y
    gap: 55,                     // 按钮间距
    width: 100,
    height: 40
};

// 深度层级（防止重叠）
export const DEPTH = {
    BACKGROUND: 0,
    GAME_OBJECTS: 10,
    UI_BASE: 100,
    UI_BUTTONS: 200,
    MODAL_OVERLAY: 500,
    MODAL_CONTENT: 510,
    TOAST: 1000
};

/**
 * 计算居中位置
 */
export function centerX() {
    return CANVAS.WIDTH / 2;
}

export function centerY() {
    return CANVAS.HEIGHT / 2;
}

/**
 * 计算列表项位置
 * @param {number} index - 项目索引
 * @param {number} startY - 起始Y坐标
 * @param {number} itemHeight - 单项高度
 * @param {number} gap - 间距
 */
export function listItemY(index, startY, itemHeight = LIST.CARD_HEIGHT, gap = LIST.CARD_GAP) {
    return startY + index * (itemHeight + gap) + itemHeight / 2;
}

/**
 * 计算网格位置
 * @param {number} index - 项目索引
 * @param {number} cols - 列数
 * @param {number} startX - 起始X
 * @param {number} startY - 起始Y
 * @param {number} cellWidth - 单元格宽度
 * @param {number} cellHeight - 单元格高度
 */
export function gridPosition(index, cols, startX, startY, cellWidth, cellHeight) {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
        x: startX + col * cellWidth + cellWidth / 2,
        y: startY + row * cellHeight + cellHeight / 2
    };
}
