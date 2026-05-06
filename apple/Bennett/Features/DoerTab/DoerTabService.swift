import Foundation

/// Backend client for the Doer Tab endpoints.
@MainActor
final class DoerTabService {
    static let shared = DoerTabService()
    private let session: URLSession = .shared
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    private init() {}

    private func url(_ path: String) -> URL {
        AppConfig.apiBaseURL.appendingPathComponent(path)
    }

    func access(uid: String) async throws -> DoerTabAccessStatus {
        var comps = URLComponents(url: url("api/doer-tab/access"), resolvingAgainstBaseURL: false)!
        comps.queryItems = [URLQueryItem(name: "uid", value: uid)]
        let (data, res) = try await session.data(from: comps.url!)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try decoder.decode(DoerTabAccessStatus.self, from: data)
    }

    func searchKnowledge(topic: String, uid: String) async throws -> KnowledgeBarProtocolDoc {
        var req = URLRequest(url: url("api/knowledge-bar/search"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["topic": topic, "uid": uid])
        let (data, res) = try await session.data(for: req)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try decoder.decode(KnowledgeBarProtocolDoc.self, from: data)
    }

    func saveModuleProgress(_ progress: ModuleProgress, uid: String) async throws {
        var req = URLRequest(url: url("api/knowledge-modules/progress"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "moduleId": progress.moduleId.rawValue,
            "completedLessons": progress.completedLessons,
            "quizPassed": progress.quizPassed,
            "bestQuizScore": progress.bestQuizScore,
        ])
        _ = try await session.data(for: req)
    }

    func listMarketInsights(domain: MarketInsightDomain?) async throws -> [MarketInsight] {
        var comps = URLComponents(url: url("api/market-insights/list"), resolvingAgainstBaseURL: false)!
        if let domain {
            comps.queryItems = [URLQueryItem(name: "domain", value: domain.rawValue)]
        }
        let (data, res) = try await session.data(from: comps.url!)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        struct Wrap: Decodable { let insights: [MarketInsight] }
        return try decoder.decode(Wrap.self, from: data).insights
    }
}
