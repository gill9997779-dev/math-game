/**
 * 排行榜 API
 * Cloudflare Pages Function
 */
export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method === 'GET') {
        // 获取排行榜
        try {
            let leaderboard = [];
            
            if (env.SHUDAO_KV) {
                // 从 KV 获取排行榜数据
                const data = await env.SHUDAO_KV.get('leaderboard');
                if (data) {
                    leaderboard = JSON.parse(data);
                }
            }
            
            // 按修为排序
            leaderboard.sort((a, b) => b.exp - a.exp);
            
            return new Response(JSON.stringify({
                success: true,
                leaderboard: leaderboard.slice(0, 100) // 返回前100名
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: '获取排行榜失败: ' + error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    } else if (request.method === 'POST') {
        // 提交分数
        try {
            const data = await request.json();
            const { playerId, playerName, exp, realm } = data;
            
            if (!playerId || exp === undefined) {
                return new Response(JSON.stringify({
                    success: false,
                    message: '缺少必要数据'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
            
            if (env.SHUDAO_KV) {
                // 获取现有排行榜
                let leaderboard = [];
                const existing = await env.SHUDAO_KV.get('leaderboard');
                if (existing) {
                    leaderboard = JSON.parse(existing);
                }
                
                // 更新或添加玩家数据
                const existingIndex = leaderboard.findIndex(p => p.playerId === playerId);
                const playerData = {
                    playerId,
                    playerName: playerName || '匿名玩家',
                    exp,
                    realm,
                    updatedAt: Date.now()
                };
                
                if (existingIndex >= 0) {
                    leaderboard[existingIndex] = playerData;
                } else {
                    leaderboard.push(playerData);
                }
                
                // 保存回 KV
                await env.SHUDAO_KV.put('leaderboard', JSON.stringify(leaderboard));
            }
            
            return new Response(JSON.stringify({
                success: true,
                message: '提交成功'
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: '提交失败: ' + error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    } else if (request.method === 'OPTIONS') {
        // CORS 预检
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }
    
    return new Response('Method not allowed', { status: 405 });
}




