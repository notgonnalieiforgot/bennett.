import SwiftUI
import FirebaseAuth

/// Phase 7 — Returning user sign-in. Same providers as sign-up. Email
/// shows email + password fields. "forgot password?" link. Phase 7.4
/// biometric prompt fires after first successful sign-in.
struct SignInView: View {
    @EnvironmentObject var coordinator: AuthCoordinator
    var onShowSignUp: () -> Void
    var onForgotPassword: () -> Void

    @State private var email: String = ""
    @State private var password: String = ""
    @State private var error: String?
    @State private var loading: Bool = false
    @State private var biometricAsk: Bool = false

    var body: some View {
        ZStack {
            Color(red: 0.04, green: 0.04, blue: 0.04).ignoresSafeArea()
            ScrollView {
                VStack(spacing: 16) {
                    Spacer().frame(height: 60)
                    Text("welcome back.")
                        .font(.system(size: 36, weight: .heavy))
                        .foregroundStyle(.white)
                    Spacer().frame(height: 24)

                    Button { Task { await signInApple() } } label: {
                        socialRow("continue with apple", icon: "applelogo")
                    }
                    .buttonStyle(.plain)

                    HStack {
                        Rectangle().fill(.white.opacity(0.15)).frame(height: 1)
                        Text("or").font(.system(size: 11)).foregroundStyle(.white.opacity(0.5)).padding(.horizontal, 8)
                        Rectangle().fill(.white.opacity(0.15)).frame(height: 1)
                    }

                    TextField("email", text: $email)
                        .textFieldStyle(.plain)
                        .padding(14)
                        .background(field)
                        .foregroundStyle(.white)
                        #if os(iOS)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        #endif
                    SecureField("password", text: $password)
                        .textFieldStyle(.plain)
                        .padding(14)
                        .background(field)
                        .foregroundStyle(.white)
                    Button {
                        Task { await signInEmail() }
                    } label: {
                        Text(loading ? "signing in…" : "sign in")
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

                    Button("forgot password?", action: onForgotPassword)
                        .buttonStyle(.plain)
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.6))

                    if let error {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(.white.opacity(0.6))
                    }

                    Spacer().frame(height: 40)
                    Button("new here? create an account", action: onShowSignUp)
                        .buttonStyle(.plain)
                        .font(.system(size: 13))
                        .foregroundStyle(.white.opacity(0.6))
                }
                .padding(.horizontal, 24)
                .frame(maxWidth: 460)
                .frame(maxWidth: .infinity)
            }
        }
        .alert("use \(BiometricService.shared.biometricLabel) next time?", isPresented: $biometricAsk) {
            Button("yes") { BiometricService.shared.setEnabled(true) }
            Button("not now", role: .cancel) {}
        }
    }

    private var field: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(Color.white.opacity(0.06))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.15), lineWidth: 1)
            )
    }

    private func socialRow(_ label: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).frame(width: 20)
            Text(label).font(.system(size: 15, weight: .medium))
            Spacer()
        }
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity, minHeight: 52)
        .background(field)
        .foregroundStyle(.white)
    }

    private func signInApple() async {
        loading = true; defer { loading = false }
        do {
            let result = try await AuthService.shared.signInWithApple()
            biometricAsk = true
            await coordinator.resolveAfterSignIn(uid: result.user.uid)
        } catch { self.error = error.localizedDescription }
    }

    private func signInEmail() async {
        loading = true; defer { loading = false }
        do {
            let result = try await AuthService.shared.signInWithEmail(email, password: password)
            biometricAsk = true
            await coordinator.resolveAfterSignIn(uid: result.user.uid)
        } catch { self.error = error.localizedDescription }
    }
}
