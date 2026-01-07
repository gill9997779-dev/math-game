# 应用图标说明

## 图标文件

### iOS应用图标
- **icon-20.png** (20x20): iPhone Notification iOS 7-13
- **icon-29.png** (29x29): iPhone Settings iOS 5-13
- **icon-40.png** (40x40): iPhone Spotlight iOS 7-13
- **icon-58.png** (58x58): iPhone Settings @2x iOS 5-13
- **icon-60.png** (60x60): iPhone App iOS 7-13
- **icon-80.png** (80x80): iPhone Spotlight @2x iOS 7-13
- **icon-87.png** (87x87): iPhone Settings @3x iOS 5-13
- **icon-120.png** (120x120): iPhone App @2x iOS 7-13
- **icon-180.png** (180x180): iPhone App @3x iOS 7-13
- **icon-20-ipad.png** (20x20): iPad Notification iOS 7-13
- **icon-29-ipad.png** (29x29): iPad Settings iOS 5-13
- **icon-40-ipad.png** (40x40): iPad Spotlight iOS 7-13
- **icon-58-ipad.png** (58x58): iPad Settings @2x iOS 5-13
- **icon-76.png** (76x76): iPad App iOS 7-13
- **icon-80-ipad.png** (80x80): iPad Spotlight @2x iOS 7-13
- **icon-152.png** (152x152): iPad App @2x iOS 7-13
- **icon-72.png** (72x72): Web app icon
- **icon-96.png** (96x96): Web app icon
- **icon-128.png** (128x128): Web app icon
- **icon-144.png** (144x144): Web app icon
- **icon-192.png** (192x192): Web app icon
- **icon-384.png** (384x384): Web app icon
- **icon-512.png** (512x512): Web app icon

### Web/PWA图标
- **icon-80.png** (80x80): iPhone Spotlight @2x iOS 7-13
- **icon-87.png** (87x87): iPhone Settings @3x iOS 5-13
- **icon-120.png** (120x120): iPhone App @2x iOS 7-13
- **icon-180.png** (180x180): iPhone App @3x iOS 7-13
- **icon-76.png** (76x76): iPad App iOS 7-13
- **icon-80-ipad.png** (80x80): iPad Spotlight @2x iOS 7-13
- **icon-152.png** (152x152): iPad App @2x iOS 7-13
- **icon-167.png** (167x167): iPad Pro App @2x iOS 9-13
- **icon-16.png** (16x16): Web favicon
- **icon-32.png** (32x32): Web favicon
- **icon-72.png** (72x72): Web app icon
- **icon-96.png** (96x96): Web app icon
- **icon-128.png** (128x128): Web app icon
- **icon-144.png** (144x144): Web app icon
- **icon-192.png** (192x192): Web app icon
- **icon-384.png** (384x384): Web app icon
- **icon-512.png** (512x512): Web app icon

### Maskable图标
- **maskable-icon-192.png** (192x192): Maskable web app icon
- **maskable-icon-512.png** (512x512): Maskable web app icon

## 启动画面

### iPhone启动画面
- **splash-640x1136.png** (640x1136): iPhone 5/5s/5c/SE
- **splash-750x1334.png** (750x1334): iPhone 6/6s/7/8/SE2
- **splash-1242x2208.png** (1242x2208): iPhone 6+/6s+/7+/8+
- **splash-1125x2436.png** (1125x2436): iPhone X/XS/11 Pro
- **splash-1242x2688.png** (1242x2688): iPhone XS Max/11 Pro Max
- **splash-828x1792.png** (828x1792): iPhone XR/11
- **splash-1170x2532.png** (1170x2532): iPhone 12/12 Pro
- **splash-1284x2778.png** (1284x2778): iPhone 12 Pro Max
- **splash-1080x2340.png** (1080x2340): iPhone 12 mini

### iPad启动画面
- **splash-1536x2048.png** (1536x2048): iPad 9.7" Portrait
- **splash-2048x1536.png** (2048x1536): iPad 9.7" Landscape
- **splash-1668x2224.png** (1668x2224): iPad 10.5" Portrait
- **splash-2224x1668.png** (2224x1668): iPad 10.5" Landscape
- **splash-1668x2388.png** (1668x2388): iPad 11" Portrait
- **splash-2388x1668.png** (2388x1668): iPad 11" Landscape
- **splash-2048x2732.png** (2048x2732): iPad 12.9" Portrait
- **splash-2732x2048.png** (2732x2048): iPad 12.9" Landscape

## 使用说明

1. **SVG文件**: 当前生成的是SVG格式，需要转换为PNG格式
2. **转换工具**: 可以使用在线工具或ImageMagick进行转换
3. **质量要求**: 确保PNG文件清晰，无锯齿
4. **文件大小**: 尽量控制文件大小，特别是大尺寸图标

## 转换命令示例

如果安装了ImageMagick，可以使用以下命令转换：

```bash
# 转换单个图标
convert icon-180.svg icon-180.png

# 批量转换图标
for file in *.svg; do convert "$file" "${file%.svg}.png"; done
```

## 设计说明

- **主色调**: 深蓝渐变背景 (#0f0f23 → #1a1a2e → #16213e)
- **强调色**: 蓝色渐变 (#4facfe → #00f2fe)
- **字体**: "数道" 突出数学修仙主题
- **装饰**: 数学符号和粒子效果
- **风格**: 现代简约，符合iOS设计规范
