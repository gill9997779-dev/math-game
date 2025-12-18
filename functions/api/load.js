/**
 * 加载玩家数据 API
 * Cloudflare Pages Function
 */
export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const playerId = url.searchParams.get('playerId') || 'default_player';
        const key = `player:${playerId}`;
        
        let playerData = null;
        
        // 从 KV Storage 读取
        if (env.SHUDAO_KV) {
            const data = await env.SHUDAO_KV.get(key);
            if (data) {
                playerData = JSON.parse(data);
            }
        } else {
            console.warn('KV Storage 未配置');
        }
        
        return new Response(JSON.stringify({
            success: true,
            playerData: playerData,
            message: playerData ? '加载成功' : '未找到存档'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: '加载失败: ' + error.message
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}




