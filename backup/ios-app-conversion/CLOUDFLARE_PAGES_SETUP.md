# Cloudflare Pages 部署配置指南

## ⚠️ 重要：修复部署错误

如果遇到以下错误：
```
✘ [错误] 看起来您在 Pages 项目中运行了 Workers 特有的命令。
对于 Pages，请运行 `wrangler pages deploy` 命令。
```

**原因**：Cloudflare Pages 在构建配置中使用了错误的部署命令 `npx wrangler deploy`（这是 Workers 的命令）。

## ✅ 解决方案

### 重要：GitHub 自动部署不需要 Deploy command

**对于通过 GitHub 连接的 Cloudflare Pages 项目，Cloudflare 会自动部署静态文件，不需要 Deploy command！**

### 在 Cloudflare Dashboard 中配置（推荐方案）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → 选择你的项目 → **Settings** → **Builds & deployments**
3. **配置以下设置**：
   - ✅ **Framework preset**: `None` 或 `Other`
   - ✅ **Build command**: `npm install` （安装依赖）
   - ✅ **Build output directory**: `.` （当前目录）
   - ✅ **Root directory**: `/` （根目录）
   - ❌ **Deploy command**: **删除或留空**（GitHub 自动部署不需要此命令）

**为什么不需要 Deploy command？**
- Cloudflare Pages 通过 GitHub 连接时，会自动检测并部署静态文件
- Deploy command 主要用于 Workers 项目或手动部署
- 使用 Deploy command 需要 API Token 权限，容易导致认证错误

### 如果 Deploy command 字段必须填写（备选方案）

如果 Cloudflare Dashboard 强制要求填写 Deploy command，可以尝试：

1. **方案 A**：填写一个空命令（如果允许）
   ```
   echo "Deploying..."
   ```

2. **方案 B**：使用正确的 API Token
   - 在 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) 创建新 Token
   - 权限需要包括：
     - `Account` → `Cloudflare Pages` → `Edit`
     - `Account` → `Account Settings` → `Read`
   - 在 Cloudflare Pages 项目设置中添加环境变量：
     - `CLOUDFLARE_API_TOKEN` = 你的 API Token
   - Deploy command: `npx wrangler pages deploy .`

**但推荐方案仍然是删除 Deploy command，让 Cloudflare 自动部署。**

### 1. 更新 Wrangler 版本

已更新 `package.json` 中的 wrangler 版本到 4.x：

```json
"wrangler": "^4.0.0"
```

### 2. 正确的构建配置

#### 构建设置（在 Cloudflare Dashboard 中）

**必须填写的字段：**

1. **Framework preset**: `None` 或 `Other`

2. **Build command**: 
   ```
   npm install
   ```
   （安装依赖，确保 wrangler 等工具可用）

3. **Build output directory**: 
   ```
   .
   ```
   （当前目录，因为所有文件都在根目录）

4. **Root directory**: 
   ```
   /
   ```
   （根目录）

5. **Deploy command**: 
   ```
   （留空或删除）
   ```
   **重要**：对于通过 GitHub 自动部署的 Pages 项目，**不需要 Deploy command**！
   Cloudflare 会自动部署静态文件。如果强制要求填写，可以使用：
   ```
   echo "Deploying via Cloudflare Pages..."
   ```

**重要提示**：
- Build command 用于安装依赖（npm install）
- **Deploy command 应该留空**（Cloudflare Pages 会自动部署）
- 如果使用 `wrangler pages deploy`，需要配置 API Token 权限，容易出错

#### 环境变量
无需特殊环境变量（除非配置了 KV Storage）

### 3. 通过 GitHub 自动部署（推荐）

1. 在 Cloudflare Dashboard 中：
   - 进入 **Pages** → **Create a project**
   - 选择 **Connect to Git**
   - 选择你的 GitHub 仓库：`gill9997779-dev/math-game`
   - 分支选择：`main`

2. **构建设置**：
   ```
   Framework preset: None
   Build command: npm install
   Build output directory: .
   ```

3. 点击 **Save and Deploy**

### 4. 手动部署（使用 Wrangler CLI）

如果使用 CLI 部署，确保使用正确的命令：

```bash
# 安装最新版本的 wrangler
npm install --save-dev wrangler@latest

# 部署到 Pages
npx wrangler pages deploy .
```

### 5. 验证部署

部署成功后，访问你的 Pages URL：
- 格式：`https://shudao-xiantu.pages.dev` 或类似
- 在 Cloudflare Dashboard 的 Pages 项目中可以看到实际 URL

## 注意事项

1. **静态文件项目**：这是一个静态网站项目，不需要构建步骤
2. **Functions**：`functions/` 目录中的 API 函数会自动被 Cloudflare Pages 识别
3. **KV Storage**：如果需要使用 KV Storage，需要在 Cloudflare Dashboard 中手动绑定

## 故障排除

### 如果仍然出现错误

1. 检查 Cloudflare Dashboard 中的构建日志
2. 确认使用的是 Pages 项目，不是 Workers 项目
3. 确保 `wrangler.toml` 中 `pages_build_output_dir = "."` 已设置

### 清除缓存重新部署

在 Cloudflare Dashboard 中：
- Pages → 你的项目 → Settings → Builds & deployments
- 可以清除缓存并重新部署

