import Foundation
import Combine
import SwiftUI

/// Dual-tier quiz state machine. Drives both OTF and PSM views from a
/// single source of truth — same answer-handling, scoring, and feedback
/// pipeline. Tier difference is just question source + reward path.
@MainActor
final class QuizEngine: ObservableObject {
    enum Tier: Sendable { case otf, psm }
    enum Phase: Sendable { case intro, asking, finished }

    let tier: Tier
    let sector: MasterySector
    let topic: String
    let questions: [QuizQuestionMC]
    let passThreshold: Double

    @Published private(set) var phase: Phase = .intro
    @Published private(set) var index: Int = 0
    @Published private(set) var picks: [Int?]
    @Published var pulseTrigger: Int = 0
    @Published var shakeTrigger: Int = 0

    init(tier: Tier, sector: MasterySector, topic: String, questions: [QuizQuestionMC], passThreshold: Double) {
        self.tier = tier
        self.sector = sector
        self.topic = topic
        self.questions = questions
        self.passThreshold = passThreshold
        self.picks = Array(repeating: nil, count: questions.count)
    }

    var current: QuizQuestionMC? {
        guard index < questions.count else { return nil }
        return questions[index]
    }

    var score: Double {
        guard !questions.isEmpty else { return 0 }
        let correct = zip(picks, questions).reduce(0) { acc, pair in
            (pair.0 == pair.1.answerIndex) ? acc + 1 : acc
        }
        return Double(correct) / Double(questions.count)
    }

    var passed: Bool { score >= passThreshold }

    func start() {
        phase = .asking
        index = 0
    }

    /// Returns true if the answer was correct.
    @discardableResult
    func answer(_ choice: Int) -> Bool {
        guard let q = current else { return false }
        let correct = choice == q.answerIndex
        picks[index] = choice
        if correct {
            QuizHaptic.fire(.correct)
            pulseTrigger &+= 1
        } else {
            QuizHaptic.fire(.incorrect)
            shakeTrigger &+= 1
        }
        return correct
    }

    /// Advance to the next question or finish.
    func advance() {
        if index + 1 < questions.count {
            index += 1
        } else {
            phase = .finished
        }
    }
}
