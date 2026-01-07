#!/bin/bash

# 修复iOS应用WebContent目录结构
# Fix iOS App WebContent Directory Structure

echo "🔧 开始修复WebContent目录结构..."

# 设置路径
WEBCONTENT_DIR="ios-native/MathCultivation/WebContent"
SRC_DIR="src"

# 1. 清理WebContent目录
echo "🧹 清理WebContent目录..."
rm -rf "$WEBCONTENT_DIR"
mkdir -p "$WEBCONTENT_DIR"

# 2. 复制核心文件
echo "📄 复制核心HTML和配置文件..."
cp index.html "$WEBCONTENT_DIR/"
cp manifest.json "$WEBCONTENT_DIR/"
cp sw.js "$WEBCONTENT_DIR/"

# 3. 复制src目录（正确的游戏源代码）
echo "📁 复制游戏源代码..."
cp -r "$SRC_DIR" "$WEBCONTENT_DIR/"

# 4. 复制assets目录
echo "🖼️  复制游戏资源..."
cp -r assets "$WEBCONTENT_DIR/"

# 5. 复制functions目录
echo "⚙️  复制API函数..."
cp -r functions "$WEBCONTENT_DIR/"

# 6. 复制图标文件
echo "🎨 复制应用图标..."
if [ -d "icons" ]; then
    cp -r icons "$WEBCONTENT_DIR/"
fi

# 7. 清理macOS系统文件
echo "🧹 清理系统文件..."
find "$WEBCONTENT_DIR" -name "._*" -type f -delete
find "$WEBCONTENT_DIR" -name ".DS_Store" -type f -delete

# 8. 验证关键文件
echo "✅ 验证关键文件..."

check_file() {
    if [ -f "$WEBCONTENT_DIR/$1" ]; then
        echo "  ✓ $1"
    else
        echo "  ❌ $1 缺失"
    fi
}

check_dir() {
    if [ -d "$WEBCONTENT_DIR/$1" ]; then
        echo "  ✓ $1/ ($(ls "$WEBCONTENT_DIR/$1" | wc -l) 个文件)"
    else
        echo "  ❌ $1/ 目录缺失"
    fi
}

echo "核心文件:"
check_file "index.html"
check_file "manifest.json"
check_file "sw.js"

echo "游戏源代码:"
check_file "src/init.js"
check_file "src/main.js"
check_file "src/NativeBridge.js"

echo "核心系统:"
check_file "src/core/Player.js"
check_file "src/core/MathProblem.js"
check_file "src/core/MathematicalConcept.js"

echo "游戏场景:"
check_file "src/scenes/BootScene.js"
check_file "src/scenes/MainMenuScene.js"
check_file "src/scenes/GameScene.js"

echo "目录结构:"
check_dir "src/core"
check_dir "src/scenes"
check_dir "assets"
check_dir "functions"

# 9. 创建测试页面
echo "📝 创建测试页面..."
cat > "$WEBCONTENT_DIR/test.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数道仙途 - 测试页面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: white;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .test-item {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }
        .success { border-left: 4px solid #4CAF50; }
        .error { border-left: 4px solid #f44336; }
        .warning { border-left: 4px solid #ff9800; }
        button {
            background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 数道仙途 - iOS应用测试</h1>
        
        <div class="test-item">
            <h3>📱 环境检测</h3>
            <p id="environment-info">检测中...</p>
        </div>
        
        <div class="test-item">
            <h3>📁 文件加载测试</h3>
            <div id="file-tests">测试中...</div>
        </div>
        
        <div class="test-item">
            <h3>🎯 功能测试</h3>
            <button onclick="testNativeBridge()">测试原生桥接</button>
            <button onclick="testPhaser()">测试Phaser引擎</button>
            <button onclick="testGameInit()">测试游戏初始化</button>
            <div id="function-results"></div>
        </div>
        
        <div class="test-item">
            <h3>🚀 启动游戏</h3>
            <button onclick="startGame()">启动完整游戏</button>
            <div id="game-status"></div>
        </div>
    </div>

    <script>
        // 环境检测
        function detectEnvironment() {
            const info = {
                userAgent: navigator.userAgent,
                isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
                isNativeApp: !!(window.webkit && window.webkit.messageHandlers),
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                pixelRatio: window.devicePixelRatio,
                online: navigator.onLine
            };
            
            document.getElementById('environment-info').innerHTML = `
                <p><strong>设备类型:</strong> ${info.isIOS ? 'iOS设备' : '其他设备'}</p>
                <p><strong>应用类型:</strong> ${info.isNativeApp ? '原生应用' : 'Web应用'}</p>
                <p><strong>屏幕尺寸:</strong> ${info.screenSize}</p>
                <p><strong>视口尺寸:</strong> ${info.viewport}</p>
                <p><strong>像素比:</strong> ${info.pixelRatio}</p>
                <p><strong>网络状态:</strong> ${info.online ? '在线' : '离线'}</p>
            `;
        }
        
        // 文件加载测试
        async function testFileLoading() {
            const files = [
                'src/init.js',
                'src/main.js',
                'src/NativeBridge.js',
                'src/core/Player.js',
                'src/scenes/BootScene.js',
                'manifest.json'
            ];
            
            const results = [];
            
            for (const file of files) {
                try {
                    const response = await fetch(file);
                    if (response.ok) {
                        results.push(`✅ ${file}`);
                    } else {
                        results.push(`❌ ${file} (${response.status})`);
                    }
                } catch (error) {
                    results.push(`❌ ${file} (${error.message})`);
                }
            }
            
            document.getElementById('file-tests').innerHTML = results.join('<br>');
        }
        
        // 测试原生桥接
        function testNativeBridge() {
            const results = document.getElementById('function-results');
            
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeApp) {
                results.innerHTML += '<p class="success">✅ 原生桥接可用</p>';
                
                // 测试发送消息
                try {
                    window.webkit.messageHandlers.nativeApp.postMessage({
                        action: 'test',
                        message: 'Hello from WebView!'
                    });
                    results.innerHTML += '<p class="success">✅ 消息发送成功</p>';
                } catch (error) {
                    results.innerHTML += `<p class="error">❌ 消息发送失败: ${error.message}</p>`;
                }
            } else {
                results.innerHTML += '<p class="warning">⚠️ 原生桥接不可用（Web环境）</p>';
            }
        }
        
        // 测试Phaser引擎
        function testPhaser() {
            const results = document.getElementById('function-results');
            
            if (typeof Phaser !== 'undefined') {
                results.innerHTML += `<p class="success">✅ Phaser引擎已加载 (版本: ${Phaser.VERSION})</p>`;
            } else {
                results.innerHTML += '<p class="error">❌ Phaser引擎未加载</p>';
                
                // 尝试加载Phaser
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js';
                script.onload = () => {
                    results.innerHTML += '<p class="success">✅ Phaser引擎动态加载成功</p>';
                };
                script.onerror = () => {
                    results.innerHTML += '<p class="error">❌ Phaser引擎动态加载失败</p>';
                };
                document.head.appendChild(script);
            }
        }
        
        // 测试游戏初始化
        async function testGameInit() {
            const results = document.getElementById('function-results');
            
            try {
                // 动态导入NativeBridge
                const { default: NativeBridge } = await import('./src/NativeBridge.js');
                results.innerHTML += '<p class="success">✅ NativeBridge模块加载成功</p>';
                
                // 测试NativeBridge功能
                if (NativeBridge) {
                    const deviceInfo = NativeBridge.getDeviceInfo();
                    results.innerHTML += `<p class="success">✅ 设备信息获取成功</p>`;
                }
            } catch (error) {
                results.innerHTML += `<p class="error">❌ 模块加载失败: ${error.message}</p>`;
            }
        }
        
        // 启动完整游戏
        function startGame() {
            const status = document.getElementById('game-status');
            status.innerHTML = '<p>🚀 正在启动游戏...</p>';
            
            // 重定向到主游戏页面
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
        
        // 页面加载完成后执行测试
        window.addEventListener('load', () => {
            detectEnvironment();
            testFileLoading();
        });
    </script>
</body>
</html>
EOF

echo "✅ WebContent目录修复完成！"
echo ""
echo "📋 下一步:"
echo "1. 运行项目测试: node test-ios-project.js"
echo "2. 在iOS模拟器中测试: 打开 WebContent/test.html"
echo "3. 构建iOS应用: ./build-ios.sh"
echo ""
echo "🔗 测试链接:"
echo "- 测试页面: ios-native/MathCultivation/WebContent/test.html"
echo "- 主游戏: ios-native/MathCultivation/WebContent/index.html"