#!/usr/bin/env node

/**
 * iOS项目完整性测试脚本
 * Test script for iOS project integrity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const tests = {
    xcodeProject: {
        name: 'Xcode项目文件',
        path: 'ios-native/MathCultivation.xcodeproj/project.pbxproj',
        required: true
    },
    infoPlist: {
        name: 'Info.plist配置',
        path: 'ios-native/MathCultivation/Info.plist',
        required: true
    },
    appDelegate: {
        name: 'AppDelegate.swift',
        path: 'ios-native/MathCultivation/AppDelegate.swift',
        required: true
    },
    sceneDelegate: {
        name: 'SceneDelegate.swift',
        path: 'ios-native/MathCultivation/SceneDelegate.swift',
        required: true
    },
    viewController: {
        name: 'ViewController.swift',
        path: 'ios-native/MathCultivation/ViewController.swift',
        required: true
    },
    webViewBridge: {
        name: 'WebViewBridge.swift',
        path: 'ios-native/MathCultivation/WebViewBridge.swift',
        required: true
    },
    launchScreen: {
        name: 'LaunchScreen.storyboard',
        path: 'ios-native/MathCultivation/Base.lproj/LaunchScreen.storyboard',
        required: true
    },
    assets: {
        name: 'Assets.xcassets',
        path: 'ios-native/MathCultivation/Assets.xcassets',
        required: true,
        isDirectory: true
    },
    appIcons: {
        name: 'App图标集',
        path: 'ios-native/MathCultivation/Assets.xcassets/AppIcon.appiconset',
        required: true,
        isDirectory: true
    },
    webContent: {
        name: 'Web内容目录',
        path: 'ios-native/MathCultivation/WebContent',
        required: true,
        isDirectory: true
    },
    gameIndex: {
        name: '游戏主页面',
        path: 'ios-native/MathCultivation/WebContent/index.html',
        required: true
    },
    gameMain: {
        name: '游戏主脚本',
        path: 'ios-native/MathCultivation/WebContent/src/main.js',
        required: true
    },
    nativeBridge: {
        name: '原生桥接脚本',
        path: 'ios-native/MathCultivation/WebContent/src/NativeBridge.js',
        required: true
    }
};

// 图标文件检查
const requiredIcons = [
    'icon-20.png', 'icon-29.png', 'icon-40.png', 'icon-58.png',
    'icon-60.png', 'icon-76.png', 'icon-80.png', 'icon-87.png',
    'icon-120.png', 'icon-152.png', 'icon-167.png', 'icon-180.png',
    'icon-1024.png'
];

// 测试结果
let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
};

// 颜色输出函数
const colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 检查文件或目录是否存在
function checkPath(testPath, isDirectory = false) {
    const fullPath = path.join(__dirname, testPath);
    
    try {
        const stats = fs.statSync(fullPath);
        if (isDirectory) {
            return stats.isDirectory();
        } else {
            return stats.isFile();
        }
    } catch (error) {
        return false;
    }
}

// 检查文件内容
function checkFileContent(testPath, patterns = []) {
    const fullPath = path.join(__dirname, testPath);
    
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const results = patterns.map(pattern => {
            const regex = new RegExp(pattern.pattern, pattern.flags || 'i');
            return {
                name: pattern.name,
                found: regex.test(content)
            };
        });
        return results;
    } catch (error) {
        return [];
    }
}

// 运行单个测试
function runTest(testKey, testConfig) {
    const result = {
        name: testConfig.name,
        key: testKey,
        passed: false,
        message: '',
        details: []
    };
    
    // 检查文件/目录存在性
    const exists = checkPath(testConfig.path, testConfig.isDirectory);
    
    if (!exists) {
        result.message = testConfig.required ? 
            `❌ 必需文件缺失: ${testConfig.path}` : 
            `⚠️  可选文件缺失: ${testConfig.path}`;
        result.passed = !testConfig.required;
        return result;
    }
    
    result.passed = true;
    result.message = `✅ ${testConfig.name} 存在`;
    
    // 特殊检查
    switch (testKey) {
        case 'xcodeProject':
            // 检查Xcode项目文件内容
            const xcodePatterns = [
                { name: 'Bundle ID配置', pattern: 'com\\.mathcultivation\\.app' },
                { name: 'Swift文件引用', pattern: 'ViewController\\.swift' },
                { name: 'Assets引用', pattern: 'Assets\\.xcassets' }
            ];
            result.details = checkFileContent(testConfig.path, xcodePatterns);
            break;
            
        case 'infoPlist':
            // 检查Info.plist配置
            const plistPatterns = [
                { name: 'Bundle ID', pattern: 'com\\.mathcultivation\\.app' },
                { name: '应用名称', pattern: '数道仙途' },
                { name: 'URL Scheme', pattern: 'mathcultivation' }
            ];
            result.details = checkFileContent(testConfig.path, plistPatterns);
            break;
            
        case 'viewController':
            // 检查ViewController实现
            const vcPatterns = [
                { name: 'WKWebView导入', pattern: 'import WebKit' },
                { name: '消息处理器', pattern: 'WKScriptMessageHandler' },
                { name: '触觉反馈', pattern: 'UIImpactFeedbackGenerator' }
            ];
            result.details = checkFileContent(testConfig.path, vcPatterns);
            break;
            
        case 'webViewBridge':
            // 检查WebView桥接实现
            const bridgePatterns = [
                { name: '触觉反馈处理', pattern: 'handleHapticFeedback' },
                { name: '通知处理', pattern: 'handleShowNotification' },
                { name: '分享处理', pattern: 'handleShareProgress' }
            ];
            result.details = checkFileContent(testConfig.path, bridgePatterns);
            break;
    }
    
    return result;
}

// 检查应用图标
function checkAppIcons() {
    const iconDir = path.join(__dirname, 'ios-native/MathCultivation/Assets.xcassets/AppIcon.appiconset');
    const result = {
        name: '应用图标完整性',
        key: 'appIconsIntegrity',
        passed: false,
        message: '',
        details: []
    };
    
    let foundIcons = 0;
    let missingIcons = [];
    
    for (const iconName of requiredIcons) {
        const iconPath = path.join(iconDir, iconName);
        if (fs.existsSync(iconPath)) {
            foundIcons++;
            result.details.push({ name: iconName, found: true });
        } else {
            missingIcons.push(iconName);
            result.details.push({ name: iconName, found: false });
        }
    }
    
    result.passed = foundIcons === requiredIcons.length;
    result.message = result.passed ? 
        `✅ 所有${requiredIcons.length}个图标文件完整` :
        `⚠️  缺失${missingIcons.length}个图标: ${missingIcons.join(', ')}`;
    
    return result;
}

// 检查Web内容完整性
function checkWebContent() {
    const webContentDir = path.join(__dirname, 'ios-native/MathCultivation/WebContent');
    const result = {
        name: 'Web内容完整性',
        key: 'webContentIntegrity',
        passed: false,
        message: '',
        details: []
    };
    
    const requiredWebFiles = [
        'index.html',
        'manifest.json',
        'sw.js',
        'src/main.js',
        'src/init.js',
        'src/NativeBridge.js',
        'src/core/Player.js',
        'src/core/MathProblem.js',
        'src/scenes/GameScene.js'
    ];
    
    let foundFiles = 0;
    let missingFiles = [];
    
    for (const fileName of requiredWebFiles) {
        const filePath = path.join(webContentDir, fileName);
        if (fs.existsSync(filePath)) {
            foundFiles++;
            result.details.push({ name: fileName, found: true });
        } else {
            missingFiles.push(fileName);
            result.details.push({ name: fileName, found: false });
        }
    }
    
    result.passed = foundFiles === requiredWebFiles.length;
    result.message = result.passed ? 
        `✅ 所有${requiredWebFiles.length}个Web文件完整` :
        `⚠️  缺失${missingFiles.length}个文件: ${missingFiles.join(', ')}`;
    
    return result;
}

// 生成测试报告
function generateReport() {
    console.log(colors.bold('\n📊 iOS项目完整性测试报告'));
    console.log('='.repeat(50));
    
    // 显示总体统计
    const totalTests = testResults.details.length;
    const passRate = ((testResults.passed / totalTests) * 100).toFixed(1);
    
    console.log(`\n📈 测试统计:`);
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过: ${colors.green(testResults.passed)}`);
    console.log(`   失败: ${colors.red(testResults.failed)}`);
    console.log(`   警告: ${colors.yellow(testResults.warnings)}`);
    console.log(`   通过率: ${passRate >= 90 ? colors.green(passRate + '%') : colors.yellow(passRate + '%')}`);
    
    // 显示详细结果
    console.log(`\n📋 详细测试结果:`);
    
    for (const result of testResults.details) {
        console.log(`\n${result.message}`);
        
        if (result.details && result.details.length > 0) {
            for (const detail of result.details) {
                const status = detail.found ? colors.green('✓') : colors.red('✗');
                console.log(`   ${status} ${detail.name}`);
            }
        }
    }
    
    // 显示建议
    console.log(`\n💡 建议:`);
    
    if (testResults.failed > 0) {
        console.log(`   ${colors.red('•')} 修复失败的测试项目后再进行构建`);
    }
    
    if (testResults.warnings > 0) {
        console.log(`   ${colors.yellow('•')} 检查警告项目以确保最佳体验`);
    }
    
    if (testResults.passed === totalTests) {
        console.log(`   ${colors.green('•')} 项目完整性良好，可以开始构建！`);
        console.log(`   ${colors.green('•')} 运行 ./build-ios.sh 开始构建iOS应用`);
    }
    
    console.log(`\n🚀 下一步:`);
    console.log(`   1. 运行 ./build-ios.sh 构建应用`);
    console.log(`   2. 在Xcode中打开项目进行测试`);
    console.log(`   3. 使用iOS模拟器验证功能`);
    console.log(`   4. 连接真机进行最终测试`);
}

// 主测试函数
async function runAllTests() {
    console.log(colors.bold('🧪 开始iOS项目完整性测试'));
    console.log(colors.blue('数道仙途 iOS应用 - 项目验证'));
    console.log('='.repeat(50));
    
    // 运行基础文件测试
    console.log('\n🔍 检查项目文件结构...');
    
    for (const [testKey, testConfig] of Object.entries(tests)) {
        const result = runTest(testKey, testConfig);
        testResults.details.push(result);
        
        if (result.passed) {
            testResults.passed++;
        } else if (testConfig.required) {
            testResults.failed++;
        } else {
            testResults.warnings++;
        }
        
        console.log(`   ${result.message}`);
    }
    
    // 运行特殊检查
    console.log('\n🎨 检查应用图标...');
    const iconResult = checkAppIcons();
    testResults.details.push(iconResult);
    
    if (iconResult.passed) {
        testResults.passed++;
    } else {
        testResults.warnings++;
    }
    
    console.log(`   ${iconResult.message}`);
    
    console.log('\n📦 检查Web内容...');
    const webResult = checkWebContent();
    testResults.details.push(webResult);
    
    if (webResult.passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
    
    console.log(`   ${webResult.message}`);
    
    // 生成报告
    generateReport();
    
    // 返回测试是否全部通过
    return testResults.failed === 0;
}

// 运行测试
runAllTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error(colors.red('❌ 测试运行失败:'), error);
    process.exit(1);
});