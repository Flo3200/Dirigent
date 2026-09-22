import AppKit
import WebKit
import UserNotifications

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    let hub = Hub()
    var window: NSWindow!
    var webView: WKWebView!
    var statusItem: NSStatusItem!
    var summary = HubSummary(agents: 0, waiting: 0, working: 0, queued: 0, running: 0, serverError: nil, port: 7777)

    var baseURL: String { "http://127.0.0.1:\(summary.port)" }

    func applicationDidFinishLaunching(_ notification: Notification) {
        summary.port = hub.db.settings.port
        buildMenu()
        buildStatusItem()
        buildWindow()
        hub.onSummary = { [weak self] s in self?.updateSummary(s) }
        hub.onNotify = { [weak self] title, body in self?.notify(title, body) }
        hub.start()
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
        // kurz warten, bis der Server lauscht
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { self.loadUI() }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        showWindow(); return true
    }

    func applicationWillTerminate(_ notification: Notification) {
        hub.queue.sync { hub.saveNow() }
    }

    // MARK: Fenster

    private func buildWindow() {
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1320, height: 840),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
                          backing: .buffered, defer: false)
        window.title = "Dirigent"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.minSize = NSSize(width: 900, height: 600)
        window.backgroundColor = NSColor(red: 0.04, green: 0.045, blue: 0.08, alpha: 1)
        window.isReleasedWhenClosed = false
        window.delegate = self
        window.setFrameAutosaveName("DirigentMain")
        if window.frame.origin == .zero { window.center() }

        let config = WKWebViewConfiguration()
        let ucc = WKUserContentController()
        ucc.add(BridgeHandler(app: self), name: "dirigent")
        ucc.addUserScript(WKUserScript(source: "window.DIRIGENT_NATIVE = true; document.documentElement.classList.add('native');",
                                       injectionTime: .atDocumentStart, forMainFrameOnly: true))
        config.userContentController = ucc
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        webView = WKWebView(frame: .zero, configuration: config)
        webView.setValue(false, forKey: "drawsBackground")
        webView.uiDelegate = self
        webView.navigationDelegate = self

        let container = NSView()
        webView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(webView)
        let drag = DragStrip()
        drag.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(drag)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            webView.topAnchor.constraint(equalTo: container.topAnchor),
            webView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            drag.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 80),
            drag.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            drag.topAnchor.constraint(equalTo: container.topAnchor),
            drag.heightAnchor.constraint(equalToConstant: 14)
        ])
        window.contentView = container
        window.makeKeyAndOrderFront(nil)
    }

    func loadUI() {
        if let url = URL(string: baseURL + "/") { webView.load(URLRequest(url: url)) }
    }

    @objc func showWindow() {
        NSApp.activate(ignoringOtherApps: true)
        window.makeKeyAndOrderFront(nil)
    }

    // MARK: Menüleiste

    private func buildStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.image = NSImage(systemSymbolName: "wand.and.rays", accessibilityDescription: "Dirigent")
        statusItem.button?.imagePosition = .imageLeading
        rebuildStatusMenu()
    }

    private func rebuildStatusMenu() {
        let menu = NSMenu()
        let head = NSMenuItem(title: summary.serverError ?? "Dirigent läuft · Port \(summary.port)", action: nil, keyEquivalent: "")
        head.isEnabled = false
        menu.addItem(head)
        let info = NSMenuItem(title: "\(summary.agents) Agenten · \(summary.waiting) bereit · \(summary.working) arbeiten", action: nil, keyEquivalent: "")
        info.isEnabled = false
        menu.addItem(info)
        let q = NSMenuItem(title: "\(summary.queued) wartende · \(summary.running) laufende Aufträge", action: nil, keyEquivalent: "")
        q.isEnabled = false
        menu.addItem(q)
        menu.addItem(.separator())
        menu.addItem(item("Dashboard öffnen", #selector(showWindow), "d"))
        menu.addItem(item("Anmelde-Prompt kopieren", #selector(copyJoinPrompt), "j"))
        menu.addItem(item("Im Browser öffnen", #selector(openInBrowser), "b"))
        menu.addItem(.separator())
        menu.addItem(item("Dirigent beenden", #selector(NSApplication.terminate(_:)), "q"))
        statusItem.menu = menu
    }

    private func item(_ title: String, _ sel: Selector, _ key: String) -> NSMenuItem {
        let i = NSMenuItem(title: title, action: sel, keyEquivalent: key)
        i.target = sel == #selector(NSApplication.terminate(_:)) ? NSApp : self
        return i
    }

    private func updateSummary(_ s: HubSummary) {
        let portChanged = s.port != summary.port
        summary = s
        let active = s.working
        statusItem.button?.title = s.agents == 0 ? "" : (active > 0 ? " \(s.waiting)·\(active)" : " \(s.waiting)")
        statusItem.button?.contentTintColor = s.serverError != nil ? .systemRed : nil
        rebuildStatusMenu()
        if portChanged { DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { self.loadUI() } }
    }

    @objc func copyJoinPrompt() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString("Melde dich bei Dirigent als Agent an und halte dich bereit. Anleitung: curl -s \(baseURL)/join", forType: .string)
        notify("Anmelde-Prompt kopiert", "In Claude Code einfügen – der Agent meldet sich dann an.")
    }

    @objc func openInBrowser() {
        if let url = URL(string: baseURL) { NSWorkspace.shared.open(url) }
    }

    func notify(_ title: String, _ body: String) {
        let c = UNMutableNotificationContent()
        c.title = title
        c.body = body
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: UUID().uuidString, content: c, trigger: nil))
    }

    private func buildMenu() {
        let main = NSMenu()
        let appItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "Über Dirigent", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Dirigent ausblenden", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Dirigent beenden", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu
        main.addItem(appItem)

        let editItem = NSMenuItem()
        let edit = NSMenu(title: "Bearbeiten")
        edit.addItem(withTitle: "Widerrufen", action: Selector(("undo:")), keyEquivalent: "z")
        edit.addItem(withTitle: "Wiederholen", action: Selector(("redo:")), keyEquivalent: "Z")
        edit.addItem(.separator())
        edit.addItem(withTitle: "Ausschneiden", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        edit.addItem(withTitle: "Kopieren", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        edit.addItem(withTitle: "Einsetzen", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        edit.addItem(withTitle: "Alles auswählen", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editItem.submenu = edit
        main.addItem(editItem)

        let viewItem = NSMenuItem()
        let view = NSMenu(title: "Darstellung")
        let reload = NSMenuItem(title: "Neu laden", action: #selector(reloadUI), keyEquivalent: "r")
        reload.target = self
        view.addItem(reload)
        view.addItem(withTitle: "Vollbild", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        viewItem.submenu = view
        main.addItem(viewItem)

        let winItem = NSMenuItem()
        let win = NSMenu(title: "Fenster")
        win.addItem(withTitle: "Schließen", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        win.addItem(withTitle: "Im Dock ablegen", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        winItem.submenu = win
        main.addItem(winItem)
        NSApp.mainMenu = main
        NSApp.windowsMenu = win
    }

    @objc func reloadUI() { loadUI() }
}

// MARK: - WebView-Delegates

extension AppDelegate: WKUIDelegate, WKNavigationDelegate {
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url { NSWorkspace.shared.open(url) }
        return nil
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url, let host = url.host,
           host != "127.0.0.1" && host != "localhost", navigationAction.navigationType == .linkActivated {
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel); return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { self.loadUI() }
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (Bool) -> Void) {
        let a = NSAlert()
        a.messageText = message
        a.addButton(withTitle: "OK")
        a.addButton(withTitle: "Abbrechen")
        completionHandler(a.runModal() == .alertFirstButtonReturn)
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping () -> Void) {
        let a = NSAlert()
        a.messageText = message
        a.runModal()
        completionHandler()
    }
}

/// Brücke Web → nativ (Zwischenablage, Links, Mitteilungen).
final class BridgeHandler: NSObject, WKScriptMessageHandler {
    weak var app: AppDelegate?
    init(app: AppDelegate) { self.app = app }

    func userContentController(_ ucc: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let action = body["action"] as? String else { return }
        switch action {
        case "copy":
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(body["text"] as? String ?? "", forType: .string)
        case "open":
            if let s = body["url"] as? String, let url = URL(string: s) { NSWorkspace.shared.open(url) }
        case "reveal":
            if let s = body["path"] as? String { NSWorkspace.shared.activateFileViewerSelecting([URL(fileURLWithPath: s)]) }
        case "notify":
            app?.notify(body["title"] as? String ?? "Dirigent", body["body"] as? String ?? "")
        default: break
        }
    }
}

/// Unsichtbarer Streifen oben, mit dem sich das Fenster verschieben lässt.
final class DragStrip: NSView {
    override var mouseDownCanMoveWindow: Bool { true }
    override func mouseDown(with event: NSEvent) {
        if event.clickCount == 2 { window?.zoom(nil) } else { window?.performDrag(with: event) }
    }
}
