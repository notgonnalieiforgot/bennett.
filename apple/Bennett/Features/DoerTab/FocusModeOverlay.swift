import SwiftUI

/// Full-screen focus mode triggered by the Knowledge Bar. Shows the
/// Claude-distilled study protocol + a visible 20-minute timer.
/// Soft ambient sound is Phase 6 polish (per spec §6c "soft ambient
/// sound option" — leaving the affordance + a TODO).
struct FocusModeOverlay: View {
    let protocolDoc: KnowledgeBarProtocolDoc
    var onDismiss: () -> Void

    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore
    @State private var startedAt: Date = .now
    @State private var elapsed: TimeInterval = 0
    @State private var tickTask: Task<Void, Never>?
    @State private var otfPrompt: Bool = false
    @State private var otfLoading: Bool = false
    @State private var otfQuiz: OTFQuizDoc?
    @State private var otfError: String?

    private var totalSeconds: TimeInterval { 20 * 60 }
    private var remaining: TimeInterval { max(0, totalSeconds - elapsed) }
    private var done: Bool { elapsed >= totalSeconds }

    var body: some View {
        ZStack {
            theme.palette.bg.opacity(0.97).ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    timerHeader
                    Text(protocolDoc.topic)
                        .font(.system(size: 28, weight: .heavy))
                        .foregroundStyle(theme.palette.text)
                    section("objective", body: protocolDoc.objective)
                    if !protocolDoc.keyConcepts.isEmpty {
                        section("key concepts",
                                bullets: protocolDoc.keyConcepts)
                    }
                    if !protocolDoc.studyPlan.isEmpty {
                        section("20-min study plan",
                                bullets: protocolDoc.studyPlan,
                                numbered: true)
                    }
                    section("action step", body: protocolDoc.actionStep, accent: true)
                    if otfPrompt {
                        otfPromptCard
                    } else {
                        Button(done ? "done" : "exit early") {
                            otfPrompt = true
                        }
                        .buttonStyle(.plain)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 48)
                        .background {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(done ? theme.palette.accent : theme.palette.muted.opacity(0.6))
                        }
                    }
                }
                .padding(24)
                .frame(maxWidth: 600)
                .frame(maxWidth: .infinity)
            }
        }
        .task {
            startedAt = .now
            tickTask = Task { @MainActor in
                while !Task.isCancelled {
                    try? await Task.sleep(nanoseconds: 1_000_000_000)
                    elapsed = Date.now.timeIntervalSince(startedAt)
                }
            }
        }
        .onDisappear { tickTask?.cancel() }
        .sheet(item: $otfQuiz) { quiz in
            OTFQuizView(quiz: quiz) { _, _ in
                otfQuiz = nil
                onDismiss()
            }
            #if os(macOS)
            .frame(minWidth: 540, minHeight: 600)
            #endif
        }
    }

    private var otfPromptCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("yo, u just finished the breakdown.")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            Text("let's see if it stuck. 5 quick ones for the marbles?")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
            HStack(spacing: 10) {
                Button("skip") { onDismiss() }
                    .buttonStyle(.plain)
                    .frame(maxWidth: .infinity, minHeight: 40)
                    .background {
                        RoundedRectangle(cornerRadius: 10).fill(theme.palette.surface.opacity(0.4))
                    }
                Button {
                    Task { await startOTF() }
                } label: {
                    Text(otfLoading ? "generating…" : "run it")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 40)
                        .background {
                            RoundedRectangle(cornerRadius: 10).fill(theme.palette.accent)
                        }
                }
                .buttonStyle(.plain)
                .disabled(otfLoading)
            }
            if let otfError {
                Text(otfError)
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.muted)
            }
        }
        .padding(14)
        .background {
            RoundedRectangle(cornerRadius: 12).fill(theme.palette.surface.opacity(0.4))
        }
    }

    private func startOTF() async {
        guard let uid = session.user?.uid else { onDismiss(); return }
        otfLoading = true
        defer { otfLoading = false }
        do {
            let sector = guessSector(from: protocolDoc.topic)
            let context = """
            topic: \(protocolDoc.topic)
            objective: \(protocolDoc.objective)
            key concepts:
            \(protocolDoc.keyConcepts.map { "- \($0)" }.joined(separator: "\n"))
            study plan:
            \(protocolDoc.studyPlan.enumerated().map { "\($0.offset + 1). \($0.element)" }.joined(separator: "\n"))
            action step: \(protocolDoc.actionStep)
            """
            let quiz = try await MasteryService.shared.generateOTF(
                uid: uid,
                topic: protocolDoc.topic,
                sector: sector,
                context: context
            )
            otfQuiz = quiz
        } catch {
            otfError = error.localizedDescription
        }
    }

    /// Lightweight topic→sector heuristic. Phase 6 may swap to a Claude
    /// classifier; for now this matches the web side.
    private func guessSector(from topic: String) -> MasterySector {
        let t = topic.lowercased()
        let contains: (String) -> Bool = { needle in t.contains(needle) }
        if contains("option") || contains("stock") || contains("portfolio")
            || contains("equit") || contains("bond") || contains("invest")
            || contains("finance") || contains("tax") || contains("roth")
            || contains("401") || contains("hedge") {
            return .finance
        }
        if contains("real estate") || contains("rental") || contains("cap rate")
            || contains("noi") || contains("property") || contains("mortgage")
            || contains("landlord") {
            return .realEstate
        }
        if contains("ai") || contains("llm") || contains("gpt")
            || contains("claude") || contains("prompt") || contains("model")
            || contains("token") || contains("tensor") || contains("gpu")
            || contains("coding") {
            return .aiTech
        }
        if contains("sleep") || contains("workout") || contains("protein")
            || contains("vo2") || contains("fitness") || contains("cardio")
            || contains("strength") || contains("nutrition") {
            return .fitness
        }
        if contains("dose") || contains("drug") || contains("medic")
            || contains("disease") || contains("patient") || contains("clinical")
            || contains("trial") || contains("nnt") {
            return .medical
        }
        return .general
    }

    private var timerHeader: some View {
        HStack {
            Text(format(remaining))
                .font(.system(size: 18, weight: .bold, design: .monospaced))
                .foregroundStyle(theme.palette.text)
            Spacer()
            ProgressView(value: min(elapsed / totalSeconds, 1.0))
                .tint(theme.palette.accent)
                .frame(width: 120)
        }
        .padding(.bottom, 4)
    }

    private func format(_ s: TimeInterval) -> String {
        let m = Int(s) / 60
        let sec = Int(s) % 60
        return String(format: "%02d:%02d", m, sec)
    }

    private func section(_ title: String, body: String, accent: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .textCase(.uppercase)
                .foregroundStyle(theme.palette.muted)
            Text(body)
                .font(.system(size: 15))
                .foregroundStyle(accent ? theme.palette.accent : theme.palette.text)
        }
    }

    private func section(_ title: String, bullets: [String], numbered: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .textCase(.uppercase)
                .foregroundStyle(theme.palette.muted)
            ForEach(Array(bullets.enumerated()), id: \.offset) { idx, item in
                HStack(alignment: .top, spacing: 8) {
                    Text(numbered ? "\(idx + 1)." : "·")
                        .foregroundStyle(theme.palette.muted)
                        .font(.system(size: 14, weight: .medium))
                    Text(item)
                        .foregroundStyle(theme.palette.text)
                        .font(.system(size: 14))
                }
            }
        }
    }
}
