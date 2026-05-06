import SwiftUI

/// A single Knowledge Module. Lessons are tap-to-mark-complete; quiz
/// unlocks once all lessons are checked off. Mastery Badge fires when
/// the quiz passes ≥80%.
struct ModuleDetailView: View {
    let module: ModuleContent

    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore
    @State private var progress: ModuleProgress
    @State private var quizOpen: Bool = false

    init(module: ModuleContent) {
        self.module = module
        _progress = State(initialValue: .empty(module.id))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header
                progressBar
                ForEach(module.lessons) { lesson in
                    lessonRow(lesson)
                }
                quizCTA
            }
            .padding(20)
            .frame(maxWidth: 600)
            .frame(maxWidth: .infinity)
        }
        .background(theme.palette.bg)
        .sheet(isPresented: $quizOpen) {
            ModuleQuizView(module: module) { score, passed in
                quizOpen = false
                Task { await applyQuizResult(score: score, passed: passed) }
            }
            #if os(macOS)
            .frame(minWidth: 480, minHeight: 480)
            #endif
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(module.emoji) \(module.name)")
                .font(.system(size: 26, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            Text(module.oneLiner)
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
            if progress.masteryBadgeEarned {
                Text("mastery badge earned")
                    .font(.system(size: 11, weight: .bold))
                    .textCase(.uppercase)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(theme.palette.accent))
            }
        }
    }

    private var progressBar: some View {
        let total = module.lessons.count
        let done = progress.completedLessons.count
        let pct = total > 0 ? Double(done) / Double(total) : 0
        return VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("\(done) of \(total) lessons")
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.muted)
                Spacer()
                Text("\(Int(pct * 100))%")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(theme.palette.accent)
            }
            ProgressView(value: pct)
                .tint(theme.palette.accent)
        }
    }

    private func lessonRow(_ lesson: LessonCard) -> some View {
        let checked = progress.completedLessons.contains(lesson.id)
        return Button {
            toggle(lesson.id)
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: checked ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(checked ? theme.palette.accent : theme.palette.muted)
                    Text(lesson.title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(theme.palette.text)
                    Spacer()
                    Text("\(lesson.durationMin) min")
                        .font(.system(size: 11))
                        .foregroundStyle(theme.palette.muted)
                }
                Text(lesson.body)
                    .font(.system(size: 13))
                    .foregroundStyle(theme.palette.muted)
                    .multilineTextAlignment(.leading)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
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

    @ViewBuilder
    private var quizCTA: some View {
        let allDone = progress.completedLessons.count == module.lessons.count
        Button {
            if allDone { quizOpen = true }
        } label: {
            Text(allDone
                 ? (progress.quizPassed ? "retake quiz" : "take the quiz")
                 : "finish all lessons to unlock quiz")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 48)
                .background {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(allDone ? theme.palette.accent : theme.palette.muted.opacity(0.4))
                }
        }
        .buttonStyle(.plain)
        .disabled(!allDone)
    }

    private func toggle(_ lessonId: String) {
        if progress.completedLessons.contains(lessonId) {
            progress.completedLessons.removeAll { $0 == lessonId }
        } else {
            progress.completedLessons.append(lessonId)
        }
        progress.lastTouchedAt = Date.now.timeIntervalSince1970 * 1000
        Task { await persist() }
    }

    private func applyQuizResult(score: Double, passed: Bool) async {
        progress.bestQuizScore = max(progress.bestQuizScore, score)
        progress.quizPassed = progress.quizPassed || passed
        progress.masteryBadgeEarned = progress.masteryBadgeEarned || passed
        progress.lastTouchedAt = Date.now.timeIntervalSince1970 * 1000
        await persist()
    }

    private func persist() async {
        guard let uid = session.user?.uid else { return }
        try? await DoerTabService.shared.saveModuleProgress(progress, uid: uid)
    }
}
