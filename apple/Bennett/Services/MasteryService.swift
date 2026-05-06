import Foundation

@MainActor
final class MasteryService {
    static let shared = MasteryService()
    private let session: URLSession = .shared
    private let decoder = JSONDecoder()

    private init() {}

    private func url(_ path: String) -> URL {
        AppConfig.apiBaseURL.appendingPathComponent(path)
    }

    func generateOTF(uid: String, topic: String, sector: MasterySector, context: String) async throws -> OTFQuizDoc {
        var req = URLRequest(url: url("api/mastery/otf-generate"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "topic": topic,
            "sector": sector.rawValue,
            "context": context,
        ])
        let (data, res) = try await session.data(for: req)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try decoder.decode(OTFQuizDoc.self, from: data)
    }

    func submitOTF(uid: String, quizId: String, topic: String, sector: MasterySector, score: Double) async throws {
        var req = URLRequest(url: url("api/mastery/otf-submit"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "quizId": quizId,
            "topic": topic,
            "sector": sector.rawValue,
            "score": score,
        ])
        _ = try await session.data(for: req)
    }

    struct PSMFetchResponse: Decodable {
        let unlocked: Bool
        let reason: String?
        let otfPassed: Int?
        let otfRequired: Int?
        let lockoutUntil: TimeInterval?
        let quiz: PSMQuizDoc?
    }

    func fetchPSM(uid: String, sector: MasterySector) async throws -> PSMFetchResponse {
        var comps = URLComponents(url: url("api/mastery/psm-fetch"), resolvingAgainstBaseURL: false)!
        comps.queryItems = [
            URLQueryItem(name: "uid", value: uid),
            URLQueryItem(name: "sector", value: sector.rawValue),
        ]
        let (data, _) = try await session.data(from: comps.url!)
        return try decoder.decode(PSMFetchResponse.self, from: data)
    }

    func submitPSM(uid: String, sector: MasterySector, score: Double, userName: String, energyPulse: Int?) async throws -> PSMSubmitResponse {
        var req = URLRequest(url: url("api/mastery/psm-submit"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        var payload: [String: Any] = [
            "uid": uid,
            "sector": sector.rawValue,
            "score": score,
            "userName": userName,
        ]
        if let energyPulse { payload["energyPulse"] = energyPulse }
        req.httpBody = try JSONSerialization.data(withJSONObject: payload)
        let (data, _) = try await session.data(for: req)
        return try decoder.decode(PSMSubmitResponse.self, from: data)
    }

    func sectorProgress(uid: String) async throws -> [SectorProgressDoc] {
        var comps = URLComponents(url: url("api/mastery/sector-progress"), resolvingAgainstBaseURL: false)!
        comps.queryItems = [URLQueryItem(name: "uid", value: uid)]
        let (data, _) = try await session.data(from: comps.url!)
        struct Wrap: Decodable { let progress: [SectorProgressDoc] }
        return try decoder.decode(Wrap.self, from: data).progress
    }
}
