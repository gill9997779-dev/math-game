#!/bin/bash

# iOS应用构建脚本
# Build script for iOS Math Cultivation App

set -e  # 遇到错误时退出

echo "🍎 开始构建iOS应用 - 数道仙途"
echo "=================================="

# 检查必要工具
check_requirements() {
    echo "🔍 检查构建环境..."
    
    # 检查Xcode
    if ! command -v xcodebuild &> /dev/null; then
        echo "❌ 错误: 未找到Xcode命令行工具"
        echo "请安装Xcode并运行: xcode-select --install"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未找到Node.js"
        echo "请安装Node.js: https://nodejs.org/"
        exit 1
    fi
    
    echo "✅ 构建环境检查通过"
}

# 准备Web内容
prepare_web_content() {
    echo "📦 准备Web内容..."
    
    # 确保WebContent目录存在
    WEB_CONTENT_DIR="ios-native/MathCultivation/WebContent"
    mkdir -p "$WEB_CONTENT_DIR"
    
    # 复制最新的Web文件
    echo "📋 复制游戏源代码..."
    cp -r src/ "$WEB_CONTENT_DIR/"
    
    echo "🖼️  复制游戏资源..."
    cp -r assets/ "$WEB_CONTENT_DIR/"
    
    echo "⚙️  复制API函数..."
    cp -r functions/ "$WEB_CONTENT_DIR/"
    
    echo "📄 复制核心文件..."
    cp index.html manifest.json sw.js "$WEB_CONTENT_DIR/"
    
    # 复制图标到WebContent
    if [ -d "icons" ]; then
        cp -r icons/ "$WEB_CONTENT_DIR/"
    fi
    
    echo "✅ Web内容准备完成"
}

# 生成应用图标
generate_icons() {
    echo "🎨 生成应用图标..."
    
    if [ -f "convert-icons-to-png.js" ]; then
        node convert-icons-to-png.js
        echo "✅ 应用图标生成完成"
    else
        echo "⚠️  图标转换脚本未找到，跳过图标生成"
    fi
}

# 验证Xcode项目
validate_xcode_project() {
    echo "🔍 验证Xcode项目..."
    
    PROJECT_PATH="ios-native/MathCultivation.xcodeproj"
    
    if [ ! -d "$PROJECT_PATH" ]; then
        echo "❌ 错误: 未找到Xcode项目文件"
        echo "项目路径: $PROJECT_PATH"
        exit 1
    fi
    
    # 检查项目是否可以打开
    if xcodebuild -project "$PROJECT_PATH" -list &> /dev/null; then
        echo "✅ Xcode项目验证通过"
    else
        echo "❌ 错误: Xcode项目文件损坏或配置错误"
        exit 1
    fi
}

# 构建iOS应用
build_ios_app() {
    echo "🔨 开始构建iOS应用..."
    
    cd ios-native
    
    # 清理之前的构建
    echo "🧹 清理之前的构建..."
    xcodebuild clean -project MathCultivation.xcodeproj -scheme MathCultivation
    
    # 构建应用 (模拟器)
    echo "📱 构建iOS模拟器版本..."
    xcodebuild build \
        -project MathCultivation.xcodeproj \
        -scheme MathCultivation \
        -configuration Debug \
        -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
        -derivedDataPath build/
    
    if [ $? -eq 0 ]; then
        echo "✅ iOS模拟器版本构建成功"
    else
        echo "❌ iOS模拟器版本构建失败"
        cd ..
        exit 1
    fi
    
    cd ..
}

# 创建归档 (用于App Store)
create_archive() {
    echo "📦 创建应用归档..."
    
    cd ios-native
    
    # 创建归档
    xcodebuild archive \
        -project MathCultivation.xcodeproj \
        -scheme MathCultivation \
        -configuration Release \
        -destination generic/platform=iOS \
        -archivePath build/MathCultivation.xcarchive
    
    if [ $? -eq 0 ]; then
        echo "✅ 应用归档创建成功"
        echo "📁 归档位置: ios-native/build/MathCultivation.xcarchive"
    else
        echo "❌ 应用归档创建失败"
        cd ..
        exit 1
    fi
    
    cd ..
}

# 运行测试
run_tests() {
    echo "🧪 运行单元测试..."
    
    cd ios-native
    
    xcodebuild test \
        -project MathCultivation.xcodeproj \
        -scheme MathCultivation \
        -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest'
    
    if [ $? -eq 0 ]; then
        echo "✅ 所有测试通过"
    else
        echo "⚠️  部分测试失败，但构建继续"
    fi
    
    cd ..
}

# 显示构建信息
show_build_info() {
    echo ""
    echo "🎉 构建完成！"
    echo "=================================="
    echo "📱 应用名称: 数道仙途 (Mathematical Cultivation Path)"
    echo "📦 Bundle ID: com.mathcultivation.app"
    echo "🔢 版本号: 1.1.0"
    echo ""
    echo "📁 构建产物:"
    echo "   - iOS模拟器应用: ios-native/build/Build/Products/Debug-iphonesimulator/"
    echo "   - 应用归档: ios-native/build/MathCultivation.xcarchive"
    echo ""
    echo "📋 下一步:"
    echo "1. 在Xcode中打开项目进行进一步测试"
    echo "2. 使用iOS模拟器测试应用功能"
    echo "3. 连接真机进行设备测试"
    echo "4. 准备App Store Connect上传"
    echo ""
    echo "🚀 启动命令:"
    echo "   open ios-native/MathCultivation.xcodeproj"
}

# 主函数
main() {
    # 解析命令行参数
    BUILD_TYPE="debug"
    RUN_TESTS=false
    CREATE_ARCHIVE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --release)
                BUILD_TYPE="release"
                CREATE_ARCHIVE=true
                shift
                ;;
            --test)
                RUN_TESTS=true
                shift
                ;;
            --archive)
                CREATE_ARCHIVE=true
                shift
                ;;
            --help)
                echo "iOS构建脚本使用说明:"
                echo "  ./build-ios.sh [选项]"
                echo ""
                echo "选项:"
                echo "  --release    构建Release版本并创建归档"
                echo "  --test       运行单元测试"
                echo "  --archive    创建App Store归档"
                echo "  --help       显示此帮助信息"
                exit 0
                ;;
            *)
                echo "未知选项: $1"
                echo "使用 --help 查看帮助信息"
                exit 1
                ;;
        esac
    done
    
    # 执行构建步骤
    check_requirements
    prepare_web_content
    generate_icons
    validate_xcode_project
    build_ios_app
    
    if [ "$RUN_TESTS" = true ]; then
        run_tests
    fi
    
    if [ "$CREATE_ARCHIVE" = true ]; then
        create_archive
    fi
    
    show_build_info
}

# 运行主函数
main "$@"