# Cloudflare Pages 部署修复指南

## 🚨 当前错误：认证权限问题

错误信息：
```
✘ [ERROR] Authentication error [code: 10000]
```

## ✅ 最佳解决方案：删除 Deploy Command

**对于通过 GitHub 自动部署的 Cloudflare Pages 项目，不需要 Deploy command！**

### 步骤：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → 你的项目 → **Settings** → **Builds & deployments**
3. **删除 Deploy command 字段中的内容**（留空）
4. 保存设置
5. 重新部署

### 正确的配置：

```
Framework preset: None
Build command: npm install
Build output directory: .
Root directory: /
Deploy command: (留空)
```

## 🔧 如果 Deploy Command 字段无法留空

### 方案 1：使用占位符命令（推荐）

在 Deploy command 中填写：
```
echo "Deploying via Cloudflare Pages automatic deployment"
```

这个命令不会执行实际部署，Cloudflare 会自动部署静态文件。

### 方案 2：配置 API Token（复杂，不推荐）

如果需要使用 `wrangler pages deploy`，需要：

1. 创建 API Token：
   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - 创建自定义 Token
   - 权限设置：
     - Account → Cloudflare Pages → Edit
     - Account → Account Settings → Read

2. 在 Pages 项目设置中添加环境变量：
   - Variable name: `CLOUDFLARE_API_TOKEN`
   - Value: 你的 API Token

3. Deploy command 填写：
   ```
   npx wrangler pages deploy .
   ```

**但这种方式容易出错，不推荐。**

## 📝 为什么不需要 Deploy Command？

- Cloudflare Pages 通过 GitHub 连接时，会自动检测代码变更
- 构建完成后，Cloudflare 会自动部署 `Build output directory` 中的文件
- Deploy command 主要用于 Workers 项目或手动部署场景
- 静态网站项目不需要额外的部署步骤

## ✅ 推荐配置总结

```
Framework preset: None
Build command: npm install
Build output directory: .
Root directory: /
Deploy command: (留空或使用 echo 占位符)
```

保存后，Cloudflare 会自动部署你的静态文件！

