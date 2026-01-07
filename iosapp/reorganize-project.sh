#!/bin/bash

# 重新组织iOS项目结构 - 简洁版本
# Reorganize iOS Project Structure - Clean Version

echo "🔄 重新组织iOS项目结构..."

# 1. 创建新的简洁结构
echo "📁 创建新的项目结构..."

# 删除旧的混乱结构
rm -rf ios-native
rm -rf app-store-assets
rm -rf icons
rm -rf src
rm -rf assets
rm -rf functions
rm -f *.html *.js *.json *.md *.sh

# 2. 创建简洁的目录结构
mkdir -p MathCultivation.app/{
    Xcode,
    WebGame,
    Resources,
    Scripts
}

echo "📂 新的项目结构:"
echo "MathCultivation.app/"
echo "├── Xcode/          # Xcode项目文件"
echo "├── WebGame/        # 完整的Web游戏"
echo "├── Resources/      # 图标、截图等资源"
echo "└── Scripts/        # 构建和测试脚本"

# 3. 复制Xcode项目到新位置
echo "📱 复制Xcode项目..."
cp -r ../iosapp/ios-native/MathCultivation* MathCultivation.app/Xcode/

# 4. 复制Web游戏到新位置
echo "🎮 复制Web游戏..."
cp -r ../src MathCultivation.app/WebGame/
cp -r ../assets MathCultivation.app/WebGame/
cp -r ../functions MathCultivation.app/WebGame/
cp ../index.html MathCultivation.app/WebGame/
cp ../manifest.json MathCultivation.app/WebGame/
cp ../sw.js MathCultivation.app/WebGame/

# 5. 复制资源文件
echo "🎨 复制资源文件..."
if [ -d "../iosapp/icons" ]; then
    cp -r ../iosapp/icons MathCultivation.app/Resources/
fi

# 6. 复制脚本文件
echo "🔧 复制脚本文件..."
cp ../iosapp/build-ios.sh MathCultivation.app/Scripts/
cp ../iosapp/test-ios-project.js MathCultivation.app/Scripts/
cp ../iosapp/convert-icons-to-png.js MathCultivation.app/Scripts/

# 7. 更新Xcode项目中的WebContent
echo "🔗 更新Xcode项目中的Web内容..."
rm -rf MathCultivation.app/Xcode/MathCultivation/WebContent
cp -r MathCultivation.app/WebGame MathCultivation.app/Xcode/MathCultivation/WebContent

# 8. 清理系统文件
echo "🧹 清理系统文件..."
find MathCultivation.app -name "._*" -delete
find MathCultivation.app -name ".DS_Store" -delete

# 9. 创建简洁的README
cat > MathCultivation.app/README.md << 'EOF'
# 数道仙途 iOS应用
## Mathematical Cultivation Path - iOS App

### 📱 快速开始

#### 1. 测试Web游戏
```bash
# 打开Web游戏测试
open WebGame/index.html
```

#### 2. 打开Xcode项目
```bash
# 用Xcode打开iOS项目
open Xcode/MathCultivation.xcodeproj
```

#### 3. 构建iOS应用
```bash
# 运行构建脚本
cd Scripts
./build-ios.sh
```

### 📁 项目结构

```
MathCultivation.app/
├── Xcode/                  # 🎯 用Xcode打开这个
│   └── MathCultivation.xcodeproj
├── WebGame/                # 🎮 Web版游戏测试
│   ├── index.html         # 主游戏页面
│   ├── src/               # 游戏源代码
│   └── assets/            # 游戏资源
├── Resources/              # 📦 应用资源
│   └── icons/             # 应用图标
└── Scripts/                # 🔧 构建脚本
    ├── build-ios.sh       # iOS构建脚本
    └── test-ios-project.js # 项目测试脚本
```

### 🚀 使用说明

1. **测试游戏**: 双击 `WebGame/index.html`
2. **开发iOS**: 双击 `Xcode/MathCultivation.xcodeproj`
3. **构建应用**: 运行 `Scripts/build-ios.sh`

### ✅ 项目状态
- ✅ Web游戏完整
- ✅ iOS项目配置完成
- ✅ 所有资源就绪
- ✅ 构建脚本可用

---
*简洁版本 - 2026年1月7日*
EOF

# 10. 创建快速启动脚本
cat > MathCultivation.app/QUICK_START.sh << 'EOF'
#!/bin/bash

echo "🎮 数道仙途 iOS应用 - 快速启动"
echo "================================"
echo ""
echo "选择操作:"
echo "1. 测试Web游戏"
echo "2. 打开Xcode项目"
echo "3. 构建iOS应用"
echo "4. 运行项目测试"
echo ""
read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo "🎮 启动Web游戏..."
        open WebGame/index.html
        ;;
    2)
        echo "📱 打开Xcode项目..."
        open Xcode/MathCultivation.xcodeproj
        ;;
    3)
        echo "🔨 构建iOS应用..."
        cd Scripts && ./build-ios.sh
        ;;
    4)
        echo "🧪 运行项目测试..."
        cd Scripts && node test-ios-project.js
        ;;
    *)
        echo "❌ 无效选择"
        ;;
esac
EOF

chmod +x MathCultivation.app/QUICK_START.sh

# 11. 验证新结构
echo ""
echo "✅ 项目重组完成！"
echo ""
echo "📊 新结构统计:"
echo "Xcode项目: $(find MathCultivation.app/Xcode -name "*.swift" | wc -l) 个Swift文件"
echo "Web游戏: $(find MathCultivation.app/WebGame -name "*.js" | wc -l) 个JS文件"
echo "应用图标: $(find MathCultivation.app/Resources -name "*.png" 2>/dev/null | wc -l) 个图标"
echo "构建脚本: $(find MathCultivation.app/Scripts -name "*.sh" | wc -l) 个脚本"

echo ""
echo "🎯 现在你只需要:"
echo "1. 测试游戏: open MathCultivation.app/WebGame/index.html"
echo "2. 开发iOS: open MathCultivation.app/Xcode/MathCultivation.xcodeproj"
echo "3. 快速启动: ./MathCultivation.app/QUICK_START.sh"

echo ""
echo "📁 项目位置: $(pwd)/MathCultivation.app"