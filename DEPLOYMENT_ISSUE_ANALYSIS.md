# Cloudflare Pages 部署問題分析：卡在 "Installing tools and dependencies"

## 🔍 問題診斷

根據您的專案配置和歷史文檔，部署卡在 "Installing tools and dependencies" 階段的主要原因如下：

### 1. **npm ci 與緩存衝突問題**

Cloudflare Pages 預設使用 `npm ci`（clean install）來安裝依賴，這要求：
- `package-lock.json` 必須與 `package.json` **完全同步**
- 如果 Cloudflare 使用了**緩存的舊版本** `package-lock.json`，會導致版本不匹配錯誤

### 2. **當前配置檢查**

✅ **package.json** 配置正確：
```json
{
  "devDependencies": {
    "wrangler": "^4.0.0"
  }
}
```

✅ **package-lock.json** 已同步：
- wrangler 版本：`4.54.0`（符合 `^4.0.0` 要求）

✅ **.cloudflare/pages.json** 配置：
```json
{
  "build": {
    "command": "npm install",
    "output": "."
  }
}
```

### 3. **可能的原因**

1. **Cloudflare 緩存問題**：
   - Cloudflare 可能仍在使用舊的緩存 `package-lock.json`
   - 即使您推送了新版本，如果不清除緩存，仍可能使用舊版本

2. **npm ci 嚴格檢查**：
   - `npm ci` 要求 `package-lock.json` 與 `package.json` 完全匹配
   - 任何微小的差異都會導致安裝失敗

3. **網路或超時問題**：
   - 安裝大型依賴（如 wrangler）時可能超時
   - npm registry 連接問題

## ✅ 解決方案（按優先順序）

### 方案 1：清除緩存 + 使用 npm install（最推薦）

#### 步驟 1：清除 Cloudflare 緩存（**必須先執行**）

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Pages** → 選擇您的專案 → **Settings** → **Builds & deployments**
3. **點擊 "Clear cache and retry deployment"** 按鈕
4. 這會清除所有構建緩存

#### 步驟 2：修改 Build command

在 Cloudflare Dashboard 中，將 **Build command** 修改為：

```
npm install --force
```

**為什麼使用 `npm install --force`？**
- `npm install` 會自動更新 `package-lock.json` 以匹配 `package.json`
- `--force` 參數可以強制重新安裝，忽略緩存問題
- 對於靜態網站專案，使用 `npm install` 是安全的（不需要 `npm ci` 的嚴格檢查）

#### 步驟 3：確認完整配置

在 Cloudflare Dashboard 中確認以下配置：

```
Framework preset: None
Build command: npm install --force
Build output directory: .
Root directory: /
Deploy command: echo "Deploying via Cloudflare Pages automatic deployment"
```

### 方案 2：強制清除並重新安裝

如果方案 1 無效，修改 Build command 為：

```
rm -rf node_modules package-lock.json && npm install
```

**注意**：某些環境可能不支援 `rm` 命令，如果失敗，請使用方案 1。

### 方案 3：使用 npm ci 但確保同步

如果您想繼續使用 `npm ci`，必須確保：

1. **本地重新生成 package-lock.json**：
   ```bash
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Regenerate package-lock.json"
   git push origin main
   ```

2. **清除 Cloudflare 緩存**（必須）

3. **Build command 使用**：
   ```
   npm ci
   ```

## 🔧 詳細操作步驟

### 1. 清除 Cloudflare 緩存（最重要！）

1. 登入 Cloudflare Dashboard
2. 進入 **Pages** → 您的專案
3. 點擊 **Settings** → **Builds & deployments**
4. 找到 **"Clear cache and retry deployment"** 按鈕並點擊
5. 等待緩存清除完成

### 2. 修改 Build command

1. 在同一個頁面（**Builds & deployments**）
2. 找到 **Build command** 欄位
3. 修改為：`npm install --force`
4. 點擊 **Save**

### 3. 確認其他配置

確保以下配置正確：

- ✅ **Framework preset**: `None` 或 `Other`
- ✅ **Build command**: `npm install --force`
- ✅ **Build output directory**: `.`
- ✅ **Root directory**: `/`
- ✅ **Deploy command**: `echo "Deploying via Cloudflare Pages automatic deployment"`（或留空）

### 4. 觸發重新部署

1. 推送一個新的提交到 GitHub（或使用空提交）：
   ```bash
   git commit --allow-empty -m "Trigger rebuild after cache clear"
   git push origin main
   ```

2. 或者在 Cloudflare Dashboard 中點擊 **"Retry deployment"**

## 📋 驗證修復

部署完成後，檢查日誌應該看到：

- ✅ `added X packages`（而不是從緩存恢復）
- ✅ `Success: Build command completed`
- ❌ 不應該有 "Invalid: lock file's wrangler@X.X.X" 錯誤
- ❌ 不應該有版本不匹配錯誤
- ❌ 不應該卡在 "Installing tools and dependencies" 階段

## ⚠️ 常見錯誤訊息

### 錯誤 1：版本不匹配
```
npm ERR! Invalid: lock file's wrangler@3.114.15 does not satisfy wrangler@^4.0.0
```
**解決方法**：清除緩存 + 使用 `npm install --force`

### 錯誤 2：package-lock.json 不同步
```
npm ERR! ci can only install packages when your package.json and package-lock.json are in sync
```
**解決方法**：清除緩存 + 使用 `npm install`（而不是 `npm ci`）

### 錯誤 3：安裝超時
```
npm ERR! network timeout
```
**解決方法**：
- 檢查網路連接
- 重試部署
- 考慮使用 `npm install --prefer-offline`（如果允許）

## 🎯 關鍵提示

1. **最重要的一步是清除 Cloudflare 的緩存！**
   - 即使您修改了 Build command，如果不清除緩存，Cloudflare 可能仍使用緩存的舊版本 `package-lock.json`

2. **使用 `npm install` 而不是 `npm ci`**
   - 對於靜態網站專案，`npm install` 更寬鬆且更適合
   - `npm ci` 要求完全同步，容易因緩存問題失敗

3. **確保 package-lock.json 已提交到 Git**
   - 確保 `package-lock.json` 在 Git 倉庫中且是最新版本

## 🔍 如果問題仍然存在

如果清除緩存並修改 Build command 後問題仍然存在：

1. **檢查部署日誌**：
   - 在 Cloudflare Dashboard 中查看完整的構建日誌
   - 尋找具體的錯誤訊息

2. **驗證 package-lock.json**：
   ```bash
   # 本地驗證
   npm ci
   # 如果成功，說明本地沒問題，問題在 Cloudflare 緩存
   ```

3. **嘗試完全重新生成**：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Force regenerate package-lock.json"
   git push origin main
   ```

4. **聯繫 Cloudflare 支援**：
   - 如果以上方法都無效，可能是 Cloudflare 平台問題
   - 提供完整的構建日誌給支援團隊

## 📝 總結

**最簡單有效的解決方案**：
1. ✅ 清除 Cloudflare 緩存
2. ✅ 修改 Build command 為 `npm install --force`
3. ✅ 觸發重新部署

這應該能解決 90% 的 "Installing tools and dependencies" 卡住問題。


