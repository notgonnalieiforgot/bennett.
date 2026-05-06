import SwiftUI

/// Top-level gate: shows the right screen for whatever stage the user is
/// in. Wrap RootView with this once Phase 7 is wired into BennettApp.
struct AuthGate<Content: View>: View {
    @StateObject private var coordinator = AuthCoordinator()
    let content: () -> Content

    @State private var showSignIn: Bool = false
    @State private var showForgotPassword: Bool = false

    var body: some View {
        Group {
            switch coordinator.stage {
            case .signedOut:
                if showForgotPassword {
                    ForgotPasswordView(onBack: { showForgotPassword = false })
                } else if showSignIn {
                    SignInView(
                        onShowSignUp: { showSignIn = false },
                        onForgotPassword: { showForgotPassword = true }
                    )
                } else {
                    SignUpView(onShowSignIn: { showSignIn = true })
                }
            case .needsUsername:
                UsernameSetupView()
            case .needsOnboarding:
                OnboardingFlow()
            case .signedIn:
                content()
            }
        }
        .environmentObject(coordinator)
    }
}
