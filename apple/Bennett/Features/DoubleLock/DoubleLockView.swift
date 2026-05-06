import SwiftUI

/// Daily 60-second cognitive gate — coordinator across the 3 steps.
/// Per Critical Rule #7 the ritual is unbypassable in shipped builds; there
/// is intentionally no "skip" button anywhere in this flow.
struct DoubleLockView: View {
    @StateObject private var state = DoubleLockState()
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    var onComplete: () -> Void = {}

    var body: some View {
        ZStack {
            theme.palette.bg.ignoresSafeArea()
            VStack(spacing: 0) {
                progressBar
                Group {
                    switch state.step {
                    case .smile:
                        SmileSyncView { state.smileSucceeded() }
                    case .stroop:
                        StroopView(state: state) { state.stroopSucceeded() }
                    case .vocalization:
                        VocalizationView(state: state) { state.vocalizationSucceeded() }
                    case .complete:
                        completion
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .transition(.opacity.combined(with: .move(edge: .trailing)))
                .animation(.easeInOut(duration: 0.30), value: state.step)
            }
        }
        .task {
            #if os(macOS)
            await PermissionsService.shared.promptOnFirstLaunchIfNeeded()
            #endif
        }
        .onChange(of: state.step) { _, newStep in
            if newStep == .complete {
                Task { await complete() }
            }
        }
    }

    private var progressBar: some View {
        HStack(spacing: 6) {
            stepDot(.smile)
            stepDot(.stroop)
            stepDot(.vocalization)
        }
        .padding(.horizontal, 16)
        .padding(.top, 16)
    }

    private func stepDot(_ s: DoubleLockStep) -> some View {
        let active = stepIndex(state.step) >= stepIndex(s)
        return RoundedRectangle(cornerRadius: 2)
            .fill(active ? theme.palette.accent : theme.palette.border)
            .frame(height: 3)
            .frame(maxWidth: .infinity)
    }

    private func stepIndex(_ s: DoubleLockStep) -> Int {
        switch s {
        case .smile: 0
        case .stroop: 1
        case .vocalization: 2
        case .complete: 3
        }
    }

    private var completion: some View {
        VStack(spacing: 12) {
            Text("locked in 🔒")
                .font(.system(size: 36, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            Text("60s well spent. let's go.")
                .font(.system(size: 14))
                .foregroundStyle(theme.palette.muted)
        }
    }

    private func complete() async {
        guard let uid = session.user?.uid else {
            onComplete()
            return
        }
        let nextStreakDay = (session.user?.currentStreak ?? 0) + 1
        do {
            try await DoubleLockSyncService.shared.recordCompletion(
                uid: uid,
                durationMs: state.elapsedMs
            )
            // Phase 4 will read the active module from session/onboarding;
            // for Phase 2 we record the marble with module = nil.
            try await MarbleService.shared.recordDailyMarble(
                uid: uid,
                streakDay: nextStreakDay,
                moduleCompleted: nil
            )
        } catch {
            // Phase 6 will add proper error surfacing + retry queue.
        }
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        onComplete()
    }
}

#Preview {
    DoubleLockView()
        .environmentObject(ThemeEngine())
        .environmentObject(SessionStore())
}
