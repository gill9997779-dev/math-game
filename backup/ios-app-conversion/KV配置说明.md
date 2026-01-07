# Cloudflare KV Storage 配置说明

## ✅ KV Namespace 已创建

KV namespace 名称: `math-game`

## 📋 配置步骤

### 1. 在 Cloudflare Dashboard 中绑定 KV Namespace

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入你的 Pages 项目（`shudao-xiantu`）
3. 点击 **Settings** → **Functions**
4. 在 **KV namespace bindings** 部分，点击 **Add binding**
5. 配置如下：
   - **Variable name**: `SHUDAO_KV`
   - **KV namespace**: 选择 `math-game`
6. 点击 **Save**

### 2. 验证配置

配置完成后，游戏会自动使用 KV Storage 保存和加载数据。

## 🔍 如何验证 KV 是否配置成功

1. 在游戏中保存一次游戏
2. 如果看到提示 "游戏已保存到云端和本地！"（绿色），说明 KV 配置成功
3. 如果看到 "游戏已保存到本地存储（云端未配置）"（橙色），说明 KV 还未配置

## 📝 代码中的 KV 使用

### Binding 名称
代码中使用 `env.SHUDAO_KV` 来访问 KV Storage。

### 数据存储格式
- **Key 格式**: `player:{username}`
- **Value**: JSON 格式的游戏数据

### 示例
- 用户名: `player1` → KV key: `player:player1`
- 用户名: `张三` → KV key: `player:张三`

## 🔧 本地开发

如果需要本地开发时使用 KV：

```bash
# 使用本地 KV（需要先创建）
wrangler pages dev . --kv SHUDAO_KV=你的KV_ID

# 或者使用远程 KV
wrangler pages dev . --kv SHUDAO_KV=你的KV_ID
```

## ⚠️ 注意事项

1. **Binding 名称必须匹配**: 代码中使用 `SHUDAO_KV`，所以在 Dashboard 中绑定时，Variable name 必须是 `SHUDAO_KV`
2. **数据持久化**: KV Storage 中的数据会持久保存，即使重新部署也不会丢失
3. **数据过期**: 当前配置为 1 年过期（可在 `functions/api/save.js` 中修改）
4. **本地备用**: 即使 KV 未配置，游戏也会使用 localStorage 作为备用方案

## 📊 查看 KV 数据

在 Cloudflare Dashboard 中：
1. 进入 **Workers & Pages** → **KV**
2. 选择 `math-game` namespace
3. 可以查看所有保存的数据

---

**配置完成后，请重新部署项目以使配置生效。**

