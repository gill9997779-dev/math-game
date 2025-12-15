# Cloudflare Pages 最终配置指南

## ✅ 完整配置（所有字段都必须填写）

如果某些字段无法留空，请使用以下配置：

```
Framework preset: None
Build command: npm install
Build output directory: .
Root directory: /
Deploy command: echo "Deploying via Cloudflare Pages automatic deployment"
Non-production branch deploy command: echo "Deploying preview..."
```

## 📝 配置说明

### Build command
```
npm install
```
- 安装项目依赖（phaser, wrangler 等）
- 这是必需的，确保依赖可用

### Build output directory
```
.
```
- 当前目录（根目录）
- 所有文件都在根目录，所以输出目录就是 `.`

### Root directory
```
/
```
- 根目录
- 或者可以留空（如果允许）

### Deploy command
```
echo "Deploying via Cloudflare Pages automatic deployment"
```
- 占位符命令，不会执行实际部署
- Cloudflare Pages 会自动部署静态文件
- 使用 `echo` 避免认证错误

### Non-production branch deploy command
```
echo "Deploying preview..."
```
- 占位符命令，用于预览分支部署
- 不会执行实际部署操作
- Cloudflare Pages 会自动处理预览部署

## ⚠️ 重要提示

1. **不要使用 `wrangler` 命令**：
   - ❌ `npx wrangler deploy` - 这是 Workers 的命令
   - ❌ `npx wrangler versions upload` - 这是 Workers 的命令
   - ✅ `echo "..."` - 占位符命令，安全且有效

2. **为什么使用 `echo`？**
   - `echo` 命令只是输出文本，不会执行任何实际部署操作
   - Cloudflare Pages 会自动检测并部署静态文件
   - 避免了 API Token 认证问题

3. **Build output directory 必须是 `.`**：
   - 如果设置为其他目录（如 `dist`、`build`），可能找不到 `index.html`
   - 所有文件都在根目录，所以输出目录就是当前目录

## 🔍 验证配置

部署完成后，检查：

1. **部署日志**：
   - 应该看到 "Success: Build command completed"
   - 应该看到 "Success: Deploy command completed"
   - 不应该有认证错误

2. **部署的文件**：
   - 在 Cloudflare Dashboard → Pages → 你的项目 → Deployments
   - 点击最新部署，查看 "Files" 标签
   - 应该看到：`index.html`、`src/`、`assets/`、`functions/` 等

3. **网站访问**：
   - 访问你的 Pages URL
   - 应该能看到游戏界面，而不是 "Hello world"

## 🚨 如果仍然看到 "Hello world"

1. **检查 `functions/_worker.js`**：
   - 如果存在，确保它不会拦截静态文件请求
   - 或者删除它，让 Pages 自动处理

2. **清除缓存**：
   - Cloudflare Dashboard → Pages → 你的项目 → Settings
   - 点击 "Clear cache and retry deployment"

3. **检查文件列表**：
   - 确认 `index.html` 在部署的文件列表中
   - 如果不在，检查 Build output directory 设置

## 📞 需要帮助？

如果问题仍然存在，请提供：
- Cloudflare Dashboard 中的完整构建配置截图
- 最新部署的日志
- 部署的文件列表

