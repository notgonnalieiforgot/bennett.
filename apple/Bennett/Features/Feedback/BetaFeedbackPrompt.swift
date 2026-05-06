import SwiftUI

/// Per spec §10e — in-app beta feedback. AI Friend voice. Fires after
/// low-stress moments (Double-Lock complete, marble animation). The user
/// can dismiss without typing — feedback is opt-in.
struct BetaFeedbackPrompt: View {
    @Binding var isPresented: Bool
    var trigger: BetaFeedback.Trigger

    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore
    @State private var text: String = ""
    @State private var sending: Bool = false
    @State private var crisisPatterns: [String]?

    var body: some View {
        if let patterns = crisisPatterns {
            CrisisInterceptView(
                surface: .betaFeedback,
                matchedPatterns: patterns,
                onDismiss: {
                    crisisPatterns = nil
                    text = ""
                    isPresented = false
                }
            )
        } else {
            promptBody
        }
    }

    private var promptBody: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("quick one —")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                Text("anything feel off or clunky in the app?")
                    .font(.system(size: 13))
                    .foregroundStyle(theme.palette.muted)
            }
            TextField("optional. anything counts.", text: $text, axis: .vertical)
                .lineLimit(2...5)
                .textFieldStyle(.plain)
                .padding(10)
                .background {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(theme.palette.surface.opacity(0.4))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(theme.palette.border, lineWidth: 1)
                        )
                }
            HStack {
                Button("skip") { isPresented = false }
                    .buttonStyle(.plain)
                    .font(.system(size: 13))
                    .foregroundStyle(theme.palette.muted)
                Spacer()
                Button { Task { await send() } } label: {
                    Text(sending ? "sending…" : "send it")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(theme.palette.accent)
                        }
                }
                .buttonStyle(.plain)
                .disabled(sending)
            }
        }
        .padding(16)
        .background {
            RoundedRectangle(cornerRadius: 16)
                .fill(theme.palette.bg)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(theme.palette.border, lineWidth: 1)
                )
        }
        .frame(maxWidth: 420)
        .padding(16)
    }

    private func send() async {
        guard let uid = session.user?.uid, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            isPresented = false
            return
        }
        // Local crisis check before any network call.
        let result = CrisisDetectionService.shared.detect(text)
        if result.matched {
            crisisPatterns = result.matchedPatterns
            return
        }
        sending = true
        defer { sending = false }
        do {
            _ = try await FeedbackService.shared.submit(uid: uid, text: text, trigger: trigger)
        } catch {
            // soft-fail — don't punish user for trying to help.
        }
        text = ""
        isPresented = false
    }
}

extension View {
    /// Bottom-sheet style feedback prompt. Use after Double-Lock complete
    /// or marble animations for in-app beta feedback per spec §10e.
    func betaFeedbackPrompt(
        isPresented: Binding<Bool>,
        trigger: BetaFeedback.Trigger
    ) -> some View {
        sheet(isPresented: isPresented) {
            BetaFeedbackPrompt(isPresented: isPresented, trigger: trigger)
                #if os(macOS)
                .frame(minWidth: 420, minHeight: 220)
                #endif
                .presentationDetentsIfAvailable()
        }
    }
}

private extension View {
    @ViewBuilder
    func presentationDetentsIfAvailable() -> some View {
        #if os(iOS)
        self.presentationDetents([.medium])
        #else
        self
        #endif
    }
}
