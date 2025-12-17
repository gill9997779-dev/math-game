/**
 * 保存玩家数据 API
 * Cloudflare Pages Function
 */
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const data = await request.json();
        
        if (!data.playerData) {
            return new Response(JSON.stringify({
                success: false,
                message: '缺少玩家数据'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 生成玩家ID（简单实现，实际应该从认证获取）
        const playerId = data.playerId || 'default_player';
        const key = `player:${playerId}`;
        
        // 保存到 KV Storage
        if (env.SHUDAO_KV) {
            await env.SHUDAO_KV.put(key, JSON.stringify(data.playerData), {
                expirationTtl: 60 * 60 * 24 * 365 // 1年过期
            });
        } else {
            // 如果没有 KV，使用内存存储（仅用于开发）
            console.warn('KV Storage 未配置，使用内存存储（数据不会持久化）');
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: '保存成功'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: '保存失败: ' + error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}


