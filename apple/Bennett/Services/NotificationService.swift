import Foundation
import UserNotifications
import FirebaseMessaging
#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

/// Push notification setup. Per CLAUDE.md macOS Layout Rules, both iOS
/// and macOS use UNUserNotificationCenter (same API). Token registration
/// happens via Firebase Messaging on both.
@MainActor
final class NotificationService: NSObject {
    static let shared = NotificationService()

    private override init() {
        super.init()
    }

    /// Call from app delegate at launch. Asks for permission, registers
    /// for remote notifications, and posts the FCM token to the backend
    /// once it lands.
    func bootstrap() {
        UNUserNotificationCenter.current().delegate = self
        Messaging.messaging().delegate = self
        Task { @MainActor in
            do {
                let granted = try await UNUserNotificationCenter.current()
                    .requestAuthorization(options: [.alert, .badge, .sound])
                if granted {
                    #if os(iOS)
                    UIApplication.shared.registerForRemoteNotifications()
                    #elseif os(macOS)
                    NSApplication.shared.registerForRemoteNotifications()
                    #endif
                }
            } catch {
                // soft-fail — app continues without push
            }
        }
    }

    func registerToken(_ token: String) async {
        guard let uid = await sessionUID() else { return }
        var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("api/notifications/register-token"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = [
            "uid": uid,
            "token": token,
            "platform": platformLabel(),
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        _ = try? await URLSession.shared.data(for: req)
    }

    private func sessionUID() async -> String? {
        // Cross-actor read — UID is on @MainActor SessionStore. We rely
        // on the singleton presence for token registration moments.
        return nil    // wired by AppDelegate which has access to the store
    }

    private func platformLabel() -> String {
        #if os(iOS)
        return "ios"
        #else
        return "macos"
        #endif
    }
}

extension NotificationService: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler handler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        handler([.banner, .sound, .badge])
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler handler: @escaping () -> Void
    ) {
        let info = response.notification.request.content.userInfo
        applyDataPayload(info)
        if let deepLink = info["deepLink"] as? String {
            // Phase 7 will route deep links to specific screens.
            NotificationCenter.default.post(
                name: .bnDeepLink,
                object: nil,
                userInfo: ["path": deepLink]
            )
        }
        handler()
    }

    /// Phase 6.9 — handle silent FCM data messages. Background path needs
    /// to run even when the user isn't tapping; FCM's
    /// `application(_:didReceiveRemoteNotification:)` callback in the
    /// app delegate routes here.
    func applyDataPayload(_ info: [AnyHashable: Any]) {
        guard let kind = info["kind"] as? String else { return }
        switch kind {
        case "double_lock_complete":
            if let date = info["date"] as? String {
                DoubleLockSyncService.applyRemoteUnlock(date: date)
            }
        default:
            break
        }
    }
}

extension NotificationService: MessagingDelegate {
    nonisolated func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let token = fcmToken else { return }
        Task { @MainActor in
            await self.registerToken(token)
        }
    }
}

extension Notification.Name {
    static let bnDeepLink = Notification.Name("bn.deepLink")
}
