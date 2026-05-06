import SwiftUI

/// 5-question multiple choice. ≥80% passes (per QUIZ_PASS_THRESHOLD).
/// Errors don't reset — the user picks once per question, then sees a
/// final score screen.
struct ModuleQuizView: View {
    let module: ModuleContent
    var onDone: (_ score: Double, _ passed: Bool) -> Void

    @EnvironmentObject var theme: ThemeEngine
    @State private var index: Int = 0
    @State private var selections: [Int?] = []
    @State private var showResult: Bool = false

    init(module: ModuleContent, onDone: @escaping (_ score: Double, _ passed: Bool) -> Void) {
        self.module = module
        self.onDone = onDone
        _selections = State(initialValue: Array(repeating: nil, count: module.quiz.questions.count))
    }

    private var score: Double {
        let total = module.quiz.questions.count
        guard total > 0 else { return 0 }
        let correct = zip(selections, module.quiz.questions)
            .filter { sel, q in sel == q.answerIndex }
            .count
        return Double(correct) / Double(total)
    }

    private var passed: Bool { score >= module.quiz.passThreshold }

    var body: some View {
        ZStack {
            theme.palette.bg.ignoresSafeArea()
            VStack(spacing: 18) {
                if showResult {
                    resultScreen
                } else {
                    questionScreen
                }
            }
            .padding(24)
            .frame(maxWidth: 560)
        }
    }

    private var questionScreen: some View {
        let q = module.quiz.questions[index]
        return VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("question \(index + 1) / \(module.quiz.questions.count)")
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
                Spacer()
                Text(module.name)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(theme.palette.muted)
            }
            Text(q.prompt)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            ForEach(Array(q.options.enumerated()), id: \.offset) { i, opt in
                Button {
                    var next = selections
                    next[index] = i
                    selections = next
                    advance()
                } label: {
                    Text(opt)
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
    }

    private var resultScreen: some View {
        VStack(spacing: 14) {
            Text(passed ? "u passed." : "not quite. run it back.")
                .font(.system(size: 26, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            Text("\(Int(score * 100))%")
                .font(.system(size: 48, weight: .heavy))
                .foregroundStyle(passed ? theme.palette.accent : theme.palette.muted)
            Text(passed
                 ? "mastery badge earned. \(module.name) is officially in ur kit."
                 : "need \(Int(module.quiz.passThreshold * 100))%. read the lessons again, then retake.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
            Button("close") {
                onDone(score, passed)
            }
            .buttonStyle(.plain)
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: 48)
            .background {
                RoundedRectangle(cornerRadius: 12).fill(theme.palette.accent)
            }
        }
    }

    private func advance() {
        if index + 1 < module.quiz.questions.count {
            withAnimation(.easeInOut(duration: 0.2)) { index += 1 }
        } else {
            withAnimation(.easeInOut(duration: 0.3)) { showResult = true }
        }
    }
}
