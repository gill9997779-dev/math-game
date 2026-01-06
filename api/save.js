// 本地开发模拟 API
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    const { playerData, playerId } = req.body;
    
    // 本地开发模拟保存成功
    console.log(`本地开发模式 - 模拟保存玩家数据: ${playerId}`);
    
    res.status(200).json({
        success: true,
        message: '本地开发模式 - 保存成功',
        savedToCloudflare: false
    });
}