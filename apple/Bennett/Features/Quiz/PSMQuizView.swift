import SwiftUI

/// Pre-set Mastery (PSM) "Bar Exam" — Tier 2.
///
/// Higher-stakes than OTF. Failure triggers a 24-hour Hard Lockout for
/// this sector + Commander Real Talk. Pass surfaces the Certificate of
/// Mastery and unlocks Elite Tier.
struct PSMQuizView: View {
    let quiz: PSMQuizDoc
    var onComplete: () -> Void

    @StateObject private var engine: QuizEngine
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    @State private var submitted: Bool = false
    @State private var realTalkMessage: String?
    @State private var lockoutUntil: TimeInterval?
    @State private var showCertificate: Bool = false
    @State private var error: String?

    init(quiz: PSMQuizDoc, onComplete: @escaping () -> Void) {
        self.quiz = quiz
        self.onComplete = onComplete
        _engine = StateObject(wrappedValue: QuizEngine(
            tier: .psm,
            sector: quiz.sector,
            topic: quiz.sector.label,
            questions: quiz.questions,
            passThreshold: quiz.passThreshold
        ))
    }

    var body: some View {
        ZStack {
            theme.palette.bg.ignoresSafeArea()
            if showCertificate {
                CertificateOfMasteryView(sector: quiz.sector, score: engine.score, onClose: onComplete)
            } else {
                VStack(spacing: 18) {
                    header
                    if engine.phase == .finished {
                        resultScreen
                    } else if let q = engine.current {
                        questionScreen(q)
                    }
                }
                .padding(24)
                .frame(maxWidth: 600)
            }
        }
        .task { engine.start() }
    }

    private var header: some View {
        VStack(spacing: 4) {
            Text("the bar exam · \(quiz.sector.label)")
                .font(.system(size: 11, weight: .medium))
                .textCase(.uppercase)
                .foregroundStyle(theme.palette.muted)
            Text("question \(engine.index + 1) of \(engine.questions.count)")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
            ProgressView(value: Double(engine.index) / Double(max(1, engine.questions.count)))
                .tint(theme.palette.accent)
                .frame(maxWidth: 360)
        }
    }

    private func questionScreen(_ q: QuizQuestionMC) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(q.prompt)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(theme.palette.text)
                .quizPulse(trigger: $engine.pulseTrigger)
                .quizShake(trigger: $engine.shakeTrigger)
            ForEach(Array(q.options.enumerated()), id: \.offset) { i, opt in
                Button {
                    _ = engine.answer(i)
                    Task { @MainActor in
                        try? await Task.sleep(nanoseconds: 350_000_000)
                        engine.advance()
                    }
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

    @ViewBuilder
    private var resultScreen: some View {
        if engine.passed {
            VStack(spacing: 10) {
                ProgressView().tint(theme.palette.accent)
                Text("submitting…")
                    .font(.system(size: 13))
                    .foregroundStyle(theme.palette.muted)
            }
            .task { await submitIfNeeded() }
        } else {
            VStack(spacing: 12) {
                Text("\(Int(engine.score * 100))%")
                    .font(.system(size: 56, weight: .heavy))
                    .foregroundStyle(theme.palette.muted)
                Text("not quite. lockout: 24h.")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                if let msg = realTalkMessage {
                    Text(msg)
                        .font(.system(size: 13))
                        .foregroundStyle(.white)
                        .padding(12)
                        .background {
                            RoundedRectangle(cornerRadius: 10).fill(Color.red.opacity(0.85))
                        }
                }
                if let until = lockoutUntil {
                    Text("unlocks: \(formatLockout(until: until))")
                        .font(.system(size: 11))
                        .foregroundStyle(theme.palette.muted)
                }
                Button("close") { onComplete() }
                    .buttonStyle(.plain)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background {
                        RoundedRectangle(cornerRadius: 12).fill(theme.palette.accent)
                    }
            }
            .task { await submitIfNeeded() }
        }
    }

    private func submitIfNeeded() async {
        guard !submitted, let uid = session.user?.uid else { return }
        submitted = true
        do {
            let res = try await MasteryService.shared.submitPSM(
                uid: uid,
                sector: quiz.sector,
                score: engine.score,
                userName: session.user?.username ?? "u",
                energyPulse: session.energyPulseToday
            )
            realTalkMessage = res.realTalkMessage
            lockoutUntil = res.result.lockoutUntil
            if res.result.passed {
                try? await Task.sleep(nanoseconds: 300_000_000)
                showCertificate = true
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func formatLockout(until: TimeInterval) -> String {
        let now = Date.now.timeIntervalSince1970 * 1000
        let remaining = max(0, until - now)
        let hours = Int(remaining / (1000 * 60 * 60))
        let minutes = Int((remaining.truncatingRemainder(dividingBy: 1000 * 60 * 60)) / (1000 * 60))
        return "\(hours)h \(minutes)m"
    }
}
