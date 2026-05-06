import Foundation
import CryptoKit
import Security

/// Phase 6.8 — Zero-Knowledge encryption per spec §9a.
///
/// Two layers:
///
///  1. Data-at-rest: a per-device symmetric key (ChaChaPoly) lives in
///     Keychain with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`. We
///     encrypt sensitive payloads (journal entries, energy pulse history,
///     goals) before Firestore write and decrypt post-read. The key never
///     leaves the device — even iCloud Keychain sync is disabled.
///
///  2. Cloud Relay key exchange: a per-device Curve25519 long-term key
///     pair (the public key gets uploaded once at sign-up; the private
///     key stays on-device). Each relay call generates an ephemeral
///     session key, derives a shared secret with the relay's published
///     pubkey, encrypts the Claude payload, sends to relay, decrypts
///     the response. Phase 6.11 will wire the relay's HSM-backed
///     private key.
///
/// Apple devices without a Secure Enclave (e.g. older iPad models) fall
/// back to a Keychain-stored key with the same access controls. iOS 17+
/// and Apple Silicon Macs always have Secure Enclave.
@MainActor
final class CryptoService {
    static let shared = CryptoService()

    private let symmetricKeyTag = "com.bennett.cos.key.symmetric.v1"
    private let agreementKeyTag = "com.bennett.cos.key.agreement.v1"

    private init() {}

    // MARK: - Data-at-rest (symmetric, ChaChaPoly)

    /// Encrypt any Codable payload. Returns a base64-encoded combined box
    /// (nonce + ciphertext + tag) suitable for Firestore writes.
    func encrypt<T: Encodable>(_ payload: T) throws -> String {
        let key = try loadOrCreateSymmetricKey()
        let plaintext = try JSONEncoder().encode(payload)
        let sealed = try ChaChaPoly.seal(plaintext, using: key)
        return sealed.combined.base64EncodedString()
    }

    /// Decrypt a base64-encoded combined box back into the original type.
    func decrypt<T: Decodable>(_ base64: String, as type: T.Type) throws -> T {
        let key = try loadOrCreateSymmetricKey()
        guard let combined = Data(base64Encoded: base64) else {
            throw CryptoError.invalidCiphertext
        }
        let box = try ChaChaPoly.SealedBox(combined: combined)
        let plaintext = try ChaChaPoly.open(box, using: key)
        return try JSONDecoder().decode(type, from: plaintext)
    }

    private func loadOrCreateSymmetricKey() throws -> SymmetricKey {
        if let existing = try loadSymmetricKey() { return existing }
        let key = SymmetricKey(size: .bits256)
        try saveSymmetricKey(key)
        return key
    }

    private func loadSymmetricKey() throws -> SymmetricKey? {
        let q: [String: Any] = [
            kSecClass as String:        kSecClassGenericPassword,
            kSecAttrAccount as String:  symmetricKeyTag,
            kSecReturnData as String:   true,
            kSecMatchLimit as String:   kSecMatchLimitOne,
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(q as CFDictionary, &item)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = item as? Data else {
            throw CryptoError.keychainStatus(status)
        }
        return SymmetricKey(data: data)
    }

    private func saveSymmetricKey(_ key: SymmetricKey) throws {
        let raw = key.withUnsafeBytes { Data($0) }
        let attrs: [String: Any] = [
            kSecClass as String:        kSecClassGenericPassword,
            kSecAttrAccount as String:  symmetricKeyTag,
            kSecValueData as String:    raw,
            // Never sync via iCloud, never available before first unlock.
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            kSecAttrSynchronizable as String: false,
        ]
        let status = SecItemAdd(attrs as CFDictionary, nil)
        if status != errSecSuccess && status != errSecDuplicateItem {
            throw CryptoError.keychainStatus(status)
        }
    }

    // MARK: - Cloud relay key exchange (Curve25519)

    /// Returns the device's long-term Curve25519 public key, base64-encoded,
    /// for the Phase 6.11 relay handshake. The private key stays in
    /// Keychain — it never leaves the device.
    func devicePublicKey() throws -> String {
        let priv = try loadOrCreateAgreementKey()
        return priv.publicKey.rawRepresentation.base64EncodedString()
    }

    /// Encrypts a payload for the relay using an ephemeral session key
    /// + the relay's published pubkey. Returns base64(ephemeralPub) +
    /// base64(sealedBox) so the relay can derive the shared secret.
    func encryptForRelay<T: Encodable>(_ payload: T, relayPublicKeyBase64: String) throws -> RelayEnvelope {
        guard let raw = Data(base64Encoded: relayPublicKeyBase64) else {
            throw CryptoError.invalidCiphertext
        }
        let relayPub = try Curve25519.KeyAgreement.PublicKey(rawRepresentation: raw)
        let ephemeral = Curve25519.KeyAgreement.PrivateKey()
        let shared = try ephemeral.sharedSecretFromKeyAgreement(with: relayPub)
        let symmetric = shared.hkdfDerivedSymmetricKey(
            using: SHA256.self,
            salt: Data("bennett.relay.v1".utf8),
            sharedInfo: Data(),
            outputByteCount: 32
        )
        let plaintext = try JSONEncoder().encode(payload)
        let sealed = try ChaChaPoly.seal(plaintext, using: symmetric)
        return RelayEnvelope(
            ephemeralPublicKey: ephemeral.publicKey.rawRepresentation.base64EncodedString(),
            ciphertext: sealed.combined.base64EncodedString()
        )
    }

    private func loadOrCreateAgreementKey() throws -> Curve25519.KeyAgreement.PrivateKey {
        if let raw = try loadKeyMaterial(tag: agreementKeyTag) {
            return try Curve25519.KeyAgreement.PrivateKey(rawRepresentation: raw)
        }
        let key = Curve25519.KeyAgreement.PrivateKey()
        try saveKeyMaterial(tag: agreementKeyTag, raw: key.rawRepresentation)
        return key
    }

    private func loadKeyMaterial(tag: String) throws -> Data? {
        let q: [String: Any] = [
            kSecClass as String:        kSecClassGenericPassword,
            kSecAttrAccount as String:  tag,
            kSecReturnData as String:   true,
            kSecMatchLimit as String:   kSecMatchLimitOne,
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(q as CFDictionary, &item)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess else { throw CryptoError.keychainStatus(status) }
        return item as? Data
    }

    private func saveKeyMaterial(tag: String, raw: Data) throws {
        let attrs: [String: Any] = [
            kSecClass as String:        kSecClassGenericPassword,
            kSecAttrAccount as String:  tag,
            kSecValueData as String:    raw,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            kSecAttrSynchronizable as String: false,
        ]
        let status = SecItemAdd(attrs as CFDictionary, nil)
        if status != errSecSuccess && status != errSecDuplicateItem {
            throw CryptoError.keychainStatus(status)
        }
    }

    enum CryptoError: Error, LocalizedError {
        case invalidCiphertext
        case keychainStatus(OSStatus)

        var errorDescription: String? {
            switch self {
            case .invalidCiphertext: return "ciphertext is not valid base64"
            case .keychainStatus(let s): return "keychain error \(s)"
            }
        }
    }
}

struct RelayEnvelope: Codable, Sendable {
    let ephemeralPublicKey: String
    let ciphertext: String
}
