import Foundation

@MainActor
final class FeedbackService {
    static let shared = FeedbackService()
    private let session: URLSession = .shared
    private let decoder = JSONDecoder()

    private init() {}

    func submit(uid: String, text: String, trigger: BetaFeedback.Trigger) async throws -> BetaFeedback {
        var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("api/feedback/submit"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "text": text,
            "trigger": trigger.rawValue,
        ])
        let (data, _) = try await session.data(for: req)
        return try decoder.decode(BetaFeedback.self, from: data)
    }
}
