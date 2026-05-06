#if os(watchOS)
import SwiftUI
import FirebaseCore

/// Phase 6.7 — watchOS app entry. Standalone (uses Firebase directly,
/// not WatchConnectivity) so the watch works on cellular without a paired
/// phone in range.
@main
struct BennettWatchApp: App {
    init() {
        if FirebaseApp.app() == nil,
           Bundle.main.url(forResource: "GoogleService-Info", withExtension: "plist") != nil {
            FirebaseApp.configure()
        }
    }

    var body: some Scene {
        WindowGroup {
            WatchHomeView()
        }
    }
}
#endif
