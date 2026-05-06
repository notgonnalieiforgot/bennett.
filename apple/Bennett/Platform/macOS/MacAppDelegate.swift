#if os(macOS)
import AppKit

final class MacAppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        FirebaseConfig.configureIfPossible()
        Task { @MainActor in
            MenuBarController.shared.install()
            // Phase 7 sign-in flow will call MenuBarController.shared.observe(uid:)
            // once a session is established.
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    /// Phase 7 will register `com.bennett.cos.mac://` URL scheme + route
    /// OAuth callbacks (LinkedIn, etc.) through ASWebAuthenticationSession.
    func application(_ app: NSApplication, open urls: [URL]) {
        for _ in urls {
            // Phase 7 will dispatch by scheme.
        }
    }
}
#endif
