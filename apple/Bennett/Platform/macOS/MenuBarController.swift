#if os(macOS)
import AppKit
import SwiftUI
import FirebaseFirestore

/// macOS menu bar widget — per CLAUDE.md macOS Layout Rules:
/// "NSStatusItem shows current streak count + one-click Double-Lock launch."
///
/// Drives a thin Firestore listener on users/{uid} so the streak number
/// stays live without polling. Click → posts bnOpenDoubleLock notification
/// (RootView already observes it).
@MainActor
final class MenuBarController {
    static let shared = MenuBarController()

    private var statusItem: NSStatusItem?
    private var registration: ListenerRegistration?

    private init() {}

    func install() {
        guard statusItem == nil else { return }
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item.button?.title = "🔒 0"
        item.button?.target = self
        item.button?.action = #selector(handleClick)
        item.button?.toolTip = "open bennett's daily double-lock"  // possessive — body voice keeps lowercase no period

        let menu = NSMenu()
        let lockItem = NSMenuItem(title: "Open Double-Lock", action: #selector(openDoubleLock), keyEquivalent: "d")
        lockItem.target = self
        let appItem = NSMenuItem(title: "Open bennett.", action: #selector(openApp), keyEquivalent: "")
        appItem.target = self
        menu.addItem(lockItem)
        menu.addItem(NSMenuItem.separator())
        menu.addItem(appItem)
        item.menu = menu

        statusItem = item
    }

    /// Observe a uid's streak. Call from MacAppDelegate after sign-in
    /// (or after FirebaseConfig.configureIfPossible if a session uid is
    /// available locally).
    func observe(uid: String) {
        registration?.remove()
        registration = Firestore.firestore()
            .collection("users")
            .document(uid)
            .addSnapshotListener { [weak self] snap, _ in
                let streak = (snap?.data()?["currentStreak"] as? Int) ?? 0
                Task { @MainActor in
                    self?.statusItem?.button?.title = "🔒 \(streak)"
                }
            }
    }

    @objc private func handleClick() {
        // Single click defaults to Open Double-Lock. Right-click shows
        // the menu (handled by AppKit when `menu` is set).
        openDoubleLock()
    }

    @objc private func openDoubleLock() {
        NSApp.activate(ignoringOtherApps: true)
        NotificationCenter.default.post(name: .bnOpenDoubleLockNotification, object: nil)
    }

    @objc private func openApp() {
        NSApp.activate(ignoringOtherApps: true)
        for window in NSApp.windows {
            window.makeKeyAndOrderFront(nil)
        }
    }
}
#endif
