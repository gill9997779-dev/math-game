#!/usr/bin/env node

/**
 * SVG截图转PNG工具
 * Convert SVG screenshot templates to PNG format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查是否安装了转换工具
function checkConversionTools() {
    const tools = [
        { name: 'ImageMagick', command: 'convert', install: 'brew install imagemagick' },
        { name: 'Inkscape', command: 'inkscape', install: 'brew install inkscape' },
        { name: 'rsvg-convert', command: 'rsvg-convert', install: 'brew install librsvg' }
    ];
    
    console.log('🔍 检查转换工具...');
    
    for (const tool of tools) {
        try {
            execSync(`which ${tool.command}`, { stdio: 'ignore' });
            console.log(`✅ ${tool.name} 已安装`);
            return tool;
        } catch (error) {
            console.log(`❌ ${tool.name} 未安装`);
        }
    }
    
    console.log('\n⚠️  未找到可用的转换工具');
    console.log('请安装以下工具之一:');
    tools.forEach(tool => {
        console.log(`   ${tool.name}: ${tool.install}`);
    });
    
    return null;
}

// 使用ImageMagick转换
function convertWithImageMagick(svgPath, pngPath, width, height) {
    const command = `convert -background transparent -size ${width}x${height} "${svgPath}" "${pngPath}"`;
    execSync(command);
}

// 使用Inkscape转换
function convertWithInkscape(svgPath, pngPath, width, height) {
    const command = `inkscape --export-type=png --export-filename="${pngPath}" --export-width=${width} --export-height=${height} "${svgPath}"`;
    execSync(command);
}

// 使用rsvg-convert转换
function convertWithRsvg(svgPath, pngPath, width, height) {
    const command = `rsvg-convert -w ${width} -h ${height} -o "${pngPath}" "${svgPath}"`;
    execSync(command);
}

// 从文件名解析尺寸
function parseDimensionsFromSVG(svgPath) {
    try {
        const content = fs.readFileSync(svgPath, 'utf8');
        const widthMatch = content.match(/width="(\d+)"/);
        const heightMatch = content.match(/height="(\d+)"/);
        
        if (widthMatch && heightMatch) {
            return {
                width: parseInt(widthMatch[1]),
                height: parseInt(heightMatch[1])
            };
        }
    } catch (error) {
        console.error(`解析SVG尺寸失败: ${svgPath}`);
    }
    
    return null;
}

// 转换单个文件
function convertSingleFile(svgPath, outputDir, tool) {
    const filename = path.basename(svgPath, '.svg');
    const pngPath = path.join(outputDir, filename + '.png');
    
    // 解析SVG尺寸
    const dimensions = parseDimensionsFromSVG(svgPath);
    if (!dimensions) {
        console.error(`❌ 无法解析SVG尺寸: ${filename}`);
        return false;
    }
    
    try {
        // 根据工具选择转换方法
        switch (tool.command) {
            case 'convert':
                convertWithImageMagick(svgPath, pngPath, dimensions.width, dimensions.height);
                break;
            case 'inkscape':
                convertWithInkscape(svgPath, pngPath, dimensions.width, dimensions.height);
                break;
            case 'rsvg-convert':
                convertWithRsvg(svgPath, pngPath, dimensions.width, dimensions.height);
                break;
            default:
                throw new Error(`不支持的转换工具: ${tool.command}`);
        }
        
        console.log(`✅ ${filename}.svg -> ${filename}.png (${dimensions.width}x${dimensions.height})`);
        return true;
        
    } catch (error) {
        console.error(`❌ 转换失败: ${filename} - ${error.message}`);
        return false;
    }
}

// 批量转换截图
async function convertScreenshots() {
    console.log('🖼️  开始转换App Store截图');
    console.log('================================');
    
    // 检查转换工具
    const tool = checkConversionTools();
    if (!tool) {
        console.log('\n💡 替代方案:');
        console.log('1. 使用在线转换工具: https://convertio.co/svg-png/');
        console.log('2. 使用设计软件: Sketch, Figma, Adobe Illustrator');
        console.log('3. 手动在浏览器中截图');
        return;
    }
    
    // 设置路径
    const screenshotsDir = path.join(__dirname, 'app-store-assets', 'screenshots');
    const pngOutputDir = path.join(screenshotsDir, 'png');
    
    // 创建PNG输出目录
    if (!fs.existsSync(pngOutputDir)) {
        fs.mkdirSync(pngOutputDir, { recursive: true });
    }
    
    // 获取所有SVG文件
    const svgFiles = fs.readdirSync(screenshotsDir)
        .filter(file => file.endsWith('.svg'))
        .map(file => path.join(screenshotsDir, file));
    
    if (svgFiles.length === 0) {
        console.log('❌ 未找到SVG截图文件');
        console.log('请先运行: node create-screenshots.js');
        return;
    }
    
    console.log(`\n📁 找到 ${svgFiles.length} 个SVG文件`);
    console.log(`🔧 使用工具: ${tool.name}`);
    
    // 转换统计
    let converted = 0;
    let failed = 0;
    
    // 按设备类型分组转换
    const deviceGroups = {
        iphone: svgFiles.filter(f => path.basename(f).startsWith('iphone_')),
        ipad: svgFiles.filter(f => path.basename(f).startsWith('ipad_'))
    };
    
    for (const [deviceType, files] of Object.entries(deviceGroups)) {
        if (files.length === 0) continue;
        
        console.log(`\n📱 转换${deviceType.toUpperCase()}截图 (${files.length}个文件)...`);
        
        for (const svgFile of files) {
            if (convertSingleFile(svgFile, pngOutputDir, tool)) {
                converted++;
            } else {
                failed++;
            }
        }
    }
    
    // 显示结果
    console.log(`\n🎯 转换完成！`);
    console.log(`✅ 成功转换: ${converted}个文件`);
    console.log(`❌ 转换失败: ${failed}个文件`);
    console.log(`📁 PNG文件位置: ${pngOutputDir}`);
    
    // 生成文件清单
    generatePNGManifest(pngOutputDir);
}

// 生成PNG文件清单
function generatePNGManifest(pngDir) {
    const pngFiles = fs.readdirSync(pngDir)
        .filter(file => file.endsWith('.png'))
        .sort();
    
    // 按设备类型分组
    const manifest = {
        iphone: pngFiles.filter(f => f.startsWith('iphone_')),
        ipad: pngFiles.filter(f => f.startsWith('ipad_'))
    };
    
    const manifestContent = `
# App Store截图PNG文件清单
## 数道仙途 iOS应用

### 📊 文件统计
- iPhone截图: ${manifest.iphone.length}个
- iPad截图: ${manifest.ipad.length}个
- 总计: ${pngFiles.length}个

### 📱 iPhone截图文件
${manifest.iphone.map(file => `- ${file}`).join('\n')}

### 📱 iPad截图文件
${manifest.ipad.map(file => `- ${file}`).join('\n')}

### 📋 App Store上传指南

#### iPhone截图要求
- 至少需要1张，最多10张
- 推荐使用iPhone 15 Pro Max尺寸 (1290 x 2796)
- 按重要性排序，第一张最重要

#### iPad截图要求
- 至少需要1张，最多10张
- 推荐使用iPad Pro 12.9-inch尺寸 (2048 x 2732)
- 可以与iPhone截图不同

#### 上传步骤
1. 登录App Store Connect
2. 选择应用和版本
3. 在"App Store"标签页上传截图
4. 为每种设备类型上传对应尺寸的截图
5. 保存并提交审核

### 🎨 后续优化建议
1. 使用实际应用截图替换模板
2. 添加设备边框和阴影效果
3. 优化文字可读性和对比度
4. 确保符合App Store审核指南

---
生成时间: ${new Date().toLocaleString('zh-CN')}
文件数量: ${pngFiles.length}个PNG文件
`.trim();
    
    const manifestPath = path.join(pngDir, 'MANIFEST.md');
    fs.writeFileSync(manifestPath, manifestContent);
    
    console.log(`📖 PNG文件清单已生成: ${manifestPath}`);
}

// 主函数
async function main() {
    try {
        await convertScreenshots();
        
        console.log('\n🎉 截图转换完成！');
        console.log('\n📋 下一步:');
        console.log('1. 检查生成的PNG文件质量');
        console.log('2. 在iOS模拟器中截取实际游戏界面');
        console.log('3. 使用设计软件合成最终截图');
        console.log('4. 准备App Store Connect上传');
        
    } catch (error) {
        console.error('❌ 截图转换失败:', error);
        process.exit(1);
    }
}

// 运行转换器
main();