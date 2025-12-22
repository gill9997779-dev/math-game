# Cloudflare Pages 项目 KV Storage 配置说明

## ⚠️ 重要区别

**Cloudflare Pages 项目**和 **Cloudflare Workers 项目**的 KV 配置方式不同：

- **Workers 项目**：可以在 `wrangler.toml` 中直接配置 `kv_namespaces`
- **Pages 项目**：必须在 **Cloudflare Dashboard** 中通过 UI 绑定 KV namespace

## 📋 配置步骤（Pages 项目）

### 1. 在 Cloudflare Dashboard 中绑定 KV Namespace

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入你的 **Pages 项目**（`shudao-xiantu`）
3. 点击 **Settings** → **Functions**
4. 滚动到 **KV namespace bindings** 部分
5. 点击 **Add binding**
6. 配置如下：
   - **Variable name**: `SHUDAO_KV`（必须与代码中的名称一致）
   - **KV namespace**: 选择 `math-game` 或输入 ID `2c5e94ca0ff8456e97dcb64f4eb29c87`
7. 点击 **Save**

### 2. 重新部署项目

绑定完成后，需要重新部署项目以使配置生效：

- **自动部署**：如果使用 GitHub 连接，推送代码即可自动部署
- **手动部署**：在 Dashboard 中点击 **Retry deployment** 或重新触发部署

## 🔍 验证配置

配置成功后：

1. 在游戏中保存一次游戏
2. 如果看到提示 **"游戏已保存到云端和本地！"**（绿色），说明 KV 配置成功 ✅
3. 如果看到提示 **"游戏已保存到本地存储（云端未配置）"**（橙色），说明 KV 还未配置 ❌

## 📝 KV Namespace 信息

- **名称**: `math-game`
- **ID**: `2c5e94ca0ff8456e97dcb64f4eb29c87`
- **Binding 名称**: `SHUDAO_KV`（代码中使用）

## 💻 本地开发

如果需要本地开发时使用 KV：

```bash
# 使用 wrangler pages dev 命令，并指定 KV namespace
wrangler pages dev . --kv SHUDAO_KV=2c5e94ca0ff8456e97dcb64f4eb29c87
```

或者使用 `wrangler.toml` 中的配置（已更新）：

```bash
wrangler pages dev .
```

## 🔧 代码中的使用

代码中使用 `env.SHUDAO_KV` 来访问 KV Storage：

```javascript
// functions/api/save.js
if (env.SHUDAO_KV) {
    await env.SHUDAO_KV.put(key, JSON.stringify(saveData));
}
```

## ⚠️ 常见问题

### Q: 为什么在 Dashboard 中绑定了，但还是提示"云端未配置"？

A: 可能的原因：
1. 绑定后没有重新部署项目
2. Variable name 不匹配（必须是 `SHUDAO_KV`）
3. 部署还在进行中，等待几分钟后重试

### Q: 可以在 wrangler.toml 中配置吗？

A: 可以写在 `wrangler.toml` 中作为文档，但 **Pages 项目不会自动使用**。必须在 Dashboard 中绑定才能生效。

### Q: 本地开发时如何使用 KV？

A: 使用 `wrangler pages dev` 命令时，通过 `--kv` 参数指定 KV namespace ID。

---

**配置完成后，请重新部署项目以使配置生效！**

