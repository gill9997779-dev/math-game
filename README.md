# 数道仙途 - 数学修仙游戏

一个基于 Phaser.js 和 Cloudflare Pages 的数学教育游戏，将数学学习与修仙主题相结合。

## 游戏简介

《数道仙途》是一款创新的数学教育游戏，玩家通过探索世界、发现"数学之灵"、解答数学题目来提升修为境界。游戏融合了角色成长、探索收集、合成创造等元素，让数学学习变得更有趣。

## 核心玩法

1. **探索世界** - 在不同区域中探索，发现数学之灵和资源
2. **解答题目** - 与数学之灵互动，解答数学题目获得修为
3. **提升境界** - 积累修为，从炼气期逐步提升至渡劫期
4. **收集资源** - 收集灵草、矿石等材料
5. **合成创造** - 使用收集的材料合成丹药和装备

## 技术架构

- **前端**: Phaser.js 3.x (2D 游戏引擎)
- **后端**: Cloudflare Pages Functions (Serverless API)
- **数据库**: Cloudflare KV Storage
- **部署**: Cloudflare Pages

## 项目结构

```
.
├── src/
│   ├── main.js                 # 游戏入口
│   ├── core/                   # 核心系统
│   │   ├── Player.js           # 玩家角色系统
│   │   ├── MathProblem.js      # 数学题目系统
│   │   ├── Zone.js             # 区域管理系统
│   │   └── Crafting.js         # 合成系统
│   └── scenes/                 # 游戏场景
│       ├── BootScene.js        # 启动场景
│       ├── MainMenuScene.js    # 主菜单
│       ├── GameScene.js        # 主游戏场景
│       ├── MathChallengeScene.js  # 数学挑战场景
│       ├── InventoryScene.js   # 背包场景
│       └── CraftingScene.js    # 合成场景
├── functions/                  # Cloudflare Functions
│   └── api/
│       ├── save.js            # 存档 API
│       ├── load.js            # 读档 API
│       └── leaderboard.js     # 排行榜 API
├── index.html                 # 主 HTML 文件
├── package.json               # 项目配置
├── wrangler.toml             # Cloudflare 配置
└── README.md                 # 项目说明

```

## 安装与运行

### 本地开发

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

游戏将在 `http://localhost:8788` 运行

### 部署到 Cloudflare Pages

1. **配置 KV Storage**
```bash
# 创建 KV 命名空间
wrangler kv:namespace create "SHUDAO_KV"
wrangler kv:namespace create "SHUDAO_KV" --preview

# 在 wrangler.toml 中添加配置
# [[kv_namespaces]]
# binding = "SHUDAO_KV"
# id = "your-kv-namespace-id"
```

2. **部署**
```bash
npm run deploy
```

或者通过 GitHub 连接 Cloudflare Pages 进行自动部署。

## 游戏系统说明

### 境界系统

游戏包含 9 个境界等级：
- 炼气 → 筑基 → 金丹 → 元婴 → 化神 → 炼虚 → 合体 → 大乘 → 渡劫

每个境界需要达到相应的修为值才能突破。

### 数学题目系统

题目按难度和主题分类：
- **四则运算** (青石村) - 基础加减乘除
- **代数** (五行山) - 方程求解
- **几何** (上古遗迹) - 面积计算
- **函数** (天外天) - 函数求值

### 区域系统

- **青石村** - 新手区，对应炼气境
- **五行山** - 进阶区，对应金丹境
- **上古遗迹** - 高阶区，对应元婴境

### 合成系统

可以合成以下物品：
- **修为丹** - 获得额外修为
- **回血丹** - 恢复生命值
- **回灵丹** - 恢复灵力
- **悟性丹** - 提升答题准确率

## API 接口

### 保存游戏
```
POST /api/save
Body: { playerData: {...}, playerId: "..." }
```

### 加载游戏
```
GET /api/load?playerId=...
```

### 排行榜
```
GET /api/leaderboard        # 获取排行榜
POST /api/leaderboard       # 提交分数
```

## 开发说明

### 添加新题目类型

在 `src/core/MathProblem.js` 中添加新的生成方法：

```javascript
generateNewTopic() {
    // 生成题目逻辑
    this.problem = "...";
    this.correctAnswer = ...;
    this.generateOptions();
}
```

### 添加新区域

在 `src/core/Zone.js` 的 `initializeZones()` 方法中添加：

```javascript
this.zones.set('新区域名', new Zone('新区域名', {
    realmRequired: '所需境界',
    mathTopic: '题目类型',
    // ... 其他配置
}));
```

### 添加新配方

在 `src/core/Crafting.js` 的 `initializeRecipes()` 方法中添加：

```javascript
pills: [
    {
        id: '新丹药ID',
        name: '新丹药名称',
        ingredients: [...],
        result: {...}
    }
]
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系。




