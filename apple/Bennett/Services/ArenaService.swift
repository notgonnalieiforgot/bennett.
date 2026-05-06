import Foundation
import FirebaseFirestore

/// Backend + Firestore client for the Arena. The list endpoints return
/// snapshots for initial load; `observe*` methods set up Firestore
/// onSnapshot listeners for real-time updates (Vercel Edge can't hold
/// WebSockets, so Firestore is the real-time channel).
@MainActor
final class ArenaService {
    static let shared = ArenaService()
    private let db = Firestore.firestore()
    private let session = URLSession.shared
    private let decoder = JSONDecoder()

    private init() {}

    func loadGlobal(limit: Int = 50) async throws -> ArenaSnapshot {
        var comps = URLComponents(url: AppConfig.apiBaseURL.appendingPathComponent("api/arena/global"),
                                  resolvingAgainstBaseURL: false)!
        comps.queryItems = [URLQueryItem(name: "limit", value: String(limit))]
        let (data, _) = try await session.data(from: comps.url!)
        return try decoder.decode(ArenaSnapshot.self, from: data)
    }

    func loadSector(_ moduleId: KnowledgeModule, limit: Int = 50) async throws -> ArenaSnapshot {
        var comps = URLComponents(url: AppConfig.apiBaseURL.appendingPathComponent("api/arena/sector"),
                                  resolvingAgainstBaseURL: false)!
        comps.queryItems = [
            URLQueryItem(name: "module", value: moduleId.rawValue),
            URLQueryItem(name: "limit", value: String(limit)),
        ]
        let (data, _) = try await session.data(from: comps.url!)
        return try decoder.decode(ArenaSnapshot.self, from: data)
    }

    /// Real-time global leaderboard. Caller stores the registration and
    /// calls `.remove()` on view disappear.
    func observeGlobal(limit: Int = 50, handler: @escaping ([ArenaEntry]) -> Void) -> ListenerRegistration {
        db.collection("arena")
            .document("global")
            .collection("entries")
            .order(by: "disciplineVelocity", descending: true)
            .limit(to: limit)
            .addSnapshotListener { snap, _ in
                let entries: [ArenaEntry] = (snap?.documents ?? []).compactMap { doc in
                    try? doc.data(as: ArenaEntry.self)
                }
                handler(entries.map { entry in
                    ArenaEntry(
                        uid: entry.uid,
                        username: entry.username,
                        disciplineVelocity: entry.disciplineVelocity,
                        module: nil,                              // Global hides module
                        masteryBadges: entry.masteryBadges,
                        updatedAt: entry.updatedAt
                    )
                })
            }
    }

    func observeSector(_ moduleId: KnowledgeModule, limit: Int = 50, handler: @escaping ([ArenaEntry]) -> Void) -> ListenerRegistration {
        db.collection("arena")
            .document("sector")
            .collection(moduleId.rawValue)
            .order(by: "disciplineVelocity", descending: true)
            .limit(to: limit)
            .addSnapshotListener { snap, _ in
                let entries: [ArenaEntry] = (snap?.documents ?? []).compactMap { doc in
                    try? doc.data(as: ArenaEntry.self)
                }
                handler(entries)
            }
    }
}
