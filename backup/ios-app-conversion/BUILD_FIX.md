# 修复 Cloudflare Pages 构建缓存问题

## 问题

Cloudflare Pages 使用 `npm ci`（clean install），但它使用了缓存的旧版本 `package-lock.json`，导致版本不匹配错误。

## 解决方案

### 方案 1：修改 Build command（推荐）

在 Cloudflare Dashboard 中，将 Build command 从：
```
npm install
```

改为：
```
rm -f package-lock.json && npm install
```

或者（如果上面的命令不支持）：
```
npm install --no-package-lock && npm install
```

### 方案 2：清除 Cloudflare 缓存

1. 在 Cloudflare Dashboard 中：
   - Pages → 你的项目 → Settings → Builds & deployments
   - 点击 "Clear cache and retry deployment"

2. 这会清除依赖缓存，强制重新下载所有包

### 方案 3：使用 npm install 而不是 npm ci

修改 Build command 为：
```
npm install
```

注意：Cloudflare Pages 默认使用 `npm ci`，但我们可以通过 Build command 覆盖它。

## 推荐配置

```
Build command: rm -f package-lock.json && npm install
```

或者（如果 rm 命令不支持）：
```
npm install --force
```

## 为什么会出现这个问题？

1. **依赖缓存**：Cloudflare Pages 会缓存 `node_modules` 和 `package-lock.json` 以加快构建速度
2. **版本更新**：当我们更新 `package.json` 中的 `wrangler` 从 3.x 到 4.x 时，缓存的旧版本与新版本不匹配
3. **npm ci 严格性**：`npm ci` 要求 `package-lock.json` 与 `package.json` 完全同步

## 验证

部署完成后，检查日志中应该看到：
- ✅ `added X packages`
- ✅ `Success: Build command completed`
- ❌ 不应该有版本不匹配错误




