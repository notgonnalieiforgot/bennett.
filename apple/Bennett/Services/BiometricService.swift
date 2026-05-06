import Foundation
import LocalAuthentication

/// Phase 7.4 — Biometric auth shim.
///
/// iOS uses Face ID, macOS uses Touch ID, both via `LAContext`. The
/// "use Face ID next time?" prompt fires after the first successful
/// sign-in; an approval flips a UserDefaults flag and stores no extra
/// secrets — the auth re-trigger on next launch is just an LAContext
/// evaluatePolicy call gating access to the already-signed-in session.
@MainActor
final class BiometricService {
    static let shared = BiometricService()
    private init() {}

    private let prefKey = "bn.biometricEnabled"

    var isEnabled: Bool {
        UserDefaults.standard.bool(forKey: prefKey)
    }

    func setEnabled(_ enabled: Bool) {
        UserDefaults.standard.set(enabled, forKey: prefKey)
    }

    var biometricLabel: String {
        let ctx = LAContext()
        var err: NSError?
        guard ctx.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &err) else {
            return "biometrics"
        }
        switch ctx.biometryType {
        case .faceID:  return "face id"
        case .touchID: return "touch id"
        default:       return "biometrics"
        }
    }

    /// Prompts for biometric verification. Returns true on success.
    func evaluate(reason: String = "unlock bennett") async -> Bool {
        let ctx = LAContext()
        var err: NSError?
        guard ctx.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &err) else {
            return false
        }
        return await withCheckedContinuation { cont in
            ctx.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { ok, _ in
                cont.resume(returning: ok)
            }
        }
    }
}
