// 应用图标生成脚本
// Generate App Icons for iOS App

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建图标目录
const iconsDir = path.join(__dirname, 'icons');
const splashDir = path.join(__dirname, 'splash');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
}

// iOS应用图标尺寸配置
const iconSizes = [
    // iPhone
    { size: 20, name: 'icon-20.png', desc: 'iPhone Notification iOS 7-13' },
    { size: 29, name: 'icon-29.png', desc: 'iPhone Settings iOS 5-13' },
    { size: 40, name: 'icon-40.png', desc: 'iPhone Spotlight iOS 7-13' },
    { size: 58, name: 'icon-58.png', desc: 'iPhone Settings @2x iOS 5-13' },
    { size: 60, name: 'icon-60.png', desc: 'iPhone App iOS 7-13' },
    { size: 80, name: 'icon-80.png', desc: 'iPhone Spotlight @2x iOS 7-13' },
    { size: 87, name: 'icon-87.png', desc: 'iPhone Settings @3x iOS 5-13' },
    { size: 120, name: 'icon-120.png', desc: 'iPhone App @2x iOS 7-13' },
    { size: 180, name: 'icon-180.png', desc: 'iPhone App @3x iOS 7-13' },
    
    // iPad
    { size: 20, name: 'icon-20-ipad.png', desc: 'iPad Notification iOS 7-13' },
    { size: 29, name: 'icon-29-ipad.png', desc: 'iPad Settings iOS 5-13' },
    { size: 40, name: 'icon-40-ipad.png', desc: 'iPad Spotlight iOS 7-13' },
    { size: 58, name: 'icon-58-ipad.png', desc: 'iPad Settings @2x iOS 5-13' },
    { size: 76, name: 'icon-76.png', desc: 'iPad App iOS 7-13' },
    { size: 80, name: 'icon-80-ipad.png', desc: 'iPad Spotlight @2x iOS 7-13' },
    { size: 152, name: 'icon-152.png', desc: 'iPad App @2x iOS 7-13' },
    { size: 167, name: 'icon-167.png', desc: 'iPad Pro App @2x iOS 9-13' },
    
    // Web/PWA
    { size: 16, name: 'icon-16.png', desc: 'Web favicon' },
    { size: 32, name: 'icon-32.png', desc: 'Web favicon' },
    { size: 72, name: 'icon-72.png', desc: 'Web app icon' },
    { size: 96, name: 'icon-96.png', desc: 'Web app icon' },
    { size: 128, name: 'icon-128.png', desc: 'Web app icon' },
    { size: 144, name: 'icon-144.png', desc: 'Web app icon' },
    { size: 192, name: 'icon-192.png', desc: 'Web app icon' },
    { size: 384, name: 'icon-384.png', desc: 'Web app icon' },
    { size: 512, name: 'icon-512.png', desc: 'Web app icon' },
    
    // Maskable icons
    { size: 192, name: 'maskable-icon-192.png', desc: 'Maskable web app icon' },
    { size: 512, name: 'maskable-icon-512.png', desc: 'Maskable web app icon' }
];

// iOS启动画面尺寸配置
const splashSizes = [
    // iPhone
    { width: 640, height: 1136, name: 'splash-640x1136.png', desc: 'iPhone 5/5s/5c/SE' },
    { width: 750, height: 1334, name: 'splash-750x1334.png', desc: 'iPhone 6/6s/7/8/SE2' },
    { width: 1242, height: 2208, name: 'splash-1242x2208.png', desc: 'iPhone 6+/6s+/7+/8+' },
    { width: 1125, height: 2436, name: 'splash-1125x2436.png', desc: 'iPhone X/XS/11 Pro' },
    { width: 1242, height: 2688, name: 'splash-1242x2688.png', desc: 'iPhone XS Max/11 Pro Max' },
    { width: 828, height: 1792, name: 'splash-828x1792.png', desc: 'iPhone XR/11' },
    { width: 1170, height: 2532, name: 'splash-1170x2532.png', desc: 'iPhone 12/12 Pro' },
    { width: 1284, height: 2778, name: 'splash-1284x2778.png', desc: 'iPhone 12 Pro Max' },
    { width: 1080, height: 2340, name: 'splash-1080x2340.png', desc: 'iPhone 12 mini' },
    
    // iPad
    { width: 1536, height: 2048, name: 'splash-1536x2048.png', desc: 'iPad 9.7" Portrait' },
    { width: 2048, height: 1536, name: 'splash-2048x1536.png', desc: 'iPad 9.7" Landscape' },
    { width: 1668, height: 2224, name: 'splash-1668x2224.png', desc: 'iPad 10.5" Portrait' },
    { width: 2224, height: 1668, name: 'splash-2224x1668.png', desc: 'iPad 10.5" Landscape' },
    { width: 1668, height: 2388, name: 'splash-1668x2388.png', desc: 'iPad 11" Portrait' },
    { width: 2388, height: 1668, name: 'splash-2388x1668.png', desc: 'iPad 11" Landscape' },
    { width: 2048, height: 2732, name: 'splash-2048x2732.png', desc: 'iPad 12.9" Portrait' },
    { width: 2732, height: 2048, name: 'splash-2732x2048.png', desc: 'iPad 12.9" Landscape' }
];

// 生成SVG图标内容
function generateIconSVG(size, isMaskable = false) {
    const padding = isMaskable ? size * 0.1 : 0; // Maskable图标需要10%的安全边距
    const iconSize = size - (padding * 2);
    const centerX = size / 2;
    const centerY = size / 2;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f0f23;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    
    <!-- 背景 -->
    <rect width="${size}" height="${size}" fill="url(#bgGradient)" ${isMaskable ? 'rx="' + (size * 0.225) + '"' : ''}/>
    
    <!-- 装饰性圆环 -->
    <circle cx="${centerX}" cy="${centerY}" r="${iconSize * 0.35}" fill="none" stroke="url(#textGradient)" stroke-width="${iconSize * 0.02}" opacity="0.3"/>
    <circle cx="${centerX}" cy="${centerY}" r="${iconSize * 0.25}" fill="none" stroke="url(#textGradient)" stroke-width="${iconSize * 0.015}" opacity="0.5"/>
    
    <!-- 中心数学符号 -->
    <g transform="translate(${centerX}, ${centerY})">
        <!-- 数字 -->
        <text x="0" y="${iconSize * 0.08}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${iconSize * 0.2}" font-weight="bold" fill="url(#textGradient)" filter="url(#glow)">数</text>
        
        <!-- 数学符号 -->
        <g transform="translate(0, ${iconSize * 0.15})">
            <!-- 加号 -->
            <line x1="${-iconSize * 0.08}" y1="0" x2="${iconSize * 0.08}" y2="0" stroke="url(#textGradient)" stroke-width="${iconSize * 0.015}" opacity="0.8"/>
            <line x1="0" y1="${-iconSize * 0.08}" x2="0" y2="${iconSize * 0.08}" stroke="url(#textGradient)" stroke-width="${iconSize * 0.015}" opacity="0.8"/>
        </g>
        
        <!-- 道字 -->
        <text x="0" y="${iconSize * 0.35}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${iconSize * 0.2}" font-weight="bold" fill="url(#textGradient)" filter="url(#glow)">道</text>
    </g>
    
    <!-- 装饰性粒子 -->
    <circle cx="${centerX - iconSize * 0.3}" cy="${centerY - iconSize * 0.2}" r="${iconSize * 0.02}" fill="#4facfe" opacity="0.6"/>
    <circle cx="${centerX + iconSize * 0.25}" cy="${centerY - iconSize * 0.3}" r="${iconSize * 0.015}" fill="#00f2fe" opacity="0.8"/>
    <circle cx="${centerX + iconSize * 0.3}" cy="${centerY + iconSize * 0.2}" r="${iconSize * 0.02}" fill="#4facfe" opacity="0.7"/>
    <circle cx="${centerX - iconSize * 0.25}" cy="${centerY + iconSize * 0.25}" r="${iconSize * 0.015}" fill="#00f2fe" opacity="0.6"/>
</svg>`;
}

// 生成启动画面SVG内容
function generateSplashSVG(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const logoSize = Math.min(width, height) * 0.3;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f0f23;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    
    <!-- 背景 -->
    <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
    
    <!-- 背景装饰 -->
    <g opacity="0.1">
        ${Array.from({length: 20}, (_, i) => {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;
            return `<circle cx="${x}" cy="${y}" r="${size}" fill="#4facfe"/>`;
        }).join('\n        ')}
    </g>
    
    <!-- 主标题 -->
    <g transform="translate(${centerX}, ${centerY - logoSize * 0.3})">
        <text x="0" y="0" text-anchor="middle" font-family="Arial, sans-serif" font-size="${logoSize * 0.4}" font-weight="bold" fill="url(#textGradient)" filter="url(#glow)">数道仙途</text>
    </g>
    
    <!-- 副标题 -->
    <g transform="translate(${centerX}, ${centerY + logoSize * 0.2})">
        <text x="0" y="0" text-anchor="middle" font-family="Arial, sans-serif" font-size="${logoSize * 0.15}" fill="url(#textGradient)" opacity="0.8">Mathematical Cultivation Path</text>
    </g>
    
    <!-- 装饰性元素 -->
    <g transform="translate(${centerX}, ${centerY + logoSize * 0.6})">
        <circle r="${logoSize * 0.05}" fill="none" stroke="url(#textGradient)" stroke-width="2" opacity="0.6"/>
        <circle r="${logoSize * 0.08}" fill="none" stroke="url(#textGradient)" stroke-width="1" opacity="0.4"/>
    </g>
</svg>`;
}

// 创建图标文件
console.log('🎨 开始生成应用图标...');

iconSizes.forEach(({ size, name, desc }) => {
    const isMaskable = name.includes('maskable');
    const svgContent = generateIconSVG(size, isMaskable);
    const svgPath = path.join(iconsDir, name.replace('.png', '.svg'));
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ 生成图标: ${name} (${size}x${size}) - ${desc}`);
});

// 创建启动画面文件
console.log('\n🖼️ 开始生成启动画面...');

splashSizes.forEach(({ width, height, name, desc }) => {
    const svgContent = generateSplashSVG(width, height);
    const svgPath = path.join(splashDir, name.replace('.png', '.svg'));
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ 生成启动画面: ${name} (${width}x${height}) - ${desc}`);
});

// 创建favicon.ico占位符
const faviconPath = path.join(__dirname, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
    // 创建一个简单的ICO文件占位符
    const icoContent = Buffer.from([
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00,
        0x68, 0x04, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00,
        0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x40, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    fs.writeFileSync(faviconPath, icoContent);
    console.log('✅ 创建favicon.ico占位符');
}

// 创建图标使用说明
const readmePath = path.join(iconsDir, 'README.md');
const readmeContent = `# 应用图标说明

## 图标文件

### iOS应用图标
${iconSizes.filter(icon => !icon.name.includes('maskable') && !icon.name.includes('icon-16') && !icon.name.includes('icon-32')).map(icon => 
    `- **${icon.name}** (${icon.size}x${icon.size}): ${icon.desc}`
).join('\n')}

### Web/PWA图标
${iconSizes.filter(icon => icon.name.includes('icon-16') || icon.name.includes('icon-32') || (icon.size >= 72 && !icon.name.includes('maskable'))).map(icon => 
    `- **${icon.name}** (${icon.size}x${icon.size}): ${icon.desc}`
).join('\n')}

### Maskable图标
${iconSizes.filter(icon => icon.name.includes('maskable')).map(icon => 
    `- **${icon.name}** (${icon.size}x${icon.size}): ${icon.desc}`
).join('\n')}

## 启动画面

### iPhone启动画面
${splashSizes.filter(splash => splash.desc.includes('iPhone')).map(splash => 
    `- **${splash.name}** (${splash.width}x${splash.height}): ${splash.desc}`
).join('\n')}

### iPad启动画面
${splashSizes.filter(splash => splash.desc.includes('iPad')).map(splash => 
    `- **${splash.name}** (${splash.width}x${splash.height}): ${splash.desc}`
).join('\n')}

## 使用说明

1. **SVG文件**: 当前生成的是SVG格式，需要转换为PNG格式
2. **转换工具**: 可以使用在线工具或ImageMagick进行转换
3. **质量要求**: 确保PNG文件清晰，无锯齿
4. **文件大小**: 尽量控制文件大小，特别是大尺寸图标

## 转换命令示例

如果安装了ImageMagick，可以使用以下命令转换：

\`\`\`bash
# 转换单个图标
convert icon-180.svg icon-180.png

# 批量转换图标
for file in *.svg; do convert "$file" "\${file%.svg}.png"; done
\`\`\`

## 设计说明

- **主色调**: 深蓝渐变背景 (#0f0f23 → #1a1a2e → #16213e)
- **强调色**: 蓝色渐变 (#4facfe → #00f2fe)
- **字体**: "数道" 突出数学修仙主题
- **装饰**: 数学符号和粒子效果
- **风格**: 现代简约，符合iOS设计规范
`;

fs.writeFileSync(readmePath, readmeContent);

console.log('\n📝 图标和启动画面生成完成！');
console.log('📁 图标文件位置: ./icons/');
console.log('📁 启动画面位置: ./splash/');
console.log('📖 使用说明: ./icons/README.md');
console.log('\n⚠️  注意: 当前生成的是SVG格式，需要转换为PNG格式才能使用');
console.log('💡 建议使用在线SVG转PNG工具或ImageMagick进行转换');