import SwiftUI
import FirebaseAuth
#if os(iOS)
import UIKit
#endif

/// Phase 7.1 — Sign-up screen. Per spec §12a:
///  - Wordmark "bennett"
///  - Tagline "ur external prefrontal cortex."
///  - Apple, Google, Facebook, LinkedIn (4 socials), divider "or",
///    Phone (iOS only — see CLAUDE.md macOS exception), Email
///  - Apple is REQUIRED FIRST (App Store + Mac App Store rule)
struct SignUpView: View {
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var coordinator: AuthCoordinator
    var onShowSignIn: () -> Void

    @State private var emailMode: Bool = false
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var error: String?
    @State private var loading: Bool = false

    var body: some View {
        ZStack {
            Color(red: 0.04, green: 0.04, blue: 0.04).ignoresSafeArea()
            ScrollView {
                VStack(spacing: 16) {
                    Spacer().frame(height: 60)
                    Text("bennett.")
                        .font(.system(size: 56, weight: .heavy))
                        .foregroundStyle(.white)
                    Text("ur external prefrontal cortex.")
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.6))
                    Spacer().frame(height: 24)
                    if emailMode {
                        emailForm
                    } else {
                        providerButtons
                    }
                    if let error {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(.white.opacity(0.6))
                            .padding(.top, 8)
                    }
                    Spacer().frame(height: 40)
                    Button("already have an account? sign in") { onShowSignIn() }
                        .buttonStyle(.plain)
                        .font(.system(size: 13))
                        .foregroundStyle(.white.opacity(0.6))
                }
                .padding(.horizontal, 24)
                .frame(maxWidth: 460)
                .frame(maxWidth: .infinity)
            }
        }
    }

    @ViewBuilder
    private var providerButtons: some View {
        // Apple FIRST per spec §12a + Critical Rule #1.
        providerButton(label: "continue with apple", systemImage: "applelogo") {
            Task { await signInWithApple() }
        }
        #if os(iOS)
        providerButton(label: "continue with google", systemImage: "g.circle.fill") {
            Task { await signInWithGoogle() }
        }
        providerButton(label: "continue with facebook", systemImage: "f.square.fill") {
            Task { await signInWithFacebook() }
        }
        #endif
        providerButton(label: "continue with linkedin", systemImage: "in.square.fill") {
            // Phase 7 LinkedIn flow lands via ASWebAuthenticationSession.
            // Stub for now — provider config exists in AuthService.
            Task { await ignoreError { _ = try await AuthService.shared.signInWithLinkedIn() } }
        }
        divider
        #if os(iOS)
        providerButton(label: "continue with phone", systemImage: "phone.fill") {
            // Phase 7 — phone OTP flow is intentionally minimal here;
            // the verification sheet lives in PhoneSignInSheet (TODO).
        }
        #endif
        providerButton(label: "continue with email", systemImage: "envelope.fill") {
            emailMode = true
        }
    }

    private var emailForm: some View {
        VStack(spacing: 12) {
            TextField("email", text: $email)
                .textFieldStyle(.plain)
                .padding(14)
                .background {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.white.opacity(0.15), lineWidth: 1)
                        )
                }
                .foregroundStyle(.white)
                #if os(iOS)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)
                #endif
            SecureField("password (8+ chars)", text: $password)
                .textFieldStyle(.plain)
                .padding(14)
                .background {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.white.opacity(0.15), lineWidth: 1)
                        )
                }
                .foregroundStyle(.white)
            Button {
                Task { await signUpEmail() }
            } label: {
                Text(loading ? "creating…" : "create account")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 52)
                    .background {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 1.0, green: 0.42, blue: 0.0))
                    }
            }
            .buttonStyle(.plain)
            .disabled(loading)
            Button("back") { emailMode = false }
                .buttonStyle(.plain)
                .font(.system(size: 12))
                .foregroundStyle(.white.opacity(0.6))
        }
    }

    private var divider: some View {
        HStack {
            Rectangle().fill(Color.white.opacity(0.15)).frame(height: 1)
            Text("or")
                .font(.system(size: 11))
                .foregroundStyle(.white.opacity(0.5))
                .padding(.horizontal, 12)
            Rectangle().fill(Color.white.opacity(0.15)).frame(height: 1)
        }
        .padding(.vertical, 4)
    }

    private func providerButton(label: String, systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: systemImage)
                    .frame(width: 20)
                Text(label)
                    .font(.system(size: 15, weight: .medium))
                Spacer()
            }
            .padding(.horizontal, 16)
            .frame(maxWidth: .infinity, minHeight: 52)
            .background {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white.opacity(0.06))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.white.opacity(0.15), lineWidth: 1)
                    )
            }
            .foregroundStyle(.white)
        }
        .buttonStyle(PressScaleStyle())
    }

    private func signInWithApple() async {
        loading = true
        defer { loading = false }
        do {
            let result = try await AuthService.shared.signInWithApple()
            await coordinator.resolveAfterSignIn(uid: result.user.uid)
        } catch {
            self.error = error.localizedDescription
        }
    }

    #if os(iOS)
    private func signInWithGoogle() async {
        loading = true; defer { loading = false }
        guard let scene = await UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).first,
              let rootVC = await scene.windows.first?.rootViewController else { return }
        do {
            let result = try await AuthService.shared.signInWithGoogle(presenting: rootVC)
            await coordinator.resolveAfterSignIn(uid: result.user.uid)
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func signInWithFacebook() async {
        loading = true; defer { loading = false }
        guard let scene = await UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).first,
              let rootVC = await scene.windows.first?.rootViewController else { return }
        do {
            let result = try await AuthService.shared.signInWithFacebook(presenting: rootVC)
            await coordinator.resolveAfterSignIn(uid: result.user.uid)
        } catch {
            self.error = error.localizedDescription
        }
    }
    #endif

    private func signUpEmail() async {
        loading = true; defer { loading = false }
        do {
            let result = try await AuthService.shared.signUpWithEmail(email, password: password)
            await coordinator.resolveAfterSignIn(uid: result.user.uid)
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func ignoreError(_ block: () async throws -> Void) async {
        do { try await block() } catch { self.error = error.localizedDescription }
    }
}

private struct PressScaleStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}
