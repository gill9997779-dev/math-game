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
        
        // 保存到 KV Storage（保存完整的游戏数据，包括所有系统）
        const saveData = data.playerData; // 现在 playerData 包含所有系统数据
        
        let saved = false;
        let message = '保存成功';
        
        if (env.SHUDAO_KV) {
            try {
                await env.SHUDAO_KV.put(key, JSON.stringify(saveData), {
                    expirationTtl: 60 * 60 * 24 * 365 // 1年过期
                });
                saved = true;
                console.log(`数据已保存到 Cloudflare KV: ${key}`);
            } catch (kvError) {
                console.error('KV 保存失败:', kvError);
                message = '保存到 Cloudflare KV 失败: ' + kvError.message;
            }
        } else {
            // 如果没有 KV，数据不会持久化
            console.warn('⚠ KV Storage 未配置，数据不会保存到 Cloudflare');
            console.warn('请在 Cloudflare Dashboard 中配置 KV namespace 绑定');
            message = '保存失败：KV Storage 未配置。请在 Cloudflare Dashboard 中配置 KV namespace。';
        }
        
        return new Response(JSON.stringify({
            success: saved,
            message: message,
            savedToCloudflare: saved
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


