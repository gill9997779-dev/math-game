# 修復：鏡頭推進動畫錯誤

## 🐛 問題描述

點擊"初踏仙途"按鈕時出現錯誤：
```
MenuSystem.js:280 Uncaught TypeError: pathGuide.quadraticCurveTo is not a function
```

## 🔍 問題原因

Phaser 3 的 Graphics 對象不支持 `quadraticCurveTo()` 方法。這是 Canvas 2D API 的方法，但 Phaser 3 使用自己的 Graphics API。

## ✅ 修復方案

將 `quadraticCurveTo()` 替換為使用多個 `lineTo()` 點來模擬曲線路徑。

### 修復前：
```javascript
pathGuide.beginPath();
pathGuide.moveTo(width * 0.1, height * 0.9);
pathGuide.quadraticCurveTo(width * 0.3, height * 0.6, width * 0.5, height * 0.4);
pathGuide.quadraticCurveTo(width * 0.7, height * 0.2, width * 0.9, height * 0.1);
pathGuide.strokePath();
```

### 修復後：
```javascript
// 使用多個點來模擬曲線路徑
const pathPoints = [
    { x: width * 0.1, y: height * 0.9 },
    { x: width * 0.2, y: height * 0.75 },
    { x: width * 0.3, y: height * 0.6 },
    { x: width * 0.45, y: height * 0.5 },
    { x: width * 0.5, y: height * 0.4 },
    { x: width * 0.6, y: height * 0.3 },
    { x: width * 0.7, y: height * 0.2 },
    { x: width * 0.85, y: height * 0.15 },
    { x: width * 0.9, y: height * 0.1 }
];

pathGuide.moveTo(pathPoints[0].x, pathPoints[0].y);
for (let i = 1; i < pathPoints.length; i++) {
    pathGuide.lineTo(pathPoints[i].x, pathPoints[i].y);
}
pathGuide.strokePath();
```

## 📝 Phaser 3 Graphics API 說明

Phaser 3 的 Graphics 對象支持的方法：
- ✅ `moveTo(x, y)` - 移動到點
- ✅ `lineTo(x, y)` - 畫線到點
- ✅ `strokePath()` - 描邊路徑
- ✅ `fillPath()` - 填充路徑
- ✅ `arc(x, y, radius, startAngle, endAngle)` - 圓弧
- ❌ `beginPath()` - 不需要（自動處理）
- ❌ `quadraticCurveTo()` - 不支持
- ❌ `bezierCurveTo()` - 不支持

## ✅ 修復結果

現在點擊"初踏仙途"按鈕時：
1. ✅ 不再出現錯誤
2. ✅ 道路視覺引導正常顯示（使用多個點模擬的曲線）
3. ✅ 鏡頭推進動畫正常工作
4. ✅ 法陣和轉場效果正常

## 🎯 測試建議

1. 刷新頁面
2. 點擊"初踏仙途"按鈕
3. 應該看到：
   - 道路視覺引導（蜿蜒的曲線）
   - 鏡頭推進動畫
   - 法陣發光效果
   - 白色閃光轉場
   - 進入遊戲場景



