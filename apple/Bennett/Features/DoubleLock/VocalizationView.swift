import SwiftUI

/// Step 3 of the Double-Lock — Absurd Vocalization Defusion.
///
/// Per spec §5a step 3: read a nonsensical phrase aloud. ≥70% match passes.
/// 20s soft cap.
struct VocalizationView: View {
    @ObservedObject var state: DoubleLockState
    var onComplete: () -> Void

    @StateObject private var recognizer: VocalRecognizer
    @EnvironmentObject var theme: ThemeEngine

    @State private var pulseTrigger: Int = 0
    @State private var elapsed: TimeInterval = 0
    private let cap: TimeInterval = 20.0
    private let timer = Timer.publish(every: 0.1, on: .main, in: .common).autoconnect()
    private let passThreshold: Double = 0.70

    init(state: DoubleLockState, onComplete: @escaping () -> Void) {
        self.state = state
        self.onComplete = onComplete
        _recognizer = StateObject(wrappedValue: VocalRecognizer(target: state.phrase))
    }

    var body: some View {
        VStack(spacing: 20) {
            header
            phraseCard
            transcriptCard
            ProgressView(value: min(elapsed / cap, 1.0))
                .tint(theme.palette.accent)
                .frame(maxWidth: 360)
        }
        .padding(24)
        .task {
            do { try await recognizer.start() } catch { /* surfaced via lastError */ }
        }
        .onDisappear { recognizer.stop() }
        .onReceive(timer) { _ in
            elapsed += 0.1
            if recognizer.matchScore >= passThreshold {
                pulseTrigger &+= 1
                StepFeedback.fire(.success)
                recognizer.stop()
                onComplete()
            }
        }
        .visualPulse(trigger: $pulseTrigger, color: theme.palette.accent)
    }

    private var header: some View {
        VStack(spacing: 4) {
            Text("step 3 of 3")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(theme.palette.muted)
            Text("say it out loud")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            Text("the absurdity is the point")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
        }
    }

    private var phraseCard: some View {
        Text(state.phrase)
            .font(.system(size: 32, weight: .bold))
            .multilineTextAlignment(.center)
            .foregroundStyle(theme.palette.text)
            .frame(maxWidth: .infinity)
            .padding(24)
            .background {
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(theme.palette.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .stroke(theme.palette.border, lineWidth: 1)
                    )
            }
            .padding(.horizontal, 16)
    }

    private var transcriptCard: some View {
        VStack(spacing: 6) {
            Text(recognizer.transcript.isEmpty ? "i'm listening" : recognizer.transcript)
                .font(.system(size: 14))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
            Text("match: \(Int(recognizer.matchScore * 100))%")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(recognizer.matchScore >= passThreshold
                                 ? theme.palette.accent
                                 : theme.palette.muted)
        }
        .padding(.horizontal, 16)
    }
}
