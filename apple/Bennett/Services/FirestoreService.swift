import Foundation
import FirebaseFirestore

/// Thin wrapper around Firestore for the `users/{uid}` doc + subcollections.
/// Subcollections (marbles, shields, bulletins, feedback) get their own
/// services as their respective phases land.
@MainActor
final class FirestoreService {
    static let shared = FirestoreService()
    private let db = Firestore.firestore()

    private init() {}

    func userDoc(uid: String) -> DocumentReference {
        db.collection("users").document(uid)
    }

    func loadUser(uid: String) async throws -> UserRecord? {
        let snap = try await userDoc(uid: uid).getDocument()
        guard snap.exists else { return nil }
        return try snap.data(as: UserRecord.self)
    }

    func saveUser(_ user: UserRecord) async throws {
        try userDoc(uid: user.uid).setData(from: user, merge: true)
    }
}
