# 按钮自定义指南

本指南将教你如何为游戏添加自定义的按钮图片和模型。

## 目录结构

建议的资源目录结构：
```
项目根目录/
├── assets/
│   ├── images/
│   │   ├── buttons/
│   │   │   ├── button_normal.png      # 普通状态按钮
│   │   │   ├── button_hover.png       # 悬停状态按钮
│   │   │   ├── button_pressed.png     # 按下状态按钮
│   │   │   ├── option_button.png      # 选项按钮
│   │   │   └── option_button_hover.png
│   │   ├── ui/
│   │   │   ├── close_button.png
│   │   │   └── ...
│   │   └── ...
│   └── ...
```

## 步骤 1: 准备图片资源

1. 准备你的按钮图片（PNG 格式，支持透明背景）
2. 建议尺寸：
   - 普通按钮：200x60 像素
   - 选项按钮：300x80 像素
   - 小按钮：150x40 像素

## 步骤 2: 在 PreloadScene 中加载资源

编辑 `src/scenes/PreloadScene.js`，在 `preload()` 方法中添加：

```javascript
preload() {
    // ... 现有代码 ...
    
    // 加载按钮图片
    this.load.image('button_normal', 'assets/images/buttons/button_normal.png');
    this.load.image('button_hover', 'assets/images/buttons/button_hover.png');
    this.load.image('option_button', 'assets/images/buttons/option_button.png');
    this.load.image('option_button_hover', 'assets/images/buttons/option_button_hover.png');
}
```

## 步骤 3: 使用图片按钮

### 方法 1: 使用 ButtonFactory（推荐）

```javascript
import { ButtonFactory } from '../core/ButtonFactory.js';

// 创建图片按钮
const startButton = ButtonFactory.createImageButton(
    this,                    // scene
    width / 2,              // x
    height / 2,             // y
    'button_normal',        // 普通状态图片键名
    'button_hover',         // 悬停状态图片键名（可选）
    '开始游戏',             // 按钮文字（可选）
    () => {                 // 点击回调
        this.scene.start('GameScene');
    },
    {
        scale: 1,           // 缩放比例
        textStyle: {        // 文字样式
            fontSize: '24px',
            fill: '#FFFFFF'
        },
        depth: 10           // 深度层级
    }
);
```

### 方法 2: 直接使用 Phaser API

```javascript
// 创建图片精灵
const button = this.add.image(x, y, 'button_normal');
button.setInteractive({ useHandCursor: true });

// 添加文字（可选）
const text = this.add.text(x, y, '按钮文字', {
    fontSize: '24px',
    fill: '#FFFFFF'
});
text.setOrigin(0.5);

// 点击事件
button.on('pointerdown', () => {
    // 处理点击
});

// 悬停效果
button.on('pointerover', () => {
    button.setTexture('button_hover'); // 切换图片
});

button.on('pointerout', () => {
    button.setTexture('button_normal'); // 恢复原图
});
```

## 步骤 4: 修改现有场景使用图片按钮

### 示例：修改 MathChallengeScene 的选项按钮

```javascript
import { ButtonFactory } from '../core/ButtonFactory.js';

// 在 create() 方法中
this.currentProblem.options.forEach((option, index) => {
    const buttonY = optionY + index * spacing;
    
    // 使用图片按钮替代文本按钮
    const button = ButtonFactory.createImageButton(
        this,
        width / 2,
        buttonY,
        'option_button',           // 普通状态
        'option_button_hover',     // 悬停状态
        `${String.fromCharCode(65 + index)}. ${option}`, // 文字
        () => this.selectAnswer(option),
        {
            scale: 1,
            textStyle: {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontFamily: 'Arial, sans-serif'
            }
        }
    );
    
    this.optionButtons.push(button);
});
```

## 步骤 5: 使用图形按钮（无需图片）

如果暂时没有图片，可以使用图形按钮：

```javascript
import { ButtonFactory } from '../core/ButtonFactory.js';

const button = ButtonFactory.createShapeButton(
    this,
    width / 2,
    height / 2,
    200,                    // 宽度
    60,                     // 高度
    0x667eea,              // 颜色
    '开始游戏',             // 文字
    () => {
        // 点击处理
    },
    {
        borderRadius: 10,    // 圆角半径
        hoverColor: 0x764ba2, // 悬停颜色
        textStyle: {
            fontSize: '24px',
            fill: '#FFFFFF'
        }
    }
);
```

## 高级用法

### 使用精灵图集（Spritesheet）

如果有多帧动画按钮：

```javascript
// 在 PreloadScene 中加载
this.load.spritesheet('button_frames', 'assets/images/button_frames.png', {
    frameWidth: 200,
    frameHeight: 60
});

// 使用
const button = this.add.sprite(x, y, 'button_frames', 0);
button.setInteractive({ useHandCursor: true });

button.on('pointerover', () => {
    button.setFrame(1); // 切换到第2帧
});

button.on('pointerout', () => {
    button.setFrame(0); // 切换回第1帧
});
```

### 动态生成按钮图片

```javascript
// 使用 Canvas 动态生成按钮
const graphics = this.add.graphics();
graphics.fillStyle(0x667eea);
graphics.fillRoundedRect(0, 0, 200, 60, 10);
graphics.generateTexture('dynamic_button', 200, 60);

// 然后使用生成的纹理
const button = this.add.image(x, y, 'dynamic_button');
```

## 注意事项

1. **图片路径**：确保图片路径正确，相对于项目根目录
2. **图片格式**：推荐使用 PNG（支持透明）或 WebP
3. **图片大小**：建议压缩图片以提升加载速度
4. **加载顺序**：确保在 PreloadScene 中加载所有需要的资源
5. **错误处理**：如果图片加载失败，ButtonFactory 会使用占位图形

## 示例场景

查看以下文件了解完整示例：
- `src/scenes/PreloadScene.js` - 资源加载示例
- `src/core/ButtonFactory.js` - 按钮工厂实现
- `src/scenes/MainMenuScene.js` - 可以修改为使用图片按钮

## 常见问题

**Q: 图片加载失败怎么办？**
A: ButtonFactory 会自动使用占位图形，确保游戏可以继续运行。

**Q: 如何调整按钮大小？**
A: 使用 `scale` 参数，或直接设置图片的 `setScale()` 方法。

**Q: 可以同时使用图片和文字吗？**
A: 可以，ButtonFactory.createImageButton() 支持在图片上叠加文字。

**Q: 如何添加按钮动画？**
A: 使用 Phaser 的 Tween 系统：
```javascript
this.tweens.add({
    targets: button,
    scale: 1.1,
    duration: 200,
    yoyo: true
});
```

