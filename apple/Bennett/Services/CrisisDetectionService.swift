import Foundation

/// Swift mirror of `shared/types/Crisis.ts`. Same regex set, same
/// conservative threshold. Bennett targets users with major depression;
/// every free-text input flows through this guard before reaching any
/// AI pipeline or persona response.
///
/// IMPORTANT: voice in the intercept UI is calm + clinical, NOT Bennett
/// lingo. The intercept's job is to redirect to real help, not to provide
/// it. Spec follow-up: Phase 6.5 may add a Claude classifier for
/// nuanced cases.
enum CrisisLevel: String, Sendable {
    case none, high
}

struct CrisisDetectionResult: Sendable {
    let level: CrisisLevel
    let matchedPatterns: [String]
    var matched: Bool { level == .high }
}

enum CrisisSurface: String, Sendable {
    case betaFeedback     = "beta_feedback"
    case knowledgeBar     = "knowledge_bar"
    case vocalization
    case waitlistAnswer   = "waitlist_answer"
    case otfPrompt        = "otf_prompt"
    case unknown
}

@MainActor
final class CrisisDetectionService {
    static let shared = CrisisDetectionService()
    private let session: URLSession = .shared

    private init() {}

    private struct Pattern {
        let name: String
        let regex: NSRegularExpression
    }

    private static let patterns: [Pattern] = [
        try! make("kill_myself",        #"\bkill(ing)?\s+(myself|me)\b"#),
        try! make("want_to_die",        #"\b(want|wanna|going)\s+to\s+die\b"#),
        try! make("suicide_ideation",   #"\b(i\s+(am|'m)\s+suicidal|i\s+want\s+to\s+(commit\s+)?suicide|thinking\s+(of|about)\s+suicide|planning\s+(my\s+)?suicide)\b"#),
        try! make("end_my_life",        #"\bend(ing)?\s+(my\s+)?(life|it\s+all)\b"#),
        try! make("hurt_myself",        #"\b(hurt|harm|cut|cutting)\s+myself\b"#),
        try! make("self_harm",          #"\bself[\s\-]harm(ing)?\b"#),
        try! make("overdose_intent",    #"\b(going\s+to\s+|gonna\s+|i'?m?\s+about\s+to\s+)overdose\b"#),
        try! make("better_off_dead",    #"\b(better\s+off\s+dead|wish\s+i\s+(was|were)\s+dead)\b"#),
        try! make("no_reason_to_live",  #"\b(no\s+(reason|point)\s+to\s+(live|keep\s+going)|nothing\s+to\s+live\s+for)\b"#),
        try! make("jump_off",           #"\bjump(ing)?\s+off\b"#),
    ]

    private static func make(_ name: String, _ pattern: String) throws -> Pattern {
        let re = try NSRegularExpression(pattern: pattern, options: [.caseInsensitive])
        return Pattern(name: name, regex: re)
    }

    /// Pure detector — no IO, no logging. Run on every free-text input
    /// the user submits before invoking any backend pipeline.
    func detect(_ text: String?) -> CrisisDetectionResult {
        guard let text, !text.isEmpty else {
            return CrisisDetectionResult(level: .none, matchedPatterns: [])
        }
        let range = NSRange(text.startIndex..<text.endIndex, in: text)
        var matched: [String] = []
        for p in Self.patterns where p.regex.firstMatch(in: text, options: [], range: range) != nil {
            matched.append(p.name)
        }
        return CrisisDetectionResult(
            level: matched.isEmpty ? .none : .high,
            matchedPatterns: matched
        )
    }

    /// Log a privacy-safe record to /api/crisis/log. RAW TEXT IS NEVER SENT.
    func log(uid: String, surface: CrisisSurface, patterns: [String], action: String) async {
        var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("api/crisis/log"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = [
            "uid": uid,
            "surface": surface.rawValue,
            "matchedPatterns": patterns,
            "action": action,
            "ts": Int(Date.now.timeIntervalSince1970 * 1000),
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        _ = try? await session.data(for: req)
    }
}
