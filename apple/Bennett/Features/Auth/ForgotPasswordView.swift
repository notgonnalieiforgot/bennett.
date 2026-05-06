import SwiftUI

/// Phase 7.5 — Forgot password (email users only).
struct ForgotPasswordView: View {
    var onBack: () -> Void

    @State private var email: String = ""
    @State private var sent: Bool = false
    @State private var loading: Bool = false
    @State private var error: String?

    var body: some View {
        ZStack {
            Color(red: 0.04, green: 0.04, blue: 0.04).ignoresSafeArea()
            VStack(spacing: 16) {
                Spacer().frame(height: 60)
                if sent {
                    Text("check ur email.")
                        .font(.system(size: 28, weight: .heavy))
                        .foregroundStyle(.white)
                    Text("link expires in 15 minutes.")
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.6))
                } else {
                    Text("forgot password?")
                        .font(.system(size: 28, weight: .heavy))
                        .foregroundStyle(.white)
                    Text("enter ur email and we'll send a reset link.")
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.6))
                    TextField("email", text: $email)
                        .textFieldStyle(.plain)
                        .padding(14)
                        .background(field)
                        .foregroundStyle(.white)
                        #if os(iOS)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        #endif
                    Button {
                        Task { await send() }
                    } label: {
                        Text(loading ? "sending…" : "send it")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity, minHeight: 52)
                            .background {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(red: 1.0, green: 0.42, blue: 0.0))
                            }
                    }
                    .buttonStyle(.plain)
                    .disabled(loading || email.isEmpty)
                    if let error {
                        Text(error).font(.system(size: 12)).foregroundStyle(.white.opacity(0.6))
                    }
                }
                Spacer()
                Button("back to sign in", action: onBack)
                    .buttonStyle(.plain)
                    .font(.system(size: 12))
                    .foregroundStyle(.white.opacity(0.6))
            }
            .padding(.horizontal, 24)
            .frame(maxWidth: 460)
            .frame(maxWidth: .infinity)
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

    private func send() async {
        loading = true; defer { loading = false }
        var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("api/auth/forgot-password"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["email": email])
        do {
            _ = try await URLSession.shared.data(for: req)
            sent = true
        } catch {
            self.error = error.localizedDescription
        }
    }
}
