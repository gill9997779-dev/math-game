# 部署问题修复指南

## 问题：网页只显示 "Hello world" 或几乎什么都没有

### 可能的原因

1. **Cloudflare Pages Worker 拦截了请求**
   - 如果存在 `functions/_worker.js`，它会拦截所有请求
   - 如果 worker 只返回 "Hello world"，就会看到这个内容

2. **Build output directory 配置错误**
   - 如果设置为错误的目录，可能只部署了部分文件

3. **静态文件没有被正确部署**
   - `index.html` 和其他静态文件可能没有被上传

### 解决方案

#### 方案 1：删除或修复 Worker（推荐）

如果存在 `functions/_worker.js`，有两个选择：

**选项 A：删除 worker（最简单）**
- 删除 `functions/_worker.js` 文件
- 让 Cloudflare Pages 正常服务静态文件
- API Functions（`functions/api/*.js`）仍然会正常工作

**选项 B：修复 worker**
- 确保 worker 不拦截静态文件请求
- 只处理 API 请求或特殊路由

#### 方案 2：检查 Build output directory

在 Cloudflare Dashboard 中：
1. Pages → 你的项目 → Settings → Builds & deployments
2. 确认 **Build output directory** 设置为 `.`（当前目录）
3. 确认 **Root directory** 设置为 `/`（根目录）

#### 方案 3：验证部署的文件

在 Cloudflare Dashboard 中：
1. Pages → 你的项目 → Deployments
2. 点击最新的部署
3. 查看 "Files" 或 "Assets" 标签
4. 确认以下文件存在：
   - `index.html` ✓
   - `src/` 目录 ✓
   - `assets/` 目录 ✓

#### 方案 4：清除缓存重新部署

1. 在 Cloudflare Dashboard 中：
   - Pages → 你的项目 → Settings → Builds & deployments
   - 点击 "Clear cache and retry deployment"

2. 或者推送一个空提交：
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push origin main
   ```

### 快速检查清单

- [ ] 检查是否存在 `functions/_worker.js`
- [ ] 如果存在，确认它不会拦截静态文件
- [ ] Build output directory 设置为 `.`
- [ ] Root directory 设置为 `/`
- [ ] `index.html` 在项目根目录
- [ ] 所有文件都已提交到 GitHub
- [ ] 最新部署已完成

### 推荐配置

对于静态网站项目，**不需要** `functions/_worker.js`，除非你需要：
- 自定义路由处理
- 请求拦截和修改
- 特殊的安全策略

对于大多数情况，只需要：
- `index.html` 在根目录
- `functions/api/*.js` 用于 API 端点
- 不需要 `functions/_worker.js`




