import Foundation

/// Cross-platform notification names. macOS-only command bindings live in
/// Platform/macOS/BennettCommands.swift but post into the shared bus here
/// so iOS-side observers don't need conditional compilation.
extension Notification.Name {
    static let bnOpenDoubleLockNotification = Notification.Name("bn.openDoubleLock")
    static let bnOpenBulletinNotification   = Notification.Name("bn.openBulletin")
}
