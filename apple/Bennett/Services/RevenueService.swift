import Foundation

/// Backend client for the Stripe + Scholarship + Redemption endpoints.
@MainActor
final class RevenueService {
    static let shared = RevenueService()
    private let session: URLSession = .shared
    private let decoder = JSONDecoder()

    private init() {}

    private func url(_ path: String) -> URL {
        AppConfig.apiBaseURL.appendingPathComponent(path)
    }

    func startCheckout(
        uid: String,
        plan: StripePlan,
        successUrl: String,
        cancelUrl: String
    ) async throws -> StripeCheckoutResponse {
        var req = URLRequest(url: url("api/stripe/checkout"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "plan": plan.rawValue,
            "successUrl": successUrl,
            "cancelUrl": cancelUrl,
        ])
        let (data, res) = try await session.data(for: req)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try decoder.decode(StripeCheckoutResponse.self, from: data)
    }

    func checkScholarship30Day(uid: String, currentStreak: Int) async throws -> Bool {
        var req = URLRequest(url: url("api/scholarship/check-30day"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "currentStreak": currentStreak,
        ])
        let (data, _) = try await session.data(for: req)
        struct Body: Decodable { let refunded: Bool }
        return try decoder.decode(Body.self, from: data).refunded
    }

    func startRedemption(uid: String, trial: RedemptionTrial, date: String) async throws {
        var req = URLRequest(url: url("api/redemption/start"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "trial": trial.rawValue,
            "date": date,
        ])
        _ = try await session.data(for: req)
    }

    func verifyRedemption(
        uid: String,
        trial: RedemptionTrial,
        date: String,
        survived: Bool,
        evidence: [String: Any]
    ) async throws -> Int {
        var req = URLRequest(url: url("api/redemption/verify"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "trial": trial.rawValue,
            "date": date,
            "survived": survived,
            "evidence": evidence,
        ])
        let (data, _) = try await session.data(for: req)
        struct Body: Decodable { let currentStreak: Int }
        return try decoder.decode(Body.self, from: data).currentStreak
    }
}
