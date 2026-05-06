import Foundation

/// Phrase bank for the Vocalization step. Mirrors `ABSURD_PHRASES` in
/// shared/types/DoubleLock.ts. The phrase is deliberately silly — the point
/// is cognitive defusion, breaking rumination via absurdity.
enum AbsurdPhrases {
    static let all: [String] = [
        "banana thunderstorm",
        "purple elephant doing taxes",
        "umbrella cathedral",
        "spaghetti horizon",
        "concrete butterfly",
        "velvet stopwatch",
        "underground sunshine",
        "frozen melody",
        "denim volcano",
        "paperclip symphony",
    ]

    static func random() -> String { all.randomElement() ?? all[0] }
}
