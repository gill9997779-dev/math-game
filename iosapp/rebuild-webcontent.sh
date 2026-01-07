#!/bin/bash

# 完全重建WebContent目录
# Complete rebuild of WebContent directory

echo "🔄 完全重建WebContent目录..."

# 设置路径
WEBCONTENT_DIR="ios-native/MathCultivation/WebContent"

# 1. 完全删除WebContent目录
echo "🗑️  删除现有WebContent目录..."
rm -rf "$WEBCONTENT_DIR"

# 2. 创建新的WebContent目录
echo "📁 创建新的WebContent目录..."
mkdir -p "$WEBCONTENT_DIR"

# 3. 复制核心HTML文件（确保使用正确的路径）
echo "📄 复制主HTML文件..."
cp index.html "$WEBCONTENT_DIR/"

# 4. 复制PWA配置文件
echo "⚙️  复制PWA配置..."
cp manifest.json "$WEBCONTENT_DIR/"
cp sw.js "$WEBCONTENT_DIR/"

# 5. 复制完整的src目录
echo "📂 复制游戏源代码目录..."
cp -r src "$WEBCONTENT_DIR/"

# 6. 复制assets目录
echo "🖼️  复制游戏资源..."
cp -r assets "$WEBCONTENT_DIR/"

# 7. 复制functions目录
echo "🔧 复制API函数..."
cp -r functions "$WEBCONTENT_DIR/"

# 8. 复制图标目录（如果存在）
if [ -d "icons" ]; then
    echo "🎨 复制应用图标..."
    cp -r icons "$WEBCONTENT_DIR/"
fi

# 9. 彻底清理所有系统文件
echo "🧹 清理系统文件..."
find "$WEBCONTENT_DIR" -name "._*" -type f -delete
find "$WEBCONTENT_DIR" -name ".DS_Store" -type f -delete
find "$WEBCONTENT_DIR" -name "Thumbs.db" -type f -delete

# 10. 修复HTML文件中的脚本引用
echo "🔧 修复HTML文件中的脚本引用..."
sed -i '' 's|<script type="module" src="src/init.js"></script>|<script type="module" src="src/init.js"></script>|g' "$WEBCONTENT_DIR/index.html"

# 11. 创建一个简单的测试页面来验证
echo "📝 创建验证页面..."
cat > "$WEBCONTENT_DIR/verify.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数道仙途 - 验证页面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .status {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .success { border-left: 4px solid #4CAF50; }
        .error { border-left: 4px solid #f44336; }
        .info { border-left: 4px solid #2196F3; }
        button {
            background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin: 10px 5px;
            font-size: 16px;
        }
        button:hover {
            opacity: 0.8;
        }
        .file-list {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 数道仙途 - WebContent验证</h1>
        
        <div class="status info">
            <h3>📋 验证步骤</h3>
            <p>这个页面将验证WebContent目录是否正确构建</p>
        </div>
        
        <div class="status" id="file-check">
            <h3>📁 文件结构检查</h3>
            <p>检查中...</p>
        </div>
        
        <div class="status" id="script-check">
            <h3>📜 脚本加载检查</h3>
            <p>检查中...</p>
        </div>
        
        <div class="status" id="game-check">
            <h3>🎯 游戏功能检查</h3>
            <button onclick="testGameLoad()">测试游戏加载</button>
            <button onclick="testNativeBridge()">测试原生桥接</button>
            <div id="game-results"></div>
        </div>
        
        <div class="status">
            <h3>🚀 启动游戏</h3>
            <button onclick="startMainGame()">启动完整游戏</button>
            <p>如果所有检查都通过，点击上面的按钮启动游戏</p>
        </div>
    </div>

    <script>
        // 文件结构检查
        async function checkFileStructure() {
            const requiredFiles = [
                'src/init.js',
                'src/main.js',
                'src/NativeBridge.js',
                'src/core/Player.js',
                'src/core/MathProblem.js',
                'src/scenes/BootScene.js',
                'src/scenes/MainMenuScene.js',
                'manifest.json',
                'sw.js'
            ];
            
            const fileCheck = document.getElementById('file-check');
            let allFilesExist = true;
            let results = [];
            
            for (const file of requiredFiles) {
                try {
                    const response = await fetch(file, { method: 'HEAD' });
                    if (response.ok) {
                        results.push(`✅ ${file}`);
                    } else {
                        results.push(`❌ ${file} (${response.status})`);
                        allFilesExist = false;
                    }
                } catch (error) {
                    results.push(`❌ ${file} (网络错误)`);
                    allFilesExist = false;
                }
            }
            
            fileCheck.className = allFilesExist ? 'status success' : 'status error';
            fileCheck.innerHTML = `
                <h3>📁 文件结构检查</h3>
                <div class="file-list">${results.join('<br>')}</div>
                <p><strong>结果:</strong> ${allFilesExist ? '所有文件完整' : '部分文件缺失'}</p>
            `;
        }
        
        // 脚本加载检查
        async function checkScriptLoading() {
            const scriptCheck = document.getElementById('script-check');
            
            try {
                // 测试动态导入
                const nativeBridge = await import('./src/NativeBridge.js');
                
                scriptCheck.className = 'status success';
                scriptCheck.innerHTML = `
                    <h3>📜 脚本加载检查</h3>
                    <p>✅ ES6模块加载成功</p>
                    <p>✅ NativeBridge模块可用</p>
                `;
            } catch (error) {
                scriptCheck.className = 'status error';
                scriptCheck.innerHTML = `
                    <h3>📜 脚本加载检查</h3>
                    <p>❌ 脚本加载失败: ${error.message}</p>
                `;
            }
        }
        
        // 测试游戏加载
        async function testGameLoad() {
            const results = document.getElementById('game-results');
            results.innerHTML = '<p>🔄 测试游戏加载...</p>';
            
            try {
                // 测试Phaser加载
                if (typeof Phaser === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js';
                    
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                
                results.innerHTML += '<p>✅ Phaser.js加载成功</p>';
                
                // 测试游戏场景
                const bootScene = await import('./src/scenes/BootScene.js');
                results.innerHTML += '<p>✅ 游戏场景加载成功</p>';
                
                results.innerHTML += '<p><strong>✅ 游戏加载测试通过</strong></p>';
                
            } catch (error) {
                results.innerHTML += `<p>❌ 游戏加载失败: ${error.message}</p>`;
            }
        }
        
        // 测试原生桥接
        async function testNativeBridge() {
            const results = document.getElementById('game-results');
            
            try {
                const { default: NativeBridge } = await import('./src/NativeBridge.js');
                
                const deviceInfo = NativeBridge.getDeviceInfo();
                results.innerHTML += `
                    <p>✅ 原生桥接测试成功</p>
                    <p>设备类型: ${deviceInfo.isIOS ? 'iOS' : '其他'}</p>
                    <p>应用类型: ${deviceInfo.isNativeApp ? '原生应用' : 'Web应用'}</p>
                `;
                
            } catch (error) {
                results.innerHTML += `<p>❌ 原生桥接测试失败: ${error.message}</p>`;
            }
        }
        
        // 启动主游戏
        function startMainGame() {
            window.location.href = 'index.html';
        }
        
        // 页面加载时自动运行检查
        window.addEventListener('load', async () => {
            await checkFileStructure();
            await checkScriptLoading();
        });
    </script>
</body>
</html>
EOF

# 12. 验证关键文件
echo "✅ 验证重建结果..."

check_file() {
    if [ -f "$WEBCONTENT_DIR/$1" ]; then
        echo "  ✓ $1"
        return 0
    else
        echo "  ❌ $1 缺失"
        return 1
    fi
}

check_dir() {
    if [ -d "$WEBCONTENT_DIR/$1" ]; then
        local count=$(find "$WEBCONTENT_DIR/$1" -type f | wc -l)
        echo "  ✓ $1/ ($count 个文件)"
        return 0
    else
        echo "  ❌ $1/ 目录缺失"
        return 1
    fi
}

echo "核心文件验证:"
check_file "index.html"
check_file "manifest.json"
check_file "sw.js"
check_file "verify.html"

echo "游戏脚本验证:"
check_file "src/init.js"
check_file "src/main.js"
check_file "src/NativeBridge.js"

echo "核心系统验证:"
check_file "src/core/Player.js"
check_file "src/core/MathProblem.js"
check_file "src/core/MathematicalConcept.js"

echo "游戏场景验证:"
check_file "src/scenes/BootScene.js"
check_file "src/scenes/MainMenuScene.js"
check_file "src/scenes/GameScene.js"

echo "目录结构验证:"
check_dir "src/core"
check_dir "src/scenes"
check_dir "assets"
check_dir "functions"

# 13. 显示文件大小统计
echo ""
echo "📊 WebContent目录统计:"
echo "总文件数: $(find "$WEBCONTENT_DIR" -type f | wc -l)"
echo "总目录数: $(find "$WEBCONTENT_DIR" -type d | wc -l)"
echo "总大小: $(du -sh "$WEBCONTENT_DIR" | cut -f1)"

echo ""
echo "✅ WebContent目录重建完成！"
echo ""
echo "🔗 测试链接:"
echo "- 验证页面: $WEBCONTENT_DIR/verify.html"
echo "- 主游戏: $WEBCONTENT_DIR/index.html"
echo ""
echo "📋 下一步:"
echo "1. 在浏览器中打开验证页面测试"
echo "2. 如果验证通过，启动主游戏"
echo "3. 运行 ./build-ios.sh 构建iOS应用"