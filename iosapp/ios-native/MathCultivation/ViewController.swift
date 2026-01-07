//
//  ViewController.swift
//  数道仙途 - Mathematical Cultivation Path
//
//  Created by Kiro AI Assistant on 2026/1/7.
//  Copyright © 2026 MathCultivation Team. All rights reserved.
//

import UIKit
import WebKit
import Network
import AVFoundation

class ViewController: UIViewController {
    
    // MARK: - 属性
    
    private var webView: WKWebView!
    private var progressView: UIProgressView!
    private var loadingLabel: UILabel!
    private var networkMonitor: NWPathMonitor!
    private var isWebViewLoaded = false
    
    // 网络状态
    private var isNetworkAvailable = true
    
    // 触觉反馈生成器
    private var lightImpactGenerator: UIImpactFeedbackGenerator?
    private var mediumImpactGenerator: UIImpactFeedbackGenerator?
    private var heavyImpactGenerator: UIImpactFeedbackGenerator?
    private var selectionGenerator: UISelectionFeedbackGenerator?
    private var notificationGenerator: UINotificationFeedbackGenerator?
    
    // MARK: - 生命周期
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupUI()
        setupWebView()
        setupHapticFeedback()
        setupNetworkMonitoring()
        setupNotificationObservers()
        
        loadWebContent()
        
        print("🎮 主视图控制器加载完成")
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // 隐藏导航栏
        navigationController?.setNavigationBarHidden(true, animated: animated)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        // 预热触觉反馈生成器
        prepareHapticFeedback()
    }
    
    deinit {
        // 清理资源
        networkMonitor?.cancel()
        NotificationCenter.default.removeObserver(self)
        
        // 清理触觉反馈生成器
        lightImpactGenerator = nil
        mediumImpactGenerator = nil
        heavyImpactGenerator = nil
        selectionGenerator = nil
        notificationGenerator = nil
    }
    
    // MARK: - UI设置
    
    private func setupUI() {
        view.backgroundColor = UIColor(red: 0.06, green: 0.06, blue: 0.14, alpha: 1.0) // #0f0f23
        
        // 创建加载进度视图
        setupLoadingUI()
    }
    
    private func setupLoadingUI() {
        // 加载标签
        loadingLabel = UILabel()
        loadingLabel.text = "正在加载数道仙途..."
        loadingLabel.textColor = UIColor(red: 0.31, green: 0.68, blue: 1.0, alpha: 1.0) // #4facfe
        loadingLabel.font = UIFont.systemFont(ofSize: 18, weight: .medium)
        loadingLabel.textAlignment = .center
        loadingLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(loadingLabel)
        
        // 进度条
        progressView = UIProgressView(progressViewStyle: .default)
        progressView.progressTintColor = UIColor(red: 0.31, green: 0.68, blue: 1.0, alpha: 1.0) // #4facfe
        progressView.trackTintColor = UIColor(white: 1.0, alpha: 0.1)
        progressView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(progressView)
        
        // 约束
        NSLayoutConstraint.activate([
            loadingLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            loadingLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -20),
            
            progressView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            progressView.topAnchor.constraint(equalTo: loadingLabel.bottomAnchor, constant: 20),
            progressView.widthAnchor.constraint(equalToConstant: 200),
            progressView.heightAnchor.constraint(equalToConstant: 4)
        ])
    }
    
    private func setupWebView() {
        // WebView配置
        let configuration = WKWebViewConfiguration()
        
        // 用户内容控制器
        let userContentController = WKUserContentController()
        userContentController.add(self, name: "nativeApp")
        configuration.userContentController = userContentController
        
        // 网站数据存储
        configuration.websiteDataStore = WKWebsiteDataStore.default()
        
        // 媒体播放设置
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // 创建WebView
        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.scrollView.delegate = self
        
        // WebView设置
        webView.allowsBackForwardNavigationGestures = false
        webView.scrollView.bounces = false
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false
        
        // 自动布局
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        
        // 约束
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
        
        // 初始隐藏WebView
        webView.alpha = 0
    }
    
    private func setupHapticFeedback() {
        // 创建触觉反馈生成器
        lightImpactGenerator = UIImpactFeedbackGenerator(style: .light)
        mediumImpactGenerator = UIImpactFeedbackGenerator(style: .medium)
        heavyImpactGenerator = UIImpactFeedbackGenerator(style: .heavy)
        selectionGenerator = UISelectionFeedbackGenerator()
        notificationGenerator = UINotificationFeedbackGenerator()
    }
    
    private func prepareHapticFeedback() {
        // 预热触觉反馈生成器以减少延迟
        lightImpactGenerator?.prepare()
        mediumImpactGenerator?.prepare()
        heavyImpactGenerator?.prepare()
        selectionGenerator?.prepare()
        notificationGenerator?.prepare()
    }
    
    private func setupNetworkMonitoring() {
        networkMonitor = NWPathMonitor()
        
        networkMonitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.handleNetworkStatusChange(path.status == .satisfied)
            }
        }
        
        let queue = DispatchQueue(label: "NetworkMonitor")
        networkMonitor.start(queue: queue)
    }
    
    private func setupNotificationObservers() {
        // 应用状态通知
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidEnterBackground),
            name: .appDidEnterBackground,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillEnterForeground),
            name: .appWillEnterForeground,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(memoryWarning),
            name: .memoryWarning,
            object: nil
        )
        
        // URL处理通知
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleURL(_:)),
            name: .handleURL,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleUserActivity(_:)),
            name: .handleUserActivity,
            object: nil
        )
    }
    
    // MARK: - WebView加载
    
    private func loadWebContent() {
        // 获取Web内容路径
        guard let htmlPath = Bundle.main.path(forResource: "index", ofType: "html") else {
            showError("无法找到游戏文件")
            return
        }
        
        let htmlURL = URL(fileURLWithPath: htmlPath)
        let request = URLRequest(url: htmlURL)
        
        // 加载Web内容
        webView.load(request)
        
        // 更新加载状态
        updateLoadingProgress(0.1)
        loadingLabel.text = "正在加载游戏引擎..."
    }
    
    private func updateLoadingProgress(_ progress: Float) {
        DispatchQueue.main.async {
            self.progressView.setProgress(progress, animated: true)
        }
    }
    
    private func hideLoadingUI() {
        UIView.animate(withDuration: 0.5, animations: {
            self.loadingLabel.alpha = 0
            self.progressView.alpha = 0
            self.webView.alpha = 1
        }) { _ in
            self.loadingLabel.removeFromSuperview()
            self.progressView.removeFromSuperview()
        }
    }
    
    private func showError(_ message: String) {
        DispatchQueue.main.async {
            self.loadingLabel.text = "加载失败: \(message)"
            self.loadingLabel.textColor = .systemRed
            self.progressView.isHidden = true
        }
    }
    
    // MARK: - 网络状态处理
    
    private func handleNetworkStatusChange(_ isAvailable: Bool) {
        isNetworkAvailable = isAvailable
        
        // 通知WebView网络状态变化
        let message = [
            "type": "networkStatusChanged",
            "isOnline": isAvailable
        ] as [String : Any]
        
        sendMessageToWebView(message)
        
        print("🌐 网络状态变化: \(isAvailable ? "在线" : "离线")")
    }
    
    // MARK: - 通知处理
    
    @objc private func appDidEnterBackground() {
        // 通知WebView应用进入后台
        let message = ["type": "appStateChanged", "state": "background"]
        sendMessageToWebView(message)
    }
    
    @objc private func appWillEnterForeground() {
        // 通知WebView应用进入前台
        let message = ["type": "appStateChanged", "state": "foreground"]
        sendMessageToWebView(message)
        
        // 重新预热触觉反馈
        prepareHapticFeedback()
    }
    
    @objc private func memoryWarning() {
        // 通知WebView内存警告
        let message = ["type": "memoryWarning"]
        sendMessageToWebView(message)
        
        // 清理WebView缓存
        cleanWebViewCache()
    }
    
    @objc private func handleURL(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let urlString = userInfo["url"] as? String else { return }
        
        let message = ["type": "handleURL", "url": urlString]
        sendMessageToWebView(message)
    }
    
    @objc private func handleUserActivity(_ notification: Notification) {
        guard let userInfo = notification.userInfo else { return }
        
        let message = ["type": "handleUserActivity", "userInfo": userInfo]
        sendMessageToWebView(message)
    }
    
    // MARK: - WebView通信
    
    private func sendMessageToWebView(_ message: [String: Any]) {
        guard isWebViewLoaded else { return }
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: message)
            let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
            
            let script = "window.NativeBridge && window.NativeBridge.handleNativeMessage(\(jsonString));"
            webView.evaluateJavaScript(script) { result, error in
                if let error = error {
                    print("❌ JavaScript执行错误: \(error.localizedDescription)")
                }
            }
        } catch {
            print("❌ JSON序列化错误: \(error.localizedDescription)")
        }
    }
    
    private func cleanWebViewCache() {
        let websiteDataTypes = NSSet(array: [
            WKWebsiteDataTypeDiskCache,
            WKWebsiteDataTypeMemoryCache
        ])
        
        let date = Date(timeIntervalSince1970: 0)
        
        WKWebsiteDataStore.default().removeData(
            ofTypes: websiteDataTypes as! Set<String>,
            modifiedSince: date
        ) {
            print("✅ WebView缓存已清理")
        }
    }
}

// MARK: - WKNavigationDelegate

extension ViewController: WKNavigationDelegate {
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        print("🌐 开始加载网页")
        updateLoadingProgress(0.2)
    }
    
    func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
        print("🌐 网页内容开始加载")
        updateLoadingProgress(0.5)
        loadingLabel.text = "正在初始化游戏..."
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("🌐 网页加载完成")
        updateLoadingProgress(0.8)
        loadingLabel.text = "正在启动游戏..."
        
        // 延迟标记为已加载，等待JavaScript初始化
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.isWebViewLoaded = true
            self.updateLoadingProgress(1.0)
            
            // 发送设备信息到WebView
            self.sendDeviceInfoToWebView()
            
            // 隐藏加载界面
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                self.hideLoadingUI()
            }
        }
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("❌ 网页加载失败: \(error.localizedDescription)")
        showError(error.localizedDescription)
    }
    
    private func sendDeviceInfoToWebView() {
        let deviceInfo = [
            "type": "deviceInfo",
            "payload": [
                "model": UIDevice.current.model,
                "systemName": UIDevice.current.systemName,
                "systemVersion": UIDevice.current.systemVersion,
                "screenScale": UIScreen.main.scale,
                "screenSize": [
                    "width": UIScreen.main.bounds.width,
                    "height": UIScreen.main.bounds.height
                ],
                "isNetworkAvailable": isNetworkAvailable
            ]
        ] as [String : Any]
        
        sendMessageToWebView(deviceInfo)
    }
}

// MARK: - WKUIDelegate

extension ViewController: WKUIDelegate {
    
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        
        let alert = UIAlertController(title: "数道仙途", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler()
        })
        
        present(alert, animated: true)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        
        let alert = UIAlertController(title: "数道仙途", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler(true)
        })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in
            completionHandler(false)
        })
        
        present(alert, animated: true)
    }
}

// MARK: - UIScrollViewDelegate

extension ViewController: UIScrollViewDelegate {
    
    func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?) {
        // 禁止缩放
        scrollView.pinchGestureRecognizer?.isEnabled = false
    }
}

// MARK: - WKScriptMessageHandler

extension ViewController: WKScriptMessageHandler {
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        
        guard message.name == "nativeApp",
              let messageBody = message.body as? [String: Any],
              let action = messageBody["action"] as? String else {
            return
        }
        
        print("📱 收到WebView消息: \(action)")
        
        // 处理不同的原生功能调用
        switch action {
        case "hapticFeedback":
            handleHapticFeedback(messageBody)
        case "showNotification":
            handleShowNotification(messageBody)
        case "shareProgress":
            handleShareProgress(messageBody)
        case "saveToPhotos":
            handleSaveToPhotos(messageBody)
        case "setBadge":
            handleSetBadge(messageBody)
        case "getDeviceInfo":
            handleGetDeviceInfo()
        case "logError":
            handleLogError(messageBody)
        case "gameInitialized":
            handleGameInitialized(messageBody)
        default:
            print("⚠️ 未知的原生功能调用: \(action)")
        }
    }
}