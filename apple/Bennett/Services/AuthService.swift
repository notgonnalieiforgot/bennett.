import Foundation
import FirebaseAuth
import AuthenticationServices
#if os(iOS)
import UIKit
import GoogleSignIn
import FacebookLogin
#endif

/// Phase 1.2 — provider config + smoke-test entry points only.
/// The full sign-up screen lands in Phase 7. Apple Sign In must always
/// be the first button on iOS (App Store requirement).
@MainActor
final class AuthService: NSObject {
    static let shared = AuthService()

    var currentFirebaseUser: User? { Auth.auth().currentUser }

    private let appleCoordinator = AppleSignInCoordinator()

    // MARK: - Apple
    func signInWithApple() async throws -> AuthDataResult {
        try await appleCoordinator.signIn()
    }

    #if os(iOS)
    // MARK: - Google (iOS)
    func signInWithGoogle(presenting viewController: UIViewController) async throws -> AuthDataResult {
        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: viewController)
        guard let idToken = result.user.idToken?.tokenString else {
            throw AuthError.missingToken
        }
        let credential = GoogleAuthProvider.credential(
            withIDToken: idToken,
            accessToken: result.user.accessToken.tokenString
        )
        return try await Auth.auth().signIn(with: credential)
    }

    // MARK: - Facebook (iOS)
    func signInWithFacebook(presenting viewController: UIViewController) async throws -> AuthDataResult {
        let manager = LoginManager()
        let loginResult: LoginManagerLoginResult = try await withCheckedThrowingContinuation { cont in
            manager.logIn(permissions: ["public_profile", "email"], from: viewController) { res, err in
                if let err { cont.resume(throwing: err); return }
                if let res { cont.resume(returning: res); return }
                cont.resume(throwing: AuthError.missingToken)
            }
        }
        guard let tokenString = loginResult.token?.tokenString else {
            throw AuthError.missingToken
        }
        let credential = FacebookAuthProvider.credential(withAccessToken: tokenString)
        return try await Auth.auth().signIn(with: credential)
    }

    // MARK: - Phone (iOS-only — no SMS auth on macOS per CLAUDE.md)
    func sendPhoneVerification(_ number: String) async throws -> String {
        try await PhoneAuthProvider.provider().verifyPhoneNumber(number, uiDelegate: nil)
    }

    func signInWithPhone(verificationID: String, code: String) async throws -> AuthDataResult {
        let credential = PhoneAuthProvider.provider().credential(
            withVerificationID: verificationID,
            verificationCode: code
        )
        return try await Auth.auth().signIn(with: credential)
    }
    #endif

    // MARK: - LinkedIn (no native SDK — Phase 7 wires OAuth via
    // SFSafariViewController on iOS / ASWebAuthenticationSession on macOS)
    func signInWithLinkedIn() async throws -> AuthDataResult {
        throw AuthError.notImplementedYet("linkedin")
    }

    // MARK: - Email (works on both platforms)
    func signInWithEmail(_ email: String, password: String) async throws -> AuthDataResult {
        try await Auth.auth().signIn(withEmail: email, password: password)
    }

    func signUpWithEmail(_ email: String, password: String) async throws -> AuthDataResult {
        try await Auth.auth().createUser(withEmail: email, password: password)
    }

    func signOut() throws {
        try Auth.auth().signOut()
        #if os(iOS)
        GIDSignIn.sharedInstance.signOut()
        LoginManager().logOut()
        #endif
    }

    enum AuthError: Error, LocalizedError {
        case missingToken
        case notImplementedYet(String)

        var errorDescription: String? {
            switch self {
            case .missingToken: return "missing auth token"
            case .notImplementedYet(let p): return "\(p) sign-in lands in phase 7"
            }
        }
    }
}
