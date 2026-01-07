# 故障排除指南

## 问题：网页只显示 "Hello world"

### 可能的原因

1. **Cloudflare Pages 部署了错误的文件**
   - 检查 Build output directory 是否正确设置为 `.`
   - 确认 `index.html` 在根目录

2. **构建输出目录配置错误**
   - 在 Cloudflare Dashboard 中，Build output directory 应该设置为 `.`（当前目录）

3. **路由配置问题**
   - 检查 `_redirects` 文件是否存在且正确

### 解决方案

#### 1. 检查 Cloudflare Pages 构建配置

在 Cloudflare Dashboard 中确认：

```
Framework preset: None
Build command: npm install
Build output directory: .  ← 必须是当前目录
Root directory: /
Deploy command: (留空)
```

#### 2. 验证文件结构

确保以下文件在根目录：
- `index.html` ✓
- `src/` 目录 ✓
- `assets/` 目录 ✓
- `functions/` 目录 ✓

#### 3. 检查部署日志

在 Cloudflare Dashboard → Pages → 你的项目 → Deployments 中：
- 查看最新的部署日志
- 确认所有文件都已上传
- 检查是否有错误信息

#### 4. 清除缓存重新部署

1. 在 Cloudflare Dashboard 中：
   - Pages → 你的项目 → Settings → Builds & deployments
   - 点击 "Retry deployment" 或 "Clear cache and retry"

2. 或者推送一个新的空提交触发重新部署：
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push origin main
   ```

#### 5. 验证 index.html 路径

访问你的 Pages URL 时，确保访问的是：
- `https://your-project.pages.dev/` （根路径）
- 而不是其他路径

#### 6. 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
- Console 标签：是否有 JavaScript 错误
- Network 标签：`index.html` 和 `src/init.js` 是否成功加载
- 如果看到 404 错误，说明文件路径有问题

### 快速检查清单

- [ ] `index.html` 在项目根目录
- [ ] Build output directory 设置为 `.`
- [ ] Deploy command 已删除或留空
- [ ] 所有文件都已提交到 GitHub
- [ ] Cloudflare Pages 已连接到正确的 GitHub 仓库
- [ ] 最新部署已完成且成功

### 如果问题仍然存在

1. 在 Cloudflare Dashboard 中查看部署日志的完整输出
2. 检查部署的文件列表，确认 `index.html` 是否在列表中
3. 尝试访问 `https://your-project.pages.dev/index.html` 直接访问文件




