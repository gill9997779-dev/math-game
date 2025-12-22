# 部署指南

## Cloudflare Pages 部署步骤

### 1. 准备工作

1. 注册/登录 [Cloudflare](https://dash.cloudflare.com/)
2. 安装 Wrangler CLI（如果还没有）
```bash
npm install -g wrangler
```

3. 登录 Cloudflare
```bash
wrangler login
```

### 2. 创建 KV Namespace

KV Storage 用于存储玩家数据和排行榜。

```bash
# 创建生产环境 KV
wrangler kv:namespace create "SHUDAO_KV"

# 创建预览环境 KV
wrangler kv:namespace create "SHUDAO_KV" --preview
```

执行后会得到两个 ID，例如：
- Production: `id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`
- Preview: `preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"`

### 3. 配置 wrangler.toml

在 `wrangler.toml` 中添加 KV 配置：

```toml
name = "shudao-xiantu"
compatibility_date = "2024-01-01"
pages_build_output_dir = "."

[[kv_namespaces]]
binding = "SHUDAO_KV"
id = "你的生产环境KV ID"

[[kv_namespaces]]
binding = "SHUDAO_KV"
preview_id = "你的预览环境KV ID"
```

### 4. 部署方式

#### 方式一：通过 Wrangler CLI 部署

```bash
npm run deploy
```

#### 方式二：通过 GitHub 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Dashboard 中：
   - 进入 Pages
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 选择你的 GitHub 仓库
   - 配置构建设置：
     - Build command: `npm install` (或留空)
     - Build output directory: `.` (当前目录)
   - 在 "Environment variables" 中添加 KV binding：
     - Variable name: `SHUDAO_KV`
     - KV namespace: 选择你创建的 KV namespace

3. 每次推送到主分支会自动部署

### 5. 配置自定义域名（可选）

在 Cloudflare Pages 项目设置中可以：
- 添加自定义域名
- 配置 HTTPS（自动启用）
- 设置环境变量

### 6. 验证部署

部署完成后，访问你的 Pages URL（格式：`https://your-project.pages.dev`）

测试功能：
- 开始游戏
- 解答题目
- 保存游戏
- 继续游戏

## 本地开发

### 使用本地 KV（开发模式）

```bash
npm run dev
```

注意：本地开发时，如果没有配置 KV，游戏会使用内存存储（数据不会持久化）。

### 使用远程 KV（开发模式）

```bash
wrangler pages dev . --compatibility-date=2024-01-01 --kv SHUDAO_KV=你的KV_ID
```

## 故障排除

### KV Storage 未配置

如果看到 "KV Storage 未配置" 的警告：
1. 确认已创建 KV namespace
2. 确认 `wrangler.toml` 中配置正确
3. 确认在 Cloudflare Pages 中绑定了 KV namespace

### CORS 错误

API 函数已包含 CORS 头，如果仍有问题，检查：
- `functions/api/*.js` 中的 CORS 头设置
- 浏览器控制台的错误信息

### 游戏无法加载

1. 检查浏览器控制台错误
2. 确认 Phaser.js 已正确加载
3. 检查网络请求是否成功

## 性能优化

### 启用缓存

在 `_headers` 文件中可以添加缓存策略：

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### 压缩资源

Cloudflare Pages 会自动压缩资源，无需额外配置。

## 监控与分析

可以在 Cloudflare Dashboard 中查看：
- 请求统计
- 错误日志
- 性能指标
- KV 使用情况




