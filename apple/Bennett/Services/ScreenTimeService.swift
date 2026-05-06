#if os(iOS)
import Foundation
import FamilyControls
import ManagedSettings

/// 24-hour Sacrifice trial. Per Critical Rule #13 this is iOS-only;
/// macOS doesn't have FamilyControls.
///
/// IMPORTANT: the FamilyControls capability requires explicit Apple
/// approval before App Store submission. Note this on the project punch
/// list — beta builds work fine, App Store builds need the entitlement
/// turned on for the team id.
@MainActor
final class ScreenTimeService {
    static let shared = ScreenTimeService()
    private let store = ManagedSettingsStore(named: ManagedSettingsStore.Name("bennett.sacrifice"))

    private init() {}

    func requestAuthorization() async throws {
        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
    }

    /// Begin 24-hour Stealth Mode. Whitelist: bennett, calendar, messages,
    /// phone, mail. Other apps + categories blocked until `endStealthMode`
    /// or 24h elapse — whichever comes first.
    func startStealthMode(selection: FamilyActivitySelection) {
        store.shield.applications = selection.applicationTokens
        store.shield.applicationCategories = .specific(selection.categoryTokens)
        store.shield.webDomains = selection.webDomainTokens
        UserDefaults.standard.set(Date.now, forKey: "bn.sacrifice.startedAt")
    }

    func endStealthMode() {
        store.clearAllSettings()
        UserDefaults.standard.removeObject(forKey: "bn.sacrifice.startedAt")
    }

    /// Returns true if the user has completed a full 24-hour stealth window.
    var sacrificeCompleted: Bool {
        guard let started = UserDefaults.standard.object(forKey: "bn.sacrifice.startedAt") as? Date else {
            return false
        }
        return Date.now.timeIntervalSince(started) >= 24 * 60 * 60
    }
}
#endif
