# 紧急修复方案

## 问题
Cloudflare Pages 在 Build command 之前自动运行 `npm ci`，使用缓存的旧 `package-lock.json`。

## 解决方案

### 步骤 1：修改 Build command（必须）
设置为：
```
rm -rf node_modules package-lock.json && npm install
```

### 步骤 2：清除缓存（必须）
Cloudflare Dashboard → Pages → 你的项目 → Settings → Builds & deployments → **点击 "Clear cache and retry deployment"**

### 步骤 3：如果还不行
删除 `package-lock.json` 并重新生成：
```bash
git rm package-lock.json
npm install
git add package-lock.json
git commit -m "Remove and regenerate package-lock.json"
git push origin main
```

然后清除缓存并重新部署。

