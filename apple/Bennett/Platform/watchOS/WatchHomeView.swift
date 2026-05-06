#if os(watchOS)
import SwiftUI
import FirebaseFirestore

/// Phase 6.7 — watchOS home. Shows current streak (live from Firestore)
/// + a "start double-lock" launcher that opens the iPhone app via
/// Handoff (Phase 7 will productize the launcher; for now the button
/// posts a userActivity that the iPhone catches).
struct WatchHomeView: View {
    @State private var streak: Int = 0
    @State private var registration: ListenerRegistration?
    @State private var uid: String? = nil   // Phase 7 fills via WCSession or sign-in

    var body: some View {
        VStack(spacing: 12) {
            Text("bennett.")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(.secondary)
            Text("\(streak)")
                .font(.system(size: 64, weight: .heavy, design: .rounded))
                .foregroundStyle(Color.orange)
            Text(streak == 1 ? "day streak" : "day streak")
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
            Button {
                openDoubleLockOnPhone()
            } label: {
                Text("start double-lock")
                    .font(.system(size: 13, weight: .semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(.orange)
        }
        .padding(.horizontal, 8)
        .onAppear { observe() }
        .onDisappear { registration?.remove() }
    }

    private func observe() {
        guard let uid else { return }
        registration?.remove()
        registration = Firestore.firestore()
            .collection("users")
            .document(uid)
            .addSnapshotListener { snap, _ in
                let s = (snap?.data()?["currentStreak"] as? Int) ?? 0
                streak = s
            }
    }

    private func openDoubleLockOnPhone() {
        let activity = NSUserActivity(activityType: "com.bennett.cos.openDoubleLock")
        activity.title = "Open Double-Lock"
        activity.isEligibleForHandoff = true
        activity.becomeCurrent()
    }
}
#endif
