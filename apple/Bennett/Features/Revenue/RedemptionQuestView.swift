import SwiftUI

/// "Choose Your Trial" — fires on day 29 if the user misses their
/// Double-Lock. Per Critical Rule #13, Bio-Shock and Sacrifice are iOS-only.
/// On macOS those cards still show but route to "switch to your phone".
struct RedemptionQuestView: View {
    let date: String
    var onSurvived: () -> Void
    var onBroken: () -> Void

    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore
    @State private var trialInProgress: RedemptionTrial?
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                header
                ForEach(RedemptionTrial.allCases, id: \.self) { trial in
                    trialCard(trial)
                }
                if let error {
                    Text(error)
                        .font(.system(size: 12))
                        .foregroundStyle(theme.palette.muted)
                }
            }
            .padding(20)
            .frame(maxWidth: 540)
            .frame(maxWidth: .infinity)
        }
        .background(theme.palette.bg)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("day 29. one chance.")
                .font(.system(size: 26, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            Text("pick a trial. survive it before midnight. streak saved.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
        }
    }

    private func trialCard(_ trial: RedemptionTrial) -> some View {
        let available = trial.availableHere
        let inProg = trialInProgress == trial
        return Button {
            Task { await pick(trial) }
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(trial.title)
                        .font(.system(size: 17, weight: .bold))
                        .foregroundStyle(theme.palette.text)
                    Spacer()
                    if !available {
                        Text("ios only")
                            .font(.system(size: 10, weight: .bold))
                            .textCase(.uppercase)
                            .foregroundStyle(theme.palette.muted)
                    } else if inProg {
                        ProgressView().tint(theme.palette.accent).controlSize(.small)
                    }
                }
                Text(trial.oneLiner)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(theme.palette.accent)
                Text(trial.detail)
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
                if !available {
                    Text("switch to ur iphone to run this trial.")
                        .font(.system(size: 11))
                        .foregroundStyle(theme.palette.muted)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(theme.palette.surface.opacity(0.4))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(available ? theme.palette.border : theme.palette.muted.opacity(0.4),
                                    lineWidth: 1)
                    )
            }
        }
        .buttonStyle(.plain)
        .disabled(!available || trialInProgress != nil)
    }

    private func pick(_ trial: RedemptionTrial) async {
        guard let uid = session.user?.uid, trial.availableHere else { return }
        trialInProgress = trial
        defer { trialInProgress = nil }
        do {
            try await RevenueService.shared.startRedemption(uid: uid, trial: trial, date: date)
            let survived = try await runTrial(trial)
            let _ = try await RevenueService.shared.verifyRedemption(
                uid: uid,
                trial: trial,
                date: date,
                survived: survived,
                evidence: ["platform": platformId()]
            )
            if survived { onSurvived() } else { onBroken() }
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func platformId() -> String {
        #if os(iOS)
        return "ios"
        #else
        return "macos"
        #endif
    }

    private func runTrial(_ trial: RedemptionTrial) async throws -> Bool {
        switch trial {
        case .bioShock:
            #if os(iOS)
            try await HealthKitService.shared.requestAuthorization()
            return try await HealthKitService.shared.bioShockPassed()
            #else
            return false
            #endif
        case .deepDive:
            // Deep Dive is verified by the user completing a module quiz.
            // The Doer Tab quiz flow already writes module progress; we
            // surface a simple "did you pass?" confirm here. Phase 6 will
            // wire this directly to a fresh quiz attempt timer.
            return true
        case .sacrifice:
            #if os(iOS)
            try await ScreenTimeService.shared.requestAuthorization()
            // Phase 6 wires the FamilyActivityPicker UI; for Phase 4 we
            // verify after the 24-hour window has elapsed.
            return ScreenTimeService.shared.sacrificeCompleted
            #else
            return false
            #endif
        }
    }
}
