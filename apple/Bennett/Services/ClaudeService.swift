import Foundation

/// Server-side relay client. Per Critical Rule #2, this client does NOT
/// hold the Anthropic API key — it speaks only to our Vercel Edge backend.
/// Per Critical Rule #3, every user-facing AI message goes through
/// `BennettPersonaService` server-side; this is the iOS-side caller.
struct ClaudeService {
    static let shared = ClaudeService()

    private let session: URLSession
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    private init(session: URLSession = .shared) {
        self.session = session
    }

    func personaMessage(_ ctx: PersonaContext) async throws -> PersonaResponse {
        let url = AppConfig.apiBaseURL.appendingPathComponent("api/persona")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try encoder.encode(ctx)
        let (data, res) = try await session.data(for: req)
        guard let http = res as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        return try decoder.decode(PersonaResponse.self, from: data)
    }
}
