import SwiftUI

/// Step 2 of the Double-Lock — Color-Stroop.
///
/// Per spec §5a step 2: 5 questions, tap the INK COLOR (not the word).
/// Errors reset the current question (not the whole test). Total under 30s.
struct StroopView: View {
    @ObservedObject var state: DoubleLockState
    var onComplete: () -> Void

    @EnvironmentObject var theme: ThemeEngine
    @State private var pulseTrigger: Int = 0
    @State private var failureTrigger: Int = 0
    @State private var lastWrongColor: StroopColor?

    var body: some View {
        VStack(spacing: 24) {
            header
            wordCard
                .visualPulse(trigger: $pulseTrigger, color: .green)
                .visualPulse(trigger: $failureTrigger, color: .red)
            optionsGrid
            ProgressView(value: state.stroopGame.progress)
                .tint(theme.palette.accent)
                .frame(maxWidth: 360)
        }
        .padding(24)
    }

    private var header: some View {
        VStack(spacing: 4) {
            Text("step 2 of 3")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(theme.palette.muted)
            Text("tap the ink color, not the word")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(theme.palette.text)
        }
    }

    private var wordCard: some View {
        Text(state.stroopGame.current.word.rawValue.uppercased())
            .font(.system(size: 64, weight: .heavy, design: .rounded))
            .foregroundStyle(state.stroopGame.current.inkColor.color)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 40)
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

    private var optionsGrid: some View {
        let cols = [GridItem(.flexible()), GridItem(.flexible())]
        return LazyVGrid(columns: cols, spacing: 12) {
            ForEach(state.stroopGame.current.options, id: \.self) { color in
                Button {
                    let correct = state.stroopGame.answer(color)
                    if correct {
                        StepFeedback.fire(.success)
                        pulseTrigger &+= 1
                        if state.stroopGame.isComplete { onComplete() }
                    } else {
                        StepFeedback.fire(.failure)
                        failureTrigger &+= 1
                        lastWrongColor = color
                    }
                } label: {
                    Text(color.rawValue)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(theme.palette.text)
                        .frame(maxWidth: .infinity, minHeight: 56)
                        .background {
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(theme.palette.surface)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                                        .stroke(theme.palette.border, lineWidth: 1)
                                )
                        }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 16)
    }
}
