# Cloudflare Pages Deploy Command 錯誤修復

## 🚨 當前錯誤

```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
  For Pages, please run `wrangler pages deploy` instead.
```

**問題原因**：Cloudflare Dashboard 中的 **Deploy command** 設置為 `npx wrangler deploy`，這是 **Workers** 的命令，不是 **Pages** 的命令。

## ✅ 解決方案（立即修復）

### 方案 1：刪除 Deploy Command（最推薦）

**對於通過 GitHub 自動部署的 Cloudflare Pages 項目，不需要 Deploy command！**

#### 操作步驟：

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Pages** → 您的專案 → **Settings** → **Builds & deployments**
3. 找到 **Deploy command** 欄位
4. **刪除欄位中的內容**（留空）
5. 點擊 **Save** 保存
6. 觸發重新部署（或等待自動部署）

### 方案 2：使用占位符命令（如果欄位無法留空）

如果 Cloudflare Dashboard 強制要求填寫 Deploy command，使用以下占位符命令：

```
echo "Deploying via Cloudflare Pages automatic deployment"
```

這個命令：
- ✅ 不會執行實際部署操作
- ✅ 不會導致錯誤
- ✅ Cloudflare Pages 會自動部署靜態文件

## 📋 完整正確配置

在 Cloudflare Dashboard 中確認以下配置：

```
Framework preset: None
Build command: npm install --force
Build output directory: .
Root directory: /
Deploy command: (留空) 或 echo "Deploying via Cloudflare Pages automatic deployment"
```

## ⚠️ 為什麼不需要 Deploy Command？

1. **自動部署**：
   - Cloudflare Pages 通過 GitHub 連接時，會自動檢測代碼變更
   - 構建完成後，Cloudflare 會自動部署 `Build output directory` 中的文件

2. **避免錯誤**：
   - `npx wrangler deploy` 是 Workers 的命令，會導致錯誤
   - `npx wrangler pages deploy` 需要 API Token 配置，容易出錯

3. **簡化配置**：
   - 靜態網站項目不需要額外的部署步驟
   - 讓 Cloudflare 自動處理更簡單可靠

## 🔧 如果必須使用 wrangler pages deploy（不推薦）

如果您必須使用 `wrangler pages deploy`，需要：

1. **創建 API Token**：
   - 訪問 https://dash.cloudflare.com/profile/api-tokens
   - 創建自定義 Token
   - 權限設置：
     - `Account` → `Cloudflare Pages` → `Edit`
     - `Account` → `Account Settings` → `Read`

2. **在 Pages 項目設置中添加環境變數**：
   - Variable name: `CLOUDFLARE_API_TOKEN`
   - Value: 您的 API Token

3. **Deploy command 設置為**：
   ```
   npx wrangler pages deploy .
   ```

**但強烈建議使用方案 1 或方案 2，更簡單且不會出錯。**

## ✅ 修復後驗證

修復後，部署日誌應該顯示：

```
✅ Success: Build command completed
✅ (沒有 Deploy command 錯誤)
✅ Success: Deployment completed
```

在部署詳情中應該能看到所有文件：
- ✅ `index.html`
- ✅ `src/` 目錄
- ✅ `assets/` 目錄
- ✅ `functions/api/` 目錄

## 🎯 關鍵要點

1. **對於 GitHub 自動部署的 Pages 項目，Deploy command 應該留空**
2. **如果必須填寫，使用 `echo` 占位符命令**
3. **不要使用 `npx wrangler deploy`（這是 Workers 的命令）**
4. **構建成功後，Cloudflare 會自動部署文件**


