import SwiftUI
import Foundation

enum StroopColor: String, CaseIterable, Sendable {
    case red, blue, green, orange, purple, yellow

    var color: Color {
        switch self {
        case .red:    return .red
        case .blue:   return .blue
        case .green:  return .green
        case .orange: return .orange
        case .purple: return .purple
        case .yellow: return .yellow
        }
    }
}

struct StroopQuestion: Identifiable, Equatable {
    let id = UUID()
    let word: StroopColor      // word the user reads
    let inkColor: StroopColor  // ink color (the correct answer)
    let options: [StroopColor]
}

/// 5 questions, ink-color tap. Errors reset the CURRENT question only,
/// never the whole game (per spec §5a step 2).
struct StroopGame: Equatable {
    static let total = 5

    private(set) var index: Int = 0
    private(set) var questions: [StroopQuestion]

    init() {
        var qs: [StroopQuestion] = []
        for _ in 0..<Self.total {
            qs.append(Self.makeQuestion())
        }
        self.questions = qs
    }

    var current: StroopQuestion { questions[index] }
    var isComplete: Bool { index >= Self.total }
    var progress: Double { Double(index) / Double(Self.total) }

    /// Returns true if answer was correct. On wrong, the current question
    /// is replaced with a fresh shuffle (the index does NOT advance).
    mutating func answer(_ choice: StroopColor) -> Bool {
        let correct = choice == current.inkColor
        if correct {
            index += 1
        } else {
            questions[index] = Self.makeQuestion(excluding: current)
        }
        return correct
    }

    private static func makeQuestion(excluding prev: StroopQuestion? = nil) -> StroopQuestion {
        // The word and ink must differ (otherwise no Stroop interference).
        var word = StroopColor.allCases.randomElement()!
        var ink = StroopColor.allCases.randomElement()!
        while ink == word { ink = StroopColor.allCases.randomElement()! }
        if let prev, prev.word == word && prev.inkColor == ink {
            word = StroopColor.allCases.first(where: { $0 != word }) ?? word
        }
        // 4 options: ink color + 3 distractors
        var pool = Set(StroopColor.allCases)
        pool.remove(ink)
        let distractors = Array(pool).shuffled().prefix(3)
        let options = ([ink] + distractors).shuffled()
        return StroopQuestion(word: word, inkColor: ink, options: options)
    }
}
