//
//  SceneDelegate.swift
//  数道仙途 - Mathematical Cultivation Path
//
//  Created by Kiro AI Assistant on 2026/1/7.
//  Copyright © 2026 MathCultivation Team. All rights reserved.
//

import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        // 创建窗口
        window = UIWindow(windowScene: windowScene)
        
        // 创建主视图控制器
        let mainViewController = ViewController()
        
        // 设置根视图控制器
        window?.rootViewController = mainViewController
        window?.makeKeyAndVisible()
        
        // 配置窗口外观
        configureWindowAppearance()
        
        // 处理启动选项
        handleConnectionOptions(connectionOptions)
        
        print("🖼️ 场景连接完成")
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        print("🖼️ 场景已断开连接")
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        print("🖼️ 场景已激活")
        
        // 通知WebView场景状态变化
        NotificationCenter.default.post(name: .sceneDidBecomeActive, object: nil)
    }

    func sceneWillResignActive(_ scene: UIScene) {
        print("🖼️ 场景即将失去活跃状态")
        
        // 通知WebView场景状态变化
        NotificationCenter.default.post(name: .sceneWillResignActive, object: nil)
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        print("🖼️ 场景即将进入前台")
        
        // 清除应用徽章
        UIApplication.shared.applicationIconBadgeNumber = 0
        
        // 通知WebView场景状态变化
        NotificationCenter.default.post(name: .sceneWillEnterForeground, object: nil)
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        print("🖼️ 场景已进入后台")
        
        // 保存应用状态
        saveApplicationState()
        
        // 通知WebView场景状态变化
        NotificationCenter.default.post(name: .sceneDidEnterBackground, object: nil)
    }
    
    // MARK: - URL处理
    
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        
        print("🔗 场景处理URL: \(url)")
        
        // 处理URL
        handleURL(url)
    }
    
    // MARK: - 用户活动处理
    
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        print("🔄 继续用户活动: \(userActivity.activityType)")
        
        // 处理Spotlight搜索或Siri快捷方式
        handleUserActivity(userActivity)
    }
    
    // MARK: - 私有方法
    
    private func configureWindowAppearance() {
        // 配置状态栏样式
        if #available(iOS 13.0, *) {
            window?.overrideUserInterfaceStyle = .dark
        }
        
        // 配置窗口背景色
        window?.backgroundColor = UIColor(red: 0.06, green: 0.06, blue: 0.14, alpha: 1.0) // #0f0f23
    }
    
    private func handleConnectionOptions(_ connectionOptions: UIScene.ConnectionOptions) {
        // 处理URL上下文
        if let urlContext = connectionOptions.urlContexts.first {
            handleURL(urlContext.url)
        }
        
        // 处理用户活动
        if let userActivity = connectionOptions.userActivities.first {
            handleUserActivity(userActivity)
        }
        
        // 处理通知响应
        if let notificationResponse = connectionOptions.notificationResponse {
            handleNotificationResponse(notificationResponse)
        }
    }
    
    private func handleURL(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return }
        
        // 延迟处理，确保WebView已加载
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            let userInfo = ["url": url.absoluteString]
            NotificationCenter.default.post(name: .handleURL, object: nil, userInfo: userInfo)
        }
    }
    
    private func handleUserActivity(_ userActivity: NSUserActivity) {
        switch userActivity.activityType {
        case "com.mathcultivation.concept":
            // Spotlight搜索数学概念
            if let conceptId = userActivity.userInfo?["conceptId"] as? String {
                let userInfo = ["action": "openConcept", "conceptId": conceptId]
                NotificationCenter.default.post(name: .handleUserActivity, object: nil, userInfo: userInfo)
            }
            
        case "com.mathcultivation.challenge":
            // 每日挑战快捷方式
            let userInfo = ["action": "openDailyChallenge"]
            NotificationCenter.default.post(name: .handleUserActivity, object: nil, userInfo: userInfo)
            
        case "com.mathcultivation.progress":
            // 学习进度快捷方式
            let userInfo = ["action": "showProgress"]
            NotificationCenter.default.post(name: .handleUserActivity, object: nil, userInfo: userInfo)
            
        case NSUserActivityTypeBrowsingWeb:
            // Web链接处理
            if let url = userActivity.webpageURL {
                handleURL(url)
            }
            
        default:
            print("🔄 未知用户活动类型: \(userActivity.activityType)")
        }
    }
    
    private func handleNotificationResponse(_ response: UNNotificationResponse) {
        let userInfo = response.notification.request.content.userInfo
        
        // 延迟处理，确保应用完全启动
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            NotificationCenter.default.post(name: .handleNotificationResponse, object: nil, userInfo: userInfo)
        }
    }
    
    private func saveApplicationState() {
        // 保存当前应用状态
        let userDefaults = UserDefaults.standard
        userDefaults.set(Date(), forKey: "lastBackgroundTime")
        userDefaults.synchronize()
        
        // 通知WebView保存状态
        NotificationCenter.default.post(name: .saveApplicationState, object: nil)
    }
}

// MARK: - 通知名称扩展

extension Notification.Name {
    static let sceneDidBecomeActive = Notification.Name("sceneDidBecomeActive")
    static let sceneWillResignActive = Notification.Name("sceneWillResignActive")
    static let sceneWillEnterForeground = Notification.Name("sceneWillEnterForeground")
    static let sceneDidEnterBackground = Notification.Name("sceneDidEnterBackground")
    static let handleURL = Notification.Name("handleURL")
    static let handleUserActivity = Notification.Name("handleUserActivity")
    static let handleNotificationResponse = Notification.Name("handleNotificationResponse")
    static let saveApplicationState = Notification.Name("saveApplicationState")
}