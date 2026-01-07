# Cloudflare Pages 构建配置修复指南

## 当前配置问题

根据您提供的配置，发现以下问题：

### ❌ 问题 1：Non-production branch deploy command

**当前值**：`npx wrangler versions upload`

**问题**：这是 Workers 的命令，不是 Pages 的命令。对于 Pages 项目，应该使用占位符命令。

**修复**：
- 如果字段无法留空，使用占位符命令：`echo "Deploying preview..."`

### ✅ 正确的配置

```
Build command: npm install
Deploy command: echo "Deploying via Cloudflare Pages automatic deployment"
Non-production branch deploy command: echo "Deploying preview..."
```

### ⚠️ 还需要检查的配置

在 Cloudflare Dashboard 中，还需要确认以下设置：

1. **Build output directory**（构建输出目录）
   - 应该设置为：`.`（当前目录）
   - 或者：`/`（根目录）

2. **Root directory**（根目录）
   - 应该设置为：`/`（根目录）
   - 或者留空（默认）

3. **Framework preset**
   - 应该设置为：`None` 或 `Other`

## 完整配置示例

```
Framework preset: None
Build command: npm install
Build output directory: .
Root directory: /
Deploy command: echo "Deploying via Cloudflare Pages automatic deployment"
Non-production branch deploy command: (留空)
```

## 为什么 Non-production branch deploy command 应该使用占位符？

1. **Cloudflare Pages 自动处理**：对于通过 GitHub 连接的 Pages 项目，Cloudflare 会自动检测代码变更并部署
2. **避免认证错误**：使用 `wrangler versions upload` 需要 API Token 权限，容易导致认证错误
3. **简化配置**：静态网站项目不需要额外的部署命令
4. **占位符命令**：如果字段无法留空，使用 `echo "Deploying preview..."` 作为占位符，不会执行实际部署操作

## 修复步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → 你的项目 → **Settings** → **Builds & deployments**
3. 找到 "Non-production branch deploy command" 字段
4. **修改为**：`echo "Deploying preview..."`
5. 确认 "Build output directory" 设置为 `.`
6. 确认 "Root directory" 设置为 `/` 或留空
7. 保存设置
8. 触发新的部署（可以推送一个空提交）

## 验证配置

部署完成后，检查：
- 部署日志中是否有错误
- 部署的文件列表是否包含 `index.html`、`src/`、`assets/` 等
- 访问网站是否能正常显示游戏

