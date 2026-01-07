//
//  AppDelegate.swift
//  数道仙途 - Mathematical Cultivation Path
//
//  Created by Kiro AI Assistant on 2026/1/7.
//  Copyright © 2026 MathCultivation Team. All rights reserved.
//

import UIKit
import UserNotifications
import BackgroundTasks

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // 配置应用外观
        configureAppearance()
        
        // 请求通知权限
        requestNotificationPermission()
        
        // 注册后台任务
        registerBackgroundTasks()
        
        // 配置网络监控
        configureNetworkMonitoring()
        
        print("🎮 数道仙途应用启动完成")
        
        return true
    }

    // MARK: UISceneSession Lifecycle

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // 场景会话被丢弃时调用
    }
    
    // MARK: - 推送通知
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        print("📱 设备推送令牌: \(token)")
        
        // 将令牌发送到服务器
        sendDeviceTokenToServer(token)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ 推送通知注册失败: \(error.localizedDescription)")
    }
    
    // MARK: - URL处理
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        print("🔗 处理URL: \(url)")
        
        // 处理自定义URL scheme
        if url.scheme == "mathcultivation" {
            handleCustomURL(url)
            return true
        }
        
        return false
    }
    
    // MARK: - 后台任务
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        print("📱 应用进入后台")
        
        // 安排后台任务
        scheduleBackgroundRefresh()
        
        // 通知WebView应用状态变化
        NotificationCenter.default.post(name: .appDidEnterBackground, object: nil)
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        print("📱 应用即将进入前台")
        
        // 通知WebView应用状态变化
        NotificationCenter.default.post(name: .appWillEnterForeground, object: nil)
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        print("📱 应用已激活")
        
        // 清除应用徽章
        UIApplication.shared.applicationIconBadgeNumber = 0
    }
    
    // MARK: - 内存警告
    
    func applicationDidReceiveMemoryWarning(_ application: UIApplication) {
        print("⚠️ 收到内存警告")
        
        // 通知WebView进行内存清理
        NotificationCenter.default.post(name: .memoryWarning, object: nil)
    }
    
    // MARK: - 私有方法
    
    private func configureAppearance() {
        // 配置状态栏样式
        if #available(iOS 13.0, *) {
            // iOS 13+ 在SceneDelegate中处理
        } else {
            UIApplication.shared.statusBarStyle = .lightContent
        }
        
        // 配置导航栏外观
        if #available(iOS 15.0, *) {
            let appearance = UINavigationBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(red: 0.06, green: 0.06, blue: 0.14, alpha: 1.0) // #0f0f23
            appearance.titleTextAttributes = [.foregroundColor: UIColor.white]
            
            UINavigationBar.appearance().standardAppearance = appearance
            UINavigationBar.appearance().scrollEdgeAppearance = appearance
        }
    }
    
    private func requestNotificationPermission() {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        
        center.requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    print("✅ 通知权限已授予")
                    UIApplication.shared.registerForRemoteNotifications()
                } else {
                    print("❌ 通知权限被拒绝")
                }
            }
        }
    }
    
    private func registerBackgroundTasks() {
        // 注册后台应用刷新任务
        BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.mathcultivation.refresh", using: nil) { task in
            self.handleBackgroundRefresh(task: task as! BGAppRefreshTask)
        }
        
        // 注册后台处理任务
        BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.mathcultivation.processing", using: nil) { task in
            self.handleBackgroundProcessing(task: task as! BGProcessingTask)
        }
    }
    
    private func configureNetworkMonitoring() {
        // 网络状态监控将在ViewController中实现
    }
    
    private func sendDeviceTokenToServer(_ token: String) {
        // 发送设备令牌到服务器
        let url = URL(string: "https://your-server.com/api/device-token")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["deviceToken": token, "platform": "ios"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("❌ 发送设备令牌失败: \(error.localizedDescription)")
            } else {
                print("✅ 设备令牌发送成功")
            }
        }.resume()
    }
    
    private func handleCustomURL(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return }
        
        switch components.host {
        case "concept":
            // 打开特定数学概念
            if let conceptId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                openConcept(conceptId)
            }
        case "challenge":
            // 打开每日挑战
            openDailyChallenge()
        case "progress":
            // 显示学习进度
            showProgress()
        default:
            // 打开主界面
            openMainInterface()
        }
    }
    
    private func openConcept(_ conceptId: String) {
        // 通知WebView打开特定概念
        let userInfo = ["action": "openConcept", "conceptId": conceptId]
        NotificationCenter.default.post(name: .openConcept, object: nil, userInfo: userInfo)
    }
    
    private func openDailyChallenge() {
        let userInfo = ["action": "openDailyChallenge"]
        NotificationCenter.default.post(name: .openDailyChallenge, object: nil, userInfo: userInfo)
    }
    
    private func showProgress() {
        let userInfo = ["action": "showProgress"]
        NotificationCenter.default.post(name: .showProgress, object: nil, userInfo: userInfo)
    }
    
    private func openMainInterface() {
        let userInfo = ["action": "openMain"]
        NotificationCenter.default.post(name: .openMain, object: nil, userInfo: userInfo)
    }
    
    private func scheduleBackgroundRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "com.mathcultivation.refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15分钟后
        
        do {
            try BGTaskScheduler.shared.submit(request)
            print("✅ 后台刷新任务已安排")
        } catch {
            print("❌ 后台刷新任务安排失败: \(error.localizedDescription)")
        }
    }
    
    private func handleBackgroundRefresh(task: BGAppRefreshTask) {
        print("🔄 执行后台刷新任务")
        
        // 安排下一次后台刷新
        scheduleBackgroundRefresh()
        
        // 执行后台数据同步
        let syncOperation = BackgroundSyncOperation()
        
        task.expirationHandler = {
            syncOperation.cancel()
        }
        
        syncOperation.completionBlock = {
            task.setTaskCompleted(success: !syncOperation.isCancelled)
        }
        
        OperationQueue().addOperation(syncOperation)
    }
    
    private func handleBackgroundProcessing(task: BGProcessingTask) {
        print("⚙️ 执行后台处理任务")
        
        // 执行数据清理和优化
        let processingOperation = BackgroundProcessingOperation()
        
        task.expirationHandler = {
            processingOperation.cancel()
        }
        
        processingOperation.completionBlock = {
            task.setTaskCompleted(success: !processingOperation.isCancelled)
        }
        
        OperationQueue().addOperation(processingOperation)
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension AppDelegate: UNUserNotificationCenterDelegate {
    
    // 应用在前台时收到通知
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        
        // 在前台也显示通知
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
    
    // 用户点击通知
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        
        let userInfo = response.notification.request.content.userInfo
        
        // 处理通知点击
        if let action = userInfo["action"] as? String {
            switch action {
            case "dailyChallenge":
                openDailyChallenge()
            case "conceptReminder":
                if let conceptId = userInfo["conceptId"] as? String {
                    openConcept(conceptId)
                }
            default:
                openMainInterface()
            }
        }
        
        completionHandler()
    }
}

// MARK: - 后台操作类

class BackgroundSyncOperation: Operation {
    override func main() {
        guard !isCancelled else { return }
        
        // 执行数据同步
        print("🔄 后台数据同步中...")
        
        // 模拟同步操作
        Thread.sleep(forTimeInterval: 2.0)
        
        print("✅ 后台数据同步完成")
    }
}

class BackgroundProcessingOperation: Operation {
    override func main() {
        guard !isCancelled else { return }
        
        // 执行数据处理
        print("⚙️ 后台数据处理中...")
        
        // 模拟处理操作
        Thread.sleep(forTimeInterval: 3.0)
        
        print("✅ 后台数据处理完成")
    }
}

// MARK: - 通知名称扩展

extension Notification.Name {
    static let appDidEnterBackground = Notification.Name("appDidEnterBackground")
    static let appWillEnterForeground = Notification.Name("appWillEnterForeground")
    static let memoryWarning = Notification.Name("memoryWarning")
    static let openConcept = Notification.Name("openConcept")
    static let openDailyChallenge = Notification.Name("openDailyChallenge")
    static let showProgress = Notification.Name("showProgress")
    static let openMain = Notification.Name("openMain")
}