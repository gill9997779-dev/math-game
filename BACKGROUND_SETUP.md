# 背景图片设置指南

本指南将教你如何将数学修仙主题的背景图片添加到游戏中。

## 步骤 1: 准备背景图片

1. 将你的背景图片保存为 PNG 或 JPG 格式
2. 建议尺寸：1920x1080 或更高（游戏会自动缩放）
3. 推荐格式：PNG（支持透明）或 JPG（文件更小）

## 步骤 2: 创建资源目录

在项目根目录下创建以下目录结构：

```
项目根目录/
└── assets/
    └── images/
        └── game_background.png  (你的背景图片)
```

## 步骤 3: 放置图片文件

将你的背景图片文件命名为 `game_background.png`（或 `.jpg`），并放在 `assets/images/` 目录下。

**注意**：如果使用 JPG 格式，需要修改 `src/scenes/PreloadScene.js` 中的文件扩展名。

## 步骤 4: 验证加载

1. 启动游戏
2. 打开浏览器控制台（F12）
3. 查看是否有加载错误

如果图片加载成功，你应该能看到：
- 启动画面使用背景图片
- 主菜单使用背景图片
- 游戏场景使用背景图片（带区域颜色遮罩）
- 数学挑战场景使用背景图片（带深色遮罩）

## 步骤 5: 自定义背景（可选）

### 为不同场景使用不同背景

如果你想为不同场景使用不同的背景图片：

1. 在 `PreloadScene.js` 中加载多个背景：
```javascript
this.load.image('menu_background', 'assets/images/menu_background.png');
this.load.image('game_background', 'assets/images/game_background.png');
this.load.image('challenge_background', 'assets/images/challenge_background.png');
```

2. 在对应场景中使用：
```javascript
// MainMenuScene.js
const bg = this.add.image(width / 2, height / 2, 'menu_background');

// GameScene.js
const bg = this.add.image(width / 2, height / 2, 'game_background');

// MathChallengeScene.js
const bg = this.add.image(width / 2, height / 2, 'challenge_background');
```

### 调整背景显示效果

在场景中，你可以调整背景的显示方式：

```javascript
// 调整透明度
bg.setAlpha(0.8);

// 调整色调
bg.setTint(0x667eea);

// 调整缩放
bg.setScale(1.2);

// 调整位置
bg.setX(width / 2 + 100);
bg.setY(height / 2 - 50);
```

## 故障排除

### 问题 1: 背景图片不显示

**可能原因**：
- 图片路径不正确
- 图片文件不存在
- 图片格式不支持

**解决方法**：
1. 检查文件路径是否正确（相对于项目根目录）
2. 确认文件存在于 `assets/images/` 目录
3. 尝试使用 PNG 格式
4. 检查浏览器控制台的错误信息

### 问题 2: 背景图片显示不正确

**可能原因**：
- 图片尺寸不合适
- 缩放模式不正确

**解决方法**：
- 使用高分辨率图片（至少 1920x1080）
- 图片会自动缩放以适应屏幕

### 问题 3: 背景图片加载慢

**解决方法**：
1. 压缩图片文件大小
2. 使用 WebP 格式（需要修改加载代码）
3. 使用 JPG 格式（文件更小）

## 使用 BackgroundManager（高级）

如果你想使用更高级的背景管理功能，可以使用 `BackgroundManager`：

```javascript
import { BackgroundManager } from '../core/BackgroundManager.js';

// 创建背景
const bg = BackgroundManager.createBackground(this, 'game_background', {
    fitMode: 'cover',  // 'cover', 'contain', 'stretch'
    depth: 0,
    alpha: 1
});

// 创建带遮罩的背景（用于弹窗）
const { background, overlay } = BackgroundManager.createBackgroundWithOverlay(
    this,
    'game_background',
    0.7  // 遮罩透明度
);
```

## 当前实现

游戏已经配置为：
- ✅ 启动场景（BootScene）使用背景图片
- ✅ 主菜单（MainMenuScene）使用背景图片
- ✅ 游戏场景（GameScene）使用背景图片 + 区域颜色遮罩
- ✅ 数学挑战场景（MathChallengeScene）使用背景图片 + 深色遮罩

只需将你的背景图片放在 `assets/images/game_background.png` 即可！

