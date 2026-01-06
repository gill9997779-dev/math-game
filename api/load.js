// 本地开发模拟 API
export default function handler(req, res) {
    const { playerId } = req.query;
    
    // 本地开发返回空数据，表示没有存档
    res.status(200).json({
        success: true,
        playerData: null,
        message: '本地开发模式 - 未找到存档'
    });
}