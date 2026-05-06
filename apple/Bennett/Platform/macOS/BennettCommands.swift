#if os(macOS)
import SwiftUI

/// macOS keyboard commands per CLAUDE.md macOS Layout Rules.
/// ⌘D = open Double-Lock, ⌘B = open Bulletin (Phase 8 wires it up).
struct BennettCommands: Commands {
    var body: some Commands {
        CommandGroup(after: .appInfo) {
            Divider()
            Button("Open Double-Lock") {
                NotificationCenter.default.post(name: .bnOpenDoubleLock, object: nil)
            }
            .keyboardShortcut("d", modifiers: [.command])

            Button("Open Bulletin") {
                NotificationCenter.default.post(name: .bnOpenBulletin, object: nil)
            }
            .keyboardShortcut("b", modifiers: [.command])
        }
    }
}

extension Notification.Name {
    static let bnOpenDoubleLock = Notification.Name("bn.openDoubleLock")
    static let bnOpenBulletin   = Notification.Name("bn.openBulletin")
}
#endif
