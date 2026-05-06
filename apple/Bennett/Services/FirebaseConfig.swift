import Foundation
import FirebaseCore

/// Shared Firebase init. Calling `FirebaseApp.configure()` without a real
/// `GoogleService-Info.plist` crashes the app, which makes it impossible to
/// eyeball the UI in Xcode previews / on dev devices before Firebase setup
/// is finished. This guard keeps the app launching gracefully — Firestore
/// and Auth calls just no-op until a real plist is dropped in.
enum FirebaseConfig {
    @MainActor static func configureIfPossible() {
        guard FirebaseApp.app() == nil else { return }
        guard Bundle.main.url(forResource: "GoogleService-Info", withExtension: "plist") != nil else {
            print("[bn] no GoogleService-Info.plist found — running without firebase. drop one in apple/Bennett/Resources/ to enable auth + firestore.")
            return
        }
        FirebaseApp.configure()
        // Phase 6.1 — kick off push registration once Firebase is up.
        NotificationService.shared.bootstrap()
    }
}
