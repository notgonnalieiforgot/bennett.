import Foundation
#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

/// Talks to the backend Calendar endpoints. The client never touches Google
/// OAuth secrets directly — per Critical Rule #2 the consent URL is built
/// server-side and the client only gets the URL to open.
@MainActor
final class ShieldService {
    static let shared = ShieldService()
    private let session: URLSession = .shared
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    private init() {}

    private func url(_ path: String) -> URL {
        AppConfig.apiBaseURL.appendingPathComponent(path)
    }

    /// Returns the Google consent URL. Caller opens it in a browser /
    /// ASWebAuthenticationSession so the user can approve calendar.events.
    func consentURL(uid: String) async throws -> URL {
        var comps = URLComponents(url: url("api/calendar/oauth/start"), resolvingAgainstBaseURL: false)!
        comps.queryItems = [URLQueryItem(name: "uid", value: uid)]
        let (data, res) = try await session.data(from: comps.url!)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        struct Body: Decodable { let url: URL }
        return try decoder.decode(Body.self, from: data).url
    }

    /// Open the consent URL using the platform's preferred mechanism.
    func openConsent(_ url: URL) {
        #if os(iOS)
        UIApplication.shared.open(url)
        #elseif os(macOS)
        NSWorkspace.shared.open(url)
        #endif
    }

    /// POST /api/calendar/shields-today.
    func refreshShieldsToday(uid: String, energyPulse: Int) async throws -> ShieldsTodayResponse {
        var req = URLRequest(url: url("api/calendar/shields-today"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "uid": uid,
            "energyPulse": energyPulse,
            "tz": TimeZone.current.identifier,
        ]
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, res) = try await session.data(for: req)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try decoder.decode(ShieldsTodayResponse.self, from: data)
    }

    /// POST /api/calendar/shield-ignored. Returns the Real Talk message if
    /// the 3-ignore threshold was just crossed.
    @discardableResult
    func reportIgnored(
        uid: String,
        shieldId: String,
        energyPulse: Int,
        userName: String
    ) async throws -> String? {
        var req = URLRequest(url: url("api/calendar/shield-ignored"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "uid": uid,
            "shieldId": shieldId,
            "energyPulse": energyPulse,
            "userName": userName,
        ]
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, res) = try await session.data(for: req)
        guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        struct Body: Decodable { let realTalk: String? }
        return try decoder.decode(Body.self, from: data).realTalk
    }
}
