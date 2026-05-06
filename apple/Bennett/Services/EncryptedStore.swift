import Foundation
import FirebaseFirestore

/// Phase 6.8 — convenience wrapper that pairs CryptoService with Firestore.
/// Use this for any collection holding sensitive user-authored content
/// (journal entries, energy pulse history, goals).
///
/// Schema convention for encrypted docs:
///   { "encrypted": true, "ciphertext": "<base64>", "v": 1 }
///
/// Anyone reading the doc raw sees only ciphertext. The decryption key
/// lives in Keychain on the user's devices — Firebase Admin (and
/// therefore the Founder) cannot decrypt server-side.
@MainActor
final class EncryptedStore {
    static let shared = EncryptedStore()
    private let db = Firestore.firestore()

    private init() {}

    /// Write an encrypted payload to `collectionPath/docId`.
    func writeEncrypted<T: Encodable>(
        collectionPath: String,
        docId: String,
        payload: T
    ) async throws {
        let ciphertext = try CryptoService.shared.encrypt(payload)
        try await db
            .collection(collectionPath)
            .document(docId)
            .setData([
                "encrypted": true,
                "ciphertext": ciphertext,
                "v": 1,
                "updatedAt": FieldValue.serverTimestamp(),
            ], merge: true)
    }

    /// Read + decrypt a previously-encrypted doc. Returns nil if the doc
    /// does not exist or wasn't encrypted (legacy plaintext).
    func readEncrypted<T: Decodable>(
        collectionPath: String,
        docId: String,
        as type: T.Type
    ) async throws -> T? {
        let snap = try await db.collection(collectionPath).document(docId).getDocument()
        guard
            snap.exists,
            let data = snap.data(),
            data["encrypted"] as? Bool == true,
            let ciphertext = data["ciphertext"] as? String
        else { return nil }
        return try CryptoService.shared.decrypt(ciphertext, as: type)
    }

    // ----------------------------------------------------------------
    // Convenience methods for the spec-named sensitive collections.
    // ----------------------------------------------------------------

    func writeEnergyPulseEntry(uid: String, dateKey: String, value: Int, note: String?) async throws {
        struct Entry: Codable { let value: Int; let note: String?; let ts: Double }
        try await writeEncrypted(
            collectionPath: "users/\(uid)/energyPulse",
            docId: dateKey,
            payload: Entry(value: value, note: note, ts: Date.now.timeIntervalSince1970 * 1000)
        )
    }

    func readEnergyPulseEntry(uid: String, dateKey: String) async throws -> EnergyPulseEntry? {
        try await readEncrypted(
            collectionPath: "users/\(uid)/energyPulse",
            docId: dateKey,
            as: EnergyPulseEntry.self
        )
    }
}

struct EnergyPulseEntry: Codable, Sendable {
    let value: Int
    let note: String?
    let ts: Double
}
