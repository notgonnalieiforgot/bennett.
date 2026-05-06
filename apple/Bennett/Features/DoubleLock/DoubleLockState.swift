import Foundation
import Combine

enum DoubleLockStep: String, Sendable {
    case smile, stroop, vocalization, complete
}

/// Orchestrator for the daily 60-second cognitive gate. Owned by
/// `DoubleLockView`. Per Critical Rule #7 the ritual is unbypassable —
/// `advance()` only lets you move forward when the current step has signaled
/// success.
@MainActor
final class DoubleLockState: ObservableObject {
    @Published private(set) var step: DoubleLockStep = .smile
    @Published private(set) var startedAt: Date = .now
    @Published var stroopGame = StroopGame()
    @Published var phrase: String = AbsurdPhrases.random()

    func reset() {
        step = .smile
        startedAt = .now
        stroopGame = StroopGame()
        phrase = AbsurdPhrases.random()
    }

    func smileSucceeded() {
        guard step == .smile else { return }
        step = .stroop
    }

    func stroopSucceeded() {
        guard step == .stroop else { return }
        step = .vocalization
    }

    func vocalizationSucceeded() {
        guard step == .vocalization else { return }
        step = .complete
    }

    var elapsedMs: Int {
        Int(Date.now.timeIntervalSince(startedAt) * 1000)
    }
}
