import Foundation
import FirebaseFirestore

/// Firestore wrapper for the marbles subcollection per `db/schema.md`:
/// `users/{uid}/marbles/{marbleId}`. Per Critical Rule #6 there is
/// intentionally NO `delete` method — ghosts (and real marbles) persist
/// forever.
@MainActor
final class MarbleService {
    static let shared = MarbleService()
    private let db = Firestore.firestore()

    private init() {}

    private func collection(uid: String) -> CollectionReference {
        db.collection("users").document(uid).collection("marbles")
    }

    /// Record a new marble (clear/gold/diamond/ghost). The id is the date
    /// string so a given day can never produce two marbles.
    func record(_ marble: Marble, uid: String) async throws {
        try await collection(uid: uid).document(marble.id).setData([
            "kind": marble.kind.rawValue,
            "earnedAt": marble.earnedAt,
            "date": marble.date,
            "moduleCompleted": marble.moduleCompleted as Any,
        ], merge: true)
    }

    /// Live-listening query, ordered by date ASC so the visual order matches
    /// the user's progress timeline.
    func observe(uid: String, handler: @escaping ([Marble]) -> Void) -> ListenerRegistration {
        collection(uid: uid)
            .order(by: "date")
            .addSnapshotListener { snap, _ in
                let docs = snap?.documents ?? []
                let marbles: [Marble] = docs.compactMap { doc in
                    let data = doc.data()
                    guard
                        let kindRaw = data["kind"] as? String,
                        let kind = MarbleKind(rawValue: kindRaw),
                        let date = data["date"] as? String
                    else { return nil }
                    return Marble(
                        id: doc.documentID,
                        kind: kind,
                        earnedAt: (data["earnedAt"] as? TimeInterval) ?? 0,
                        date: date,
                        moduleCompleted: data["moduleCompleted"] as? String
                    )
                }
                handler(marbles)
            }
    }

    /// Convenience for the DoubleLock completion path. Picks the right kind
    /// for the streak day and writes it.
    func recordDailyMarble(uid: String, streakDay: Int, moduleCompleted: String?) async throws {
        let date = DoubleLockSyncService.todayKey()
        let marble = Marble(
            id: date,
            kind: MarbleKind.forStreakDay(streakDay),
            earnedAt: Date.now.timeIntervalSince1970 * 1000,
            date: date,
            moduleCompleted: moduleCompleted
        )
        try await record(marble, uid: uid)
    }
}
