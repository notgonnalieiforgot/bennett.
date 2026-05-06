import SwiftUI

/// On-the-Fly quiz view — Tier 1 of the dual-tier mastery system.
///
/// Per spec §2 Focus Overlay: while the quiz runs, all global navigation
/// + the search bar must be disabled. We achieve this by presenting OTF
/// inside a `.fullScreenCover` (iOS) / `.sheet` (macOS) that blocks the
/// host UI; nothing in the host responds while it's up.
struct OTFQuizView: View {
    let quiz: OTFQuizDoc
    var onComplete: (_ score: Double, _ passed: Bool) -> Void

    @StateObject private var engine: QuizEngine
    @EnvironmentObject var theme: ThemeEngine

    init(quiz: OTFQuizDoc, onComplete: @escaping (_ score: Double, _ passed: Bool) -> Void) {
        self.quiz = quiz
        self.onComplete = onComplete
        _engine = StateObject(wrappedValue: QuizEngine(
            tier: .otf,
            sector: quiz.sector,
            topic: quiz.topic,
            questions: quiz.questions,
            passThreshold: 0.8
        ))
    }

    var body: some View {
        ZStack {
            theme.palette.bg.ignoresSafeArea()
            VStack(spacing: 18) {
                header
                if engine.phase == .finished {
                    OTFResultScreen(
                        engine: engine,
                        onClose: { onComplete(engine.score, engine.passed) }
                    )
                } else {
                    questionScreen
                }
            }
            .padding(24)
            .frame(maxWidth: 600)
        }
        .task {
            engine.start()
        }
    }

    private var header: some View {
        VStack(spacing: 4) {
            Text("otf · \(quiz.sector.label)")
                .font(.system(size: 11, weight: .medium))
                .textCase(.uppercase)
                .foregroundStyle(theme.palette.muted)
            Text(quiz.topic)
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
                .multilineTextAlignment(.center)
            ProgressView(value: Double(engine.index) / Double(max(1, engine.questions.count)))
                .tint(theme.palette.accent)
                .frame(maxWidth: 320)
        }
    }

    @ViewBuilder
    private var questionScreen: some View {
        if let q = engine.current {
            VStack(alignment: .leading, spacing: 16) {
                Text(q.prompt)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                    .quizPulse(trigger: $engine.pulseTrigger)
                    .quizShake(trigger: $engine.shakeTrigger)
                ForEach(Array(q.options.enumerated()), id: \.offset) { i, opt in
                    answerButton(opt, index: i)
                }
            }
        }
    }

    private func answerButton(_ text: String, index i: Int) -> some View {
        Button {
            _ = engine.answer(i)
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 350_000_000)
                engine.advance()
            }
        } label: {
            Text(text)
                .font(.system(size: 14))
                .foregroundStyle(theme.palette.text)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(14)
                .background {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(theme.palette.surface.opacity(0.4))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(theme.palette.border, lineWidth: 1)
                        )
                }
        }
        .buttonStyle(.plain)
    }
}

private struct OTFResultScreen: View {
    @ObservedObject var engine: QuizEngine
    var onClose: () -> Void
    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(spacing: 12) {
            Text(engine.passed ? "training marble earned." : "not quite. run it back.")
                .font(.system(size: 22, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            Text("\(Int(engine.score * 100))%")
                .font(.system(size: 56, weight: .heavy))
                .foregroundStyle(engine.passed ? theme.palette.accent : theme.palette.muted)
            Text(engine.passed
                 ? "sector progress bumped. keep stacking."
                 : "review the breakdown, take it again.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
            Button("close") { onClose() }
                .buttonStyle(.plain)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 48)
                .background {
                    RoundedRectangle(cornerRadius: 12).fill(theme.palette.accent)
                }
        }
    }
}
