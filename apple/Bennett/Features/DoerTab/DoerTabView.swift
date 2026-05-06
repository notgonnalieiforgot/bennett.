import SwiftUI

/// Doer Tab — Critical Rule #8 gate. Access status is verified server-side
/// (clients can be tampered with). Locked state shows the paywall; allowed
/// state shows the war room.
struct DoerTabView: View {
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    @State private var access: DoerTabAccessStatus?
    @State private var loading: Bool = false

    var body: some View {
        Group {
            if let access {
                if access.allowed {
                    DoerTabHomeView()
                } else {
                    DoerTabPaywallView(reason: access.reason, currentStreak: access.currentStreak)
                }
            } else {
                ProgressView()
                    .tint(theme.palette.accent)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(theme.palette.bg)
        .task { await refresh() }
    }

    private func refresh() async {
        guard let uid = session.user?.uid else {
            // Without a uid (e.g. preview / not signed in) treat as locked
            // for streak reason — keeps the locked UI testable.
            access = DoerTabAccessStatus.evaluate(
                doerTabSubscriptionActive: false,
                currentStreak: session.user?.currentStreak ?? 0
            )
            return
        }
        loading = true
        defer { loading = false }
        do {
            access = try await DoerTabService.shared.access(uid: uid)
        } catch {
            // Fall back to client-side eval if backend is unreachable.
            access = DoerTabAccessStatus.evaluate(
                doerTabSubscriptionActive: session.user?.doerTabSubscriptionActive ?? false,
                currentStreak: session.user?.currentStreak ?? 0
            )
        }
    }
}

#Preview("Locked") {
    DoerTabView()
        .environmentObject(ThemeEngine())
        .environmentObject(SessionStore())
}
