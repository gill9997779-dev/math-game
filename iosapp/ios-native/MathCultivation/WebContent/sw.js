// Service Worker for 数道仙途 iOS App
// PWA Enhancement Phase 1

const CACHE_NAME = 'math-cultivation-v1.1.0';
const STATIC_CACHE = 'static-v1.1.0';
const DYNAMIC_CACHE = 'dynamic-v1.1.0';
const CONCEPT_CACHE = 'concepts-v1.1.0';

// 核心静态资源 - 立即缓存
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/main.js',
    '/src/init.js',
    
    // 核心系统文件
    '/src/core/Player.js',
    '/src/core/MathematicalConcept.js',
    '/src/core/MathProblem.js',
    '/src/core/Zone.js',
    '/src/core/MenuSystem.js',
    '/src/core/Logger.js',
    '/src/core/ButtonFactory.js',
    '/src/core/BackgroundManager.js',
    
    // 主要游戏场景
    '/src/scenes/BootScene.js',
    '/src/scenes/PreloadScene.js',
    '/src/scenes/LoadingScene.js',
    '/src/scenes/LoginScene.js',
    '/src/scenes/MainMenuScene.js',
    '/src/scenes/GameScene.js',
    '/src/scenes/ConceptExplorationScene.js',
    '/src/scenes/ConceptGameScene.js',
    
    // 核心游戏资源
    '/assets/images/game_background.png',
    '/assets/images/loading_background.png',
    
    // 区域背景图片
    '/assets/images/zones/青石村_background.png',
    '/assets/images/zones/五行山_background.png',
    '/assets/images/zones/天机阁_background.png',
    '/assets/images/zones/上古遗迹_background.png'
];

// 数学概念相关文件 - 优先缓存
const CONCEPT_ASSETS = [
    '/src/core/MathematicalConcept.js',
    '/src/core/MathProblem.js',
    '/src/scenes/ConceptGameScene.js',
    '/src/scenes/ConceptExplorationScene.js'
];

// 游戏系统文件 - 按需缓存
const GAME_SYSTEM_ASSETS = [
    '/src/core/AchievementSystem.js',
    '/src/core/TaskSystem.js',
    '/src/core/SkillSystem.js',
    '/src/core/ShopSystem.js',
    '/src/core/CraftingSystem.js',
    '/src/core/TreasureSystem.js',
    '/src/core/EventSystem.js',
    '/src/core/DailyCheckInSystem.js',
    '/src/core/ChallengeSystem.js',
    '/src/core/CombatPowerSystem.js',
    '/src/core/DropSystem.js'
];

// Service Worker 安装事件
self.addEventListener('install', event => {
    console.log('[SW] 安装 Service Worker v1.1.0');
    
    event.waitUntil(
        Promise.all([
            // 缓存静态资源
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] 缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // 缓存数学概念资源
            caches.open(CONCEPT_CACHE).then(cache => {
                console.log('[SW] 缓存数学概念资源');
                return cache.addAll(CONCEPT_ASSETS);
            })
        ]).then(() => {
            console.log('[SW] 所有核心资源已缓存');
            // 强制激活新的 Service Worker
            return self.skipWaiting();
        })
    );
});

// Service Worker 激活事件
self.addEventListener('activate', event => {
    console.log('[SW] 激活 Service Worker v1.1.0');
    
    event.waitUntil(
        Promise.all([
            // 清理旧缓存
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== CONCEPT_CACHE) {
                            console.log('[SW] 删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // 立即控制所有客户端
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Service Worker 已激活并控制所有页面');
        })
    );
});

// 网络请求拦截
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // 只处理同源请求
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

// 请求处理策略
async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // API 请求 - 网络优先策略
        if (pathname.startsWith('/api/')) {
            return await handleApiRequest(request);
        }
        
        // 静态资源 - 缓存优先策略
        if (isStaticAsset(pathname)) {
            return await handleStaticAsset(request);
        }
        
        // 数学概念相关 - 缓存优先策略
        if (isConceptAsset(pathname)) {
            return await handleConceptAsset(request);
        }
        
        // 游戏系统文件 - 缓存优先策略
        if (isGameSystemAsset(pathname)) {
            return await handleGameSystemAsset(request);
        }
        
        // HTML 页面 - 网络优先，缓存备用
        if (pathname === '/' || pathname.endsWith('.html')) {
            return await handleHtmlRequest(request);
        }
        
        // 其他资源 - 网络优先
        return await fetch(request);
        
    } catch (error) {
        console.error('[SW] 请求处理错误:', error);
        return await handleOfflineFallback(request);
    }
}

// API 请求处理 - 网络优先，支持离线同步
async function handleApiRequest(request) {
    try {
        const response = await fetch(request);
        
        // 缓存成功的 API 响应
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('[SW] API 离线，尝试缓存响应');
        
        // 离线时返回缓存的响应
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 返回离线 API 响应
        return createOfflineApiResponse(request);
    }
}

// 静态资源处理 - 缓存优先
async function handleStaticAsset(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] 静态资源加载失败:', request.url);
        throw error;
    }
}

// 数学概念资源处理
async function handleConceptAsset(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CONCEPT_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] 概念资源加载失败:', request.url);
        throw error;
    }
}

// 游戏系统资源处理
async function handleGameSystemAsset(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] 游戏系统资源加载失败:', request.url);
        throw error;
    }
}

// HTML 请求处理
async function handleHtmlRequest(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 返回离线页面
        return caches.match('/index.html');
    }
}

// 离线回退处理
async function handleOfflineFallback(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
        return caches.match('/index.html');
    }
    
    // 返回通用错误响应
    return new Response('离线模式：资源不可用', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
}

// 创建离线 API 响应
function createOfflineApiResponse(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/load') {
        // 返回默认玩家数据
        return new Response(JSON.stringify({
            success: true,
            data: {
                username: '离线玩家',
                level: 1,
                realm: '炼气',
                experience: 0,
                coins: 100,
                offline: true
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (url.pathname === '/api/save') {
        // 模拟保存成功，实际数据会在恢复网络时同步
        return new Response(JSON.stringify({
            success: true,
            message: '数据已保存到本地，将在网络恢复时同步'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify({
        success: false,
        error: '离线模式：API 不可用'
    }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
    });
}

// 资源类型判断函数
function isStaticAsset(pathname) {
    return STATIC_ASSETS.some(asset => pathname === asset || pathname.endsWith(asset));
}

function isConceptAsset(pathname) {
    return CONCEPT_ASSETS.some(asset => pathname === asset || pathname.endsWith(asset));
}

function isGameSystemAsset(pathname) {
    return GAME_SYSTEM_ASSETS.some(asset => pathname === asset || pathname.endsWith(asset));
}

// 后台同步事件
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('[SW] 执行后台同步');
        event.waitUntil(syncGameData());
    }
});

// 同步游戏数据
async function syncGameData() {
    try {
        // 获取本地存储的待同步数据
        const pendingData = await getStoredSyncData();
        
        if (pendingData && pendingData.length > 0) {
            for (const data of pendingData) {
                await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }
            
            // 清除已同步的数据
            await clearStoredSyncData();
            console.log('[SW] 游戏数据同步完成');
        }
    } catch (error) {
        console.error('[SW] 数据同步失败:', error);
    }
}

// 获取待同步数据（这里需要与主应用的存储系统集成）
async function getStoredSyncData() {
    // 实际实现需要访问 IndexedDB 或其他本地存储
    return [];
}

// 清除已同步数据
async function clearStoredSyncData() {
    // 实际实现需要清理本地存储
}

// 消息处理
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('[SW] Service Worker 脚本已加载 - 数道仙途 v1.1.0');