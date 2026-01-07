#!/usr/bin/env node

/**
 * SVG to PNG Icon Converter for iOS App
 * 将SVG图标转换为iOS应用所需的PNG格式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查是否有sharp库可用
let sharp;
try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
    console.log('✅ 使用Sharp库进行高质量转换');
} catch (error) {
    console.log('⚠️  Sharp库未安装，将使用Canvas API转换');
    sharp = null;
}

// iOS应用图标尺寸配置
const iconSizes = [
    { size: 20, name: 'icon-20.png' },
    { size: 29, name: 'icon-29.png' },
    { size: 40, name: 'icon-40.png' },
    { size: 58, name: 'icon-58.png' },
    { size: 60, name: 'icon-60.png' },
    { size: 76, name: 'icon-76.png' },
    { size: 80, name: 'icon-80.png' },
    { size: 87, name: 'icon-87.png' },
    { size: 120, name: 'icon-120.png' },
    { size: 152, name: 'icon-152.png' },
    { size: 167, name: 'icon-167.png' },
    { size: 180, name: 'icon-180.png' },
    { size: 1024, name: 'icon-1024.png' }
];

// 源SVG文件路径
const sourceSVG = path.join(__dirname, 'icons', 'app-icon.svg');
const outputDir = path.join(__dirname, 'ios-native', 'MathCultivation', 'Assets.xcassets', 'AppIcon.appiconset');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 使用Sharp进行转换（如果可用）
async function convertWithSharp() {
    console.log('🔄 开始使用Sharp转换图标...');
    
    for (const { size, name } of iconSizes) {
        try {
            await sharp(sourceSVG)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png({
                    quality: 100,
                    compressionLevel: 0
                })
                .toFile(path.join(outputDir, name));
            
            console.log(`✅ 生成 ${name} (${size}x${size})`);
        } catch (error) {
            console.error(`❌ 生成 ${name} 失败:`, error.message);
        }
    }
}

// 使用Canvas API进行转换（备用方案）
function convertWithCanvas() {
    console.log('🔄 开始使用Canvas API转换图标...');
    
    // 创建基础的PNG图标（简化版本）
    const createBasicIcon = (size, filename) => {
        // 这里我们创建一个基础的数学符号图标
        const canvas = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
                  fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">∑</text>
        </svg>`;
        
        // 将SVG保存为临时文件，然后可以手动转换
        const tempSVGPath = path.join(outputDir, `temp-${size}.svg`);
        fs.writeFileSync(tempSVGPath, canvas);
        
        console.log(`📝 创建临时SVG: temp-${size}.svg (需要手动转换为 ${filename})`);
    };
    
    iconSizes.forEach(({ size, name }) => {
        createBasicIcon(size, name);
    });
    
    console.log('\n📋 手动转换步骤:');
    console.log('1. 使用在线SVG转PNG工具 (如 https://convertio.co/svg-png/)');
    console.log('2. 或使用设计软件 (Sketch, Figma, Adobe Illustrator)');
    console.log('3. 将转换后的PNG文件放入 Assets.xcassets/AppIcon.appiconset/ 目录');
}

// 创建默认的数学主题SVG图标
function createDefaultSVGIcon() {
    const svgContent = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <!-- 渐变背景 -->
        <linearGradient id="backgroundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0f0f23;stop-opacity:1" />
        </linearGradient>
        
        <!-- 数学符号渐变 -->
        <linearGradient id="symbolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
        </linearGradient>
        
        <!-- 光晕效果 -->
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#4facfe;stop-opacity:0" />
        </radialGradient>
    </defs>
    
    <!-- 圆角矩形背景 -->
    <rect width="1024" height="1024" rx="200" fill="url(#backgroundGrad)"/>
    
    <!-- 光晕效果 -->
    <circle cx="512" cy="512" r="400" fill="url(#glowGrad)"/>
    
    <!-- 主要数学符号 - 求和符号 -->
    <text x="512" y="580" font-family="Times, serif" font-size="400" 
          fill="url(#symbolGrad)" text-anchor="middle" font-weight="bold">∑</text>
    
    <!-- 装饰性数学符号 -->
    <text x="200" y="250" font-family="Times, serif" font-size="80" 
          fill="#4facfe" text-anchor="middle" opacity="0.6">π</text>
    <text x="824" y="250" font-family="Times, serif" font-size="80" 
          fill="#4facfe" text-anchor="middle" opacity="0.6">∞</text>
    <text x="200" y="824" font-family="Times, serif" font-size="80" 
          fill="#4facfe" text-anchor="middle" opacity="0.6">∫</text>
    <text x="824" y="824" font-family="Times, serif" font-size="80" 
          fill="#4facfe" text-anchor="middle" opacity="0.6">√</text>
    
    <!-- 边框装饰 -->
    <rect width="1024" height="1024" rx="200" fill="none" 
          stroke="url(#symbolGrad)" stroke-width="8" opacity="0.5"/>
</svg>`.trim();
    
    const iconDir = path.join(__dirname, 'icons');
    if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
    }
    
    fs.writeFileSync(sourceSVG, svgContent);
    console.log('✅ 创建默认SVG图标:', sourceSVG);
}

// 主函数
async function main() {
    console.log('🎨 iOS应用图标转换工具');
    console.log('================================');
    
    // 检查源SVG文件是否存在
    if (!fs.existsSync(sourceSVG)) {
        console.log('📝 源SVG文件不存在，创建默认图标...');
        createDefaultSVGIcon();
    }
    
    // 根据可用工具选择转换方法
    if (sharp) {
        await convertWithSharp();
    } else {
        convertWithCanvas();
    }
    
    console.log('\n🎯 转换完成！');
    console.log(`📁 输出目录: ${outputDir}`);
    
    // 检查生成的文件
    const generatedFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    console.log(`📊 生成的PNG文件数量: ${generatedFiles.length}/${iconSizes.length}`);
    
    if (generatedFiles.length < iconSizes.length) {
        console.log('\n⚠️  部分图标未生成，请检查错误信息或手动转换');
        console.log('💡 建议安装Sharp库以获得更好的转换效果:');
        console.log('   npm install sharp');
    }
    
    console.log('\n📋 下一步:');
    console.log('1. 检查生成的PNG图标质量');
    console.log('2. 在Xcode中验证Assets.xcassets配置');
    console.log('3. 构建并测试iOS应用');
}

// 运行转换
main().catch(console.error);