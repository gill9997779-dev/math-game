//
//  WebViewBridge.swift
//  数道仙途 - Mathematical Cultivation Path
//
//  Created by Kiro AI Assistant on 2026/1/7.
//  Copyright © 2026 MathCultivation Team. All rights reserved.
//

import UIKit
import UserNotifications
import Photos
import CoreHaptics

// MARK: - WebView桥接功能实现

extension ViewController {
    
    // MARK: - 触觉反馈处理
    
    func handleHapticFeedback(_ messageBody: [String: Any]) {
        guard let type = messageBody["type"] as? String else { return }
        
        DispatchQueue.main.async {
            switch type {
            case "light":
                self.lightImpactGenerator?.impactOccurred()
            case "medium":
                self.mediumImpactGenerator?.impactOccurred()
            case "heavy":
                self.heavyImpactGenerator?.impactOccurred()
            case "selection":
                self.selectionGenerator?.selectionChanged()
            case "success":
                self.notificationGenerator?.notificationOccurred(.success)
            case "warning":
                self.notificationGenerator?.notificationOccurred(.warning)
            case "error":
                self.notificationGenerator?.notificationOccurred(.error)
            default:
                self.lightImpactGenerator?.impactOccurred()
            }
            
            // 重新预热生成器
            self.prepareHapticFeedback()
        }
        
        print("📳 触觉反馈: \(type)")
    }
    
    // MARK: - 通知处理
    
    func handleShowNotification(_ messageBody: [String: Any]) {
        guard let title = messageBody["title"] as? String,
              let body = messageBody["body"] as? String else { return }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        // 设置徽章
        if let badge = messageBody["badge"] as? Int {
            content.badge = NSNumber(value: badge)
        }
        
        // 设置用户信息
        if let userInfo = messageBody["userInfo"] as? [String: Any] {
            content.userInfo = userInfo
        }
        
        // 设置延迟
        let delay = messageBody["delay"] as? TimeInterval ?? 0
        
        // 创建触发器
        let trigger: UNNotificationTrigger?
        if delay > 0 {
            trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay / 1000, repeats: false)
        } else {
            trigger = nil
        }
        
        // 创建请求
        let identifier = messageBody["identifier"] as? String ?? UUID().uuidString
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        // 添加通知
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ 通知安排失败: \(error.localizedDescription)")
            } else {
                print("✅ 通知已安排: \(title)")
            }
        }
    }
    
    // MARK: - 分享处理
    
    func handleShareProgress(_ messageBody: [String: Any]) {
        guard let text = messageBody["text"] as? String else { return }
        
        let title = messageBody["title"] as? String ?? "数道仙途"
        let url = messageBody["url"] as? String ?? ""
        
        var activityItems: [Any] = [text]
        
        if !url.isEmpty, let shareURL = URL(string: url) {
            activityItems.append(shareURL)
        }
        
        DispatchQueue.main.async {
            let activityViewController = UIActivityViewController(
                activityItems: activityItems,
                applicationActivities: nil
            )
            
            // iPad支持
            if let popover = activityViewController.popoverPresentationController {
                popover.sourceView = self.view
                popover.sourceRect = CGRect(x: self.view.bounds.midX, y: self.view.bounds.midY, width: 0, height: 0)
                popover.permittedArrowDirections = []
            }
            
            self.present(activityViewController, animated: true) {
                print("✅ 分享界面已显示")
            }
        }
    }
    
    // MARK: - 保存到相册
    
    func handleSaveToPhotos(_ messageBody: [String: Any]) {
        guard let imageDataString = messageBody["imageData"] as? String,
              let imageData = Data(base64Encoded: imageDataString),
              let image = UIImage(data: imageData) else {
            print("❌ 图片数据无效")
            return
        }
        
        // 检查相册权限
        PHPhotoLibrary.requestAuthorization { status in
            switch status {
            case .authorized, .limited:
                // 保存图片到相册
                PHPhotoLibrary.shared().performChanges({
                    PHAssetCreationRequest.creationRequestForAsset(from: image)
                }) { success, error in
                    DispatchQueue.main.async {
                        if success {
                            print("✅ 图片已保存到相册")
                            self.showToast("图片已保存到相册")
                        } else {
                            print("❌ 图片保存失败: \(error?.localizedDescription ?? "未知错误")")
                            self.showToast("图片保存失败")
                        }
                    }
                }
            case .denied, .restricted:
                DispatchQueue.main.async {
                    self.showPhotoPermissionAlert()
                }
            case .notDetermined:
                print("⚠️ 相册权限未确定")
            @unknown default:
                print("⚠️ 未知的相册权限状态")
            }
        }
    }
    
    // MARK: - 应用徽章
    
    func handleSetBadge(_ messageBody: [String: Any]) {
        let count = messageBody["count"] as? Int ?? 0
        
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber = count
            print("🔢 应用徽章设置为: \(count)")
        }
    }
    
    // MARK: - 设备信息
    
    func handleGetDeviceInfo() {
        let deviceInfo = [
            "model": UIDevice.current.model,
            "systemName": UIDevice.current.systemName,
            "systemVersion": UIDevice.current.systemVersion,
            "identifierForVendor": UIDevice.current.identifierForVendor?.uuidString ?? "",
            "screenScale": UIScreen.main.scale,
            "screenSize": [
                "width": UIScreen.main.bounds.width,
                "height": UIScreen.main.bounds.height
            ],
            "safeAreaInsets": [
                "top": view.safeAreaInsets.top,
                "bottom": view.safeAreaInsets.bottom,
                "left": view.safeAreaInsets.left,
                "right": view.safeAreaInsets.right
            ],
            "isNetworkAvailable": isNetworkAvailable,
            "batteryLevel": UIDevice.current.batteryLevel,
            "batteryState": batteryStateString(),
            "orientation": orientationString(),
            "preferredLanguage": Locale.preferredLanguages.first ?? "en"
        ] as [String : Any]
        
        let message = [
            "type": "deviceInfo",
            "payload": deviceInfo
        ]
        
        sendMessageToWebView(message)
    }
    
    // MARK: - 错误日志
    
    func handleLogError(_ messageBody: [String: Any]) {
        let errorMessage = messageBody["message"] as? String ?? "未知错误"
        let errorStack = messageBody["stack"] as? String ?? ""
        let errorType = messageBody["type"] as? String ?? "JavaScript Error"
        
        print("🐛 [\(errorType)] \(errorMessage)")
        if !errorStack.isEmpty {
            print("📍 Stack: \(errorStack)")
        }
        
        // 这里可以集成崩溃报告服务，如Firebase Crashlytics
        // Crashlytics.crashlytics().record(error: NSError(...))
    }
    
    // MARK: - 游戏初始化完成
    
    func handleGameInitialized(_ messageBody: [String: Any]) {
        let loadTime = messageBody["loadTime"] as? Int ?? 0
        print("🎉 游戏初始化完成，加载时间: \(loadTime)ms")
        
        // 触发成功的触觉反馈
        DispatchQueue.main.async {
            self.notificationGenerator?.notificationOccurred(.success)
        }
        
        // 可以在这里添加分析事件
        // Analytics.logEvent("game_initialized", parameters: ["load_time": loadTime])
    }
    
    // MARK: - 辅助方法
    
    private func showToast(_ message: String) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        present(alert, animated: true)
        
        // 2秒后自动消失
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            alert.dismiss(animated: true)
        }
    }
    
    private func showPhotoPermissionAlert() {
        let alert = UIAlertController(
            title: "需要相册权限",
            message: "数道仙途需要访问相册来保存您的学习成就截图。请在设置中允许访问相册。",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "去设置", style: .default) { _ in
            if let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(settingsURL)
            }
        })
        
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))
        
        present(alert, animated: true)
    }
    
    private func batteryStateString() -> String {
        switch UIDevice.current.batteryState {
        case .unknown:
            return "unknown"
        case .unplugged:
            return "unplugged"
        case .charging:
            return "charging"
        case .full:
            return "full"
        @unknown default:
            return "unknown"
        }
    }
    
    private func orientationString() -> String {
        switch UIDevice.current.orientation {
        case .portrait:
            return "portrait"
        case .portraitUpsideDown:
            return "portraitUpsideDown"
        case .landscapeLeft:
            return "landscapeLeft"
        case .landscapeRight:
            return "landscapeRight"
        case .faceUp:
            return "faceUp"
        case .faceDown:
            return "faceDown"
        case .unknown:
            return "unknown"
        @unknown default:
            return "unknown"
        }
    }
}

// MARK: - 用户活动支持

extension ViewController {
    
    func createUserActivity(for action: String, userInfo: [String: Any] = [:]) -> NSUserActivity {
        let activity = NSUserActivity(activityType: "com.mathcultivation.\(action)")
        activity.title = getUserActivityTitle(for: action)
        activity.userInfo = userInfo
        activity.isEligibleForSearch = true
        activity.isEligibleForPrediction = true
        
        // 设置关键词用于Spotlight搜索
        activity.keywords = getUserActivityKeywords(for: action)
        
        return activity
    }
    
    private func getUserActivityTitle(for action: String) -> String {
        switch action {
        case "concept":
            return "学习数学概念"
        case "challenge":
            return "每日数学挑战"
        case "progress":
            return "查看学习进度"
        default:
            return "数道仙途"
        }
    }
    
    private func getUserActivityKeywords(for action: String) -> Set<String> {
        switch action {
        case "concept":
            return ["数学", "概念", "学习", "教育"]
        case "challenge":
            return ["挑战", "每日", "练习", "题目"]
        case "progress":
            return ["进度", "成就", "统计", "报告"]
        default:
            return ["数道仙途", "数学", "游戏"]
        }
    }
}

// MARK: - 快捷方式支持

extension ViewController {
    
    func setupShortcutItems() {
        let conceptShortcut = UIApplicationShortcutItem(
            type: "com.mathcultivation.concept",
            localizedTitle: "数学概念",
            localizedSubtitle: "探索数学概念",
            icon: UIApplicationShortcutIcon(systemImageName: "function"),
            userInfo: nil
        )
        
        let challengeShortcut = UIApplicationShortcutItem(
            type: "com.mathcultivation.challenge",
            localizedTitle: "每日挑战",
            localizedSubtitle: "完成今日挑战",
            icon: UIApplicationShortcutIcon(systemImageName: "target"),
            userInfo: nil
        )
        
        let progressShortcut = UIApplicationShortcutItem(
            type: "com.mathcultivation.progress",
            localizedTitle: "学习进度",
            localizedSubtitle: "查看修仙进度",
            icon: UIApplicationShortcutIcon(systemImageName: "chart.line.uptrend.xyaxis"),
            userInfo: nil
        )
        
        UIApplication.shared.shortcutItems = [conceptShortcut, challengeShortcut, progressShortcut]
    }
}