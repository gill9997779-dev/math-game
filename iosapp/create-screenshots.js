#!/usr/bin/env node

/**
 * App Store截图生成工具
 * App Store Screenshot Generator for 数道仙途
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App Store截图尺寸配置
const screenshotSizes = {
    // iPhone截图尺寸
    iphone: {
        'iPhone 15 Pro Max': { width: 1290, height: 2796 },
        'iPhone 15 Pro': { width: 1179, height: 2556 },
        'iPhone 14 Pro Max': { width: 1290, height: 2796 },
        'iPhone 14 Pro': { width: 1179, height: 2556 },
        'iPhone SE (3rd gen)': { width: 750, height: 1334 }
    },
    // iPad截图尺寸
    ipad: {
        'iPad Pro (12.9-inch)': { width: 2048, height: 2732 },
        'iPad Pro (11-inch)': { width: 1668, height: 2388 },
        'iPad Air': { width: 1640, height: 2360 },
        'iPad (10th gen)': { width: 1640, height: 2360 }
    }
};

// 截图内容配置
const screenshotContent = [
    {
        id: 'main-menu',
        title: '数道仙途 - 主菜单',
        description: '开始你的数学修仙之旅',
        scene: 'MainMenuScene',
        features: ['修仙主题界面', '直观的导航设计', '个人进度显示']
    },
    {
        id: 'concept-learning',
        title: '数学概念学习',
        description: '深度探索数学概念',
        scene: 'ConceptExplorationScene',
        features: ['16个数学概念', '循序渐进学习', '可视化解释']
    },
    {
        id: 'interactive-games',
        title: '互动小游戏',
        description: '寓教于乐的学习体验',
        scene: 'ConceptGameScene',
        features: ['17个原创游戏', '即时反馈', '趣味挑战']
    },
    {
        id: 'progress-tracking',
        title: '学习进度追踪',
        description: '清晰的成长轨迹',
        scene: 'GameScene',
        features: ['修仙等级系统', '学习统计', '成就展示']
    },
    {
        id: 'achievement-system',
        title: '成就系统',
        description: '激励持续学习',
        scene: 'InventoryScene',
        features: ['丰富的成就', '奖励机制', '社交分享']
    }
];

// 创建截图模板
function createScreenshotTemplate(size, content, deviceType) {
    const { width, height } = size;
    
    // 计算比例和布局
    const isLandscape = width > height;
    const aspectRatio = width / height;
    
    // 创建SVG模板
    const svgTemplate = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <!-- 背景渐变 -->
        <linearGradient id="backgroundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0f0f23;stop-opacity:1" />
        </linearGradient>
        
        <!-- 设备边框渐变 -->
        <linearGradient id="deviceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:0.8" />
        </linearGradient>
        
        <!-- 文字渐变 -->
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
        </linearGradient>
        
        <!-- 阴影滤镜 -->
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="0.3"/>
        </filter>
    </defs>
    
    <!-- 背景 -->
    <rect width="${width}" height="${height}" fill="url(#backgroundGrad)"/>
    
    <!-- 设备轮廓 (模拟iPhone/iPad) -->
    <rect x="${width * 0.1}" y="${height * 0.1}" 
          width="${width * 0.8}" height="${height * 0.8}" 
          rx="${deviceType === 'iphone' ? width * 0.05 : width * 0.03}" 
          fill="none" stroke="url(#deviceGrad)" stroke-width="4" 
          filter="url(#shadow)"/>
    
    <!-- 应用界面区域 -->
    <rect x="${width * 0.12}" y="${height * 0.15}" 
          width="${width * 0.76}" height="${height * 0.7}" 
          rx="${deviceType === 'iphone' ? width * 0.03 : width * 0.02}" 
          fill="#0f0f23" opacity="0.9"/>
    
    <!-- 标题区域 -->
    <text x="${width * 0.5}" y="${height * 0.25}" 
          font-family="PingFang SC, Arial, sans-serif" 
          font-size="${Math.min(width, height) * 0.04}" 
          font-weight="bold" 
          fill="url(#textGrad)" 
          text-anchor="middle">${content.title}</text>
    
    <!-- 描述文字 -->
    <text x="${width * 0.5}" y="${height * 0.3}" 
          font-family="PingFang SC, Arial, sans-serif" 
          font-size="${Math.min(width, height) * 0.025}" 
          fill="#b0b0c0" 
          text-anchor="middle">${content.description}</text>
    
    <!-- 功能特色列表 -->
    ${content.features.map((feature, index) => `
        <g transform="translate(${width * 0.2}, ${height * 0.4 + index * height * 0.08})">
            <!-- 特色图标 -->
            <circle cx="0" cy="0" r="${Math.min(width, height) * 0.015}" 
                    fill="url(#textGrad)"/>
            <!-- 特色文字 -->
            <text x="${width * 0.05}" y="${Math.min(width, height) * 0.005}" 
                  font-family="PingFang SC, Arial, sans-serif" 
                  font-size="${Math.min(width, height) * 0.022}" 
                  fill="#e0e0e0">${feature}</text>
        </g>
    `).join('')}
    
    <!-- 应用图标 -->
    <g transform="translate(${width * 0.5}, ${height * 0.75})">
        <!-- 图标背景 -->
        <rect x="${-width * 0.08}" y="${-width * 0.08}" 
              width="${width * 0.16}" height="${width * 0.16}" 
              rx="${width * 0.03}" 
              fill="url(#deviceGrad)" 
              filter="url(#shadow)"/>
        <!-- 数学符号 -->
        <text x="0" y="${width * 0.02}" 
              font-family="Times, serif" 
              font-size="${width * 0.08}" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle">∑</text>
    </g>
    
    <!-- 底部应用名称 -->
    <text x="${width * 0.5}" y="${height * 0.9}" 
          font-family="PingFang SC, Arial, sans-serif" 
          font-size="${Math.min(width, height) * 0.03}" 
          font-weight="bold" 
          fill="url(#textGrad)" 
          text-anchor="middle">数道仙途</text>
    
    <!-- 副标题 -->
    <text x="${width * 0.5}" y="${height * 0.94}" 
          font-family="PingFang SC, Arial, sans-serif" 
          font-size="${Math.min(width, height) * 0.02}" 
          fill="#b0b0c0" 
          text-anchor="middle">Mathematical Cultivation Path</text>
</svg>`.trim();

    return svgTemplate;
}

// 生成所有截图
async function generateScreenshots() {
    console.log('📱 开始生成App Store截图');
    console.log('================================');
    
    // 创建输出目录
    const outputDir = path.join(__dirname, 'app-store-assets', 'screenshots');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let totalGenerated = 0;
    
    // 为每种设备类型生成截图
    for (const [deviceCategory, devices] of Object.entries(screenshotSizes)) {
        console.log(`\n📱 生成${deviceCategory.toUpperCase()}截图...`);
        
        for (const [deviceName, size] of Object.entries(devices)) {
            console.log(`\n🔄 处理设备: ${deviceName} (${size.width}x${size.height})`);
            
            // 为每个内容场景生成截图
            for (const [index, content] of screenshotContent.entries()) {
                const filename = `${deviceCategory}_${deviceName.replace(/[^a-zA-Z0-9]/g, '_')}_${content.id}.svg`;
                const filepath = path.join(outputDir, filename);
                
                // 生成SVG截图模板
                const svgContent = createScreenshotTemplate(size, content, deviceCategory);
                
                // 保存文件
                fs.writeFileSync(filepath, svgContent);
                totalGenerated++;
                
                console.log(`  ✅ ${content.title} -> ${filename}`);
            }
        }
    }
    
    console.log(`\n🎯 截图生成完成！`);
    console.log(`📊 总计生成: ${totalGenerated}个SVG模板`);
    console.log(`📁 输出目录: ${outputDir}`);
    
    // 生成使用说明
    generateScreenshotGuide(outputDir);
}

// 生成截图使用说明
function generateScreenshotGuide(outputDir) {
    const guideContent = `
# App Store截图使用指南
## 数道仙途 iOS应用

### 📱 生成的截图模板

本工具已为以下设备生成截图模板：

#### iPhone设备
- iPhone 15 Pro Max (1290 x 2796)
- iPhone 15 Pro (1179 x 2556)
- iPhone 14 Pro Max (1290 x 2796)
- iPhone 14 Pro (1179 x 2556)
- iPhone SE 3rd gen (750 x 1334)

#### iPad设备
- iPad Pro 12.9-inch (2048 x 2732)
- iPad Pro 11-inch (1668 x 2388)
- iPad Air (1640 x 2360)
- iPad (10th gen) (1640 x 2360)

### 🎨 截图内容

每个设备都包含以下5个场景的截图：

1. **主菜单** (main-menu) - 应用首页和导航
2. **概念学习** (concept-learning) - 数学概念探索
3. **互动游戏** (interactive-games) - 小游戏体验
4. **进度追踪** (progress-tracking) - 学习进度展示
5. **成就系统** (achievement-system) - 成就和奖励

### 🛠️ 后续处理步骤

#### 1. SVG转PNG转换
使用以下工具将SVG转换为PNG：
- **在线工具**: https://convertio.co/svg-png/
- **设计软件**: Sketch, Figma, Adobe Illustrator
- **命令行**: ImageMagick, Inkscape

#### 2. 实际截图替换
建议步骤：
1. 在iOS模拟器中运行应用
2. 截取实际游戏界面
3. 使用设计软件合成最终截图
4. 确保符合App Store规范

#### 3. App Store上传
- 每个设备类型需要3-10张截图
- 按照App Store Connect要求的顺序上传
- 第一张截图最重要，会在搜索结果中显示

### 📋 App Store截图要求

#### 技术要求
- 格式：PNG或JPEG
- 色彩空间：sRGB或P3
- 不能包含透明度
- 不能包含设备边框（除非是应用功能）

#### 内容要求
- 必须展示应用实际功能
- 不能包含误导性内容
- 文字清晰可读
- 符合年龄分级要求

### 🎯 优化建议

#### 视觉设计
- 保持品牌一致性
- 突出核心功能
- 使用高对比度
- 确保文字可读性

#### 内容策略
- 第一张截图展示核心价值
- 展示用户使用流程
- 突出差异化功能
- 包含社会证明元素

### 📞 技术支持

如需帮助，请参考：
- Apple App Store截图指南
- iOS Human Interface Guidelines
- App Store Connect帮助文档

---
生成时间: ${new Date().toLocaleString('zh-CN')}
工具版本: 1.0.0
`.trim();

    const guidePath = path.join(outputDir, 'README.md');
    fs.writeFileSync(guidePath, guideContent);
    
    console.log(`📖 使用指南已生成: ${guidePath}`);
}

// 主函数
async function main() {
    try {
        await generateScreenshots();
        
        console.log('\n🎉 截图模板生成完成！');
        console.log('\n📋 下一步:');
        console.log('1. 将SVG模板转换为PNG格式');
        console.log('2. 在iOS模拟器中截取实际游戏界面');
        console.log('3. 使用设计软件合成最终截图');
        console.log('4. 上传到App Store Connect');
        
    } catch (error) {
        console.error('❌ 截图生成失败:', error);
        process.exit(1);
    }
}

// 运行生成器
main();