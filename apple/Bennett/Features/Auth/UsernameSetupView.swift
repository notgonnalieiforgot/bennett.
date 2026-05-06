import SwiftUI

/// Phase 7.2 — Username creation. Per spec §12b:
///   - 3-20 chars, alphanumeric + underscores only
///   - case-insensitive uniqueness
///   - 30-day server-side lock once locked in
///   - "lock it in" CTA, real-time availability check (debounced 500ms)
struct UsernameSetupView: View {
    @EnvironmentObject var coordinator: AuthCoordinator

    @State private var username: String = ""
    @State private var available: Bool?
    @State private var checking: Bool = false
    @State private var error: String?
    @State private var debounceTask: Task<Void, Never>?

    var body: some View {
        ZStack {
            Color(red: 0.04, green: 0.04, blue: 0.04).ignoresSafeArea()
            VStack(spacing: 14) {
                Spacer().frame(height: 60)
                Text("pick ur username")
                    .font(.system(size: 28, weight: .heavy))
                    .foregroundStyle(.white)
                Text("this is how u show up in the arena.")
                    .font(.system(size: 14))
                    .foregroundStyle(.white.opacity(0.6))

                Spacer().frame(height: 24)

                ZStack(alignment: .leading) {
                    if username.isEmpty {
                        Text("@username")
                            .foregroundStyle(.white.opacity(0.3))
                            .padding(.leading, 16)
                    }
                    TextField("", text: $username)
                        .textFieldStyle(.plain)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .foregroundStyle(.white)
                        .font(.system(size: 18, weight: .semibold))
                        #if os(iOS)
                        .textInputAutocapitalization(.never)
                        #endif
                        .onChange(of: username) { _, _ in
                            available = nil
                            debounceCheck()
                        }
                }
                .frame(height: 52)
                .background {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(borderColor, lineWidth: 1)
                        )
                }

                availabilityIndicator
                rules

                Spacer()

                Button {
                    Task { await lockIn() }
                } label: {
                    Text("lock it in")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 52)
                        .background {
                            RoundedRectangle(cornerRadius: 14)
                                .fill(canSubmit
                                      ? Color(red: 1.0, green: 0.42, blue: 0.0)
                                      : Color.white.opacity(0.18))
                        }
                }
                .buttonStyle(.plain)
                .disabled(!canSubmit)

                if let error {
                    Text(error).font(.system(size: 12)).foregroundStyle(.white.opacity(0.6))
                }
            }
            .padding(.horizontal, 24)
            .frame(maxWidth: 460)
            .frame(maxWidth: .infinity)
        }
    }

    private var canSubmit: Bool { available == true && !username.isEmpty }

    private var borderColor: Color {
        switch available {
        case .some(true):  return Color.green.opacity(0.7)
        case .some(false): return Color.white.opacity(0.4)
        default:           return Color.white.opacity(0.15)
        }
    }

    private var availabilityIndicator: some View {
        HStack {
            if checking {
                ProgressView().controlSize(.small)
                Text("checking…").font(.system(size: 12)).foregroundStyle(.white.opacity(0.6))
            } else if available == true {
                Text("✓ available").font(.system(size: 12)).foregroundStyle(.green)
            } else if available == false {
                Text("✗ taken").font(.system(size: 12)).foregroundStyle(.white.opacity(0.5))
            }
            Spacer()
        }
        .padding(.horizontal, 4)
        .frame(height: 18)
    }

    private var rules: some View {
        VStack(alignment: .leading, spacing: 4) {
            ruleLine("3–20 characters")
            ruleLine("letters, numbers, underscores only")
            ruleLine("can't be changed for 30 days")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func ruleLine(_ s: String) -> some View {
        Text("· \(s)")
            .font(.system(size: 11))
            .foregroundStyle(.white.opacity(0.5))
    }

    private func debounceCheck() {
        debounceTask?.cancel()
        debounceTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 500_000_000)
            if Task.isCancelled { return }
            await checkAvailability()
        }
    }

    private func checkAvailability() async {
        let q = username.trimmingCharacters(in: .whitespaces)
        guard q.count >= 3 else { return }
        checking = true; defer { checking = false }
        var comps = URLComponents(url: AppConfig.apiBaseURL.appendingPathComponent("api/username-check"),
                                  resolvingAgainstBaseURL: false)!
        comps.queryItems = [URLQueryItem(name: "q", value: q)]
        do {
            let (data, _) = try await URLSession.shared.data(from: comps.url!)
            struct Body: Decodable { let available: Bool }
            let body = try JSONDecoder().decode(Body.self, from: data)
            available = body.available
        } catch {
            available = nil
        }
    }

    private func lockIn() async {
        guard canSubmit, let uid = coordinator.firebaseUid else { return }
        var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("api/username/lock"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: [
            "uid": uid,
            "username": username,
        ])
        do {
            let (_, res) = try await URLSession.shared.data(for: req)
            guard let http = res as? HTTPURLResponse, http.statusCode == 200 else {
                error = "couldn't lock in. try again."
                return
            }
            coordinator.usernameLocked()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
