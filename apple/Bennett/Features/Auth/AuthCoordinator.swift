import SwiftUI
import FirebaseAuth

/// Phase 7 — single state machine driving the auth surface.
///
///   .signedOut         → show SignUpView (toggleable to SignInView)
///   .needsUsername     → show UsernameSetupView (post-auth, before app)
///   .needsOnboarding   → show OnboardingFlow (10 steps)
///   .signedIn          → show RootView
///
/// `isNewUser` is read server-side from the user record (Critical Rule #10).
@MainActor
final class AuthCoordinator: ObservableObject {
    enum Stage: Equatable {
        case signedOut
        case needsUsername
        case needsOnboarding
        case signedIn
    }

    @Published private(set) var stage: Stage = .signedOut
    @Published var firebaseUid: String?

    func resolveAfterSignIn(uid: String) async {
        firebaseUid = uid
        do {
            let user = try await FirestoreService.shared.loadUser(uid: uid)
            if user == nil || user?.username.isEmpty == true {
                stage = .needsUsername
                return
            }
            if user?.isNewUser ?? true {
                stage = .needsOnboarding
                return
            }
            stage = .signedIn
        } catch {
            stage = .needsUsername  // safest fallback
        }
    }

    func usernameLocked() {
        stage = .needsOnboarding
    }

    func onboardingCompleted() {
        stage = .signedIn
    }

    func signOut() {
        try? Auth.auth().signOut()
        firebaseUid = nil
        stage = .signedOut
    }
}
