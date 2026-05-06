import Foundation
import FirebaseFirestore

/// Cross-device sync for Double-Lock completions per Critical Rule #7.
/// On completion, writes to users/{uid}/doubleLockCompletions/{YYYY-MM-DD}
/// in Firestore. The other devices keep a snapshot listener open and unlock
/// locally as soon as the doc appears.
@MainActor
final class DoubleLockSyncService {
    static let shared = DoubleLockSyncService()
    private let db = Firestore.firestore()

    private init() {}

    static func todayKey(in tz: TimeZone = .current) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .iso8601)
        f.timeZone = tz
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: .now)
    }

    static var deviceLabel: String {
        #if os(iOS)
        return "ios"
        #elseif os(macOS)
        return "macos"
        #else
        return "unknown"
        #endif
    }

    func recordCompletion(uid: String, durationMs: Int) async throws {
        let date = Self.todayKey()
        try await db.collection("users")
            .document(uid)
            .collection("doubleLockCompletions")
            .document(date)
            .setData([
                "completedAt": Date.now.timeIntervalSince1970 * 1000,
                "device": Self.deviceLabel,
                "durationMs": durationMs,
            ], merge: true)
        // Phase 6.9 — also fire FCM data-message to other devices so they
        // unlock immediately even if their Firestore listener is offline.
        Task { await fanOutSync(uid: uid, date: date) }
        // Phase 6.9 — local fast-path unlock flag.
        UserDefaults.standard.set(date, forKey: "bn.doubleLock.localUnlockedDate")
    }

    /// Fire-and-forget cross-device sync. Soft-fails — Firestore listener
    /// remains the authoritative path.
    private func fanOutSync(uid: String, date: String) async {
        var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("api/notifications/double-lock-sync"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = [
            "uid": uid,
            "date": date,
            "sourceDevice": Self.deviceLabel,
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        _ = try? await URLSession.shared.data(for: req)
    }

    /// Local fast-path: returns true if the device already saw a
    /// completion for today via FCM background message OR a previous
    /// local completion. Lets the daily gate skip the Firestore round-trip
    /// when the listener was offline at the moment another device unlocked.
    static func isLocallyUnlockedToday() -> Bool {
        let stored = UserDefaults.standard.string(forKey: "bn.doubleLock.localUnlockedDate")
        return stored == todayKey()
    }

    /// Called by NotificationService when an `kind=double_lock_complete`
    /// background data message lands.
    static func applyRemoteUnlock(date: String) {
        guard date == todayKey() else { return }
        UserDefaults.standard.set(date, forKey: "bn.doubleLock.localUnlockedDate")
        NotificationCenter.default.post(name: .bnDoubleLockSynced, object: nil)
    }
}

extension Notification.Name {
    static let bnDoubleLockSynced = Notification.Name("bn.doubleLock.synced")
}

    /// Returns a listener registration. Call .remove() on it when done.
    /// If today's completion doc exists/appears, `onComplete` fires.
    func observeToday(uid: String, onComplete: @escaping () -> Void) -> ListenerRegistration {
        let date = Self.todayKey()
        return db.collection("users")
            .document(uid)
            .collection("doubleLockCompletions")
            .document(date)
            .addSnapshotListener { snap, _ in
                if snap?.exists == true {
                    Task { @MainActor in onComplete() }
                }
            }
    }
}
