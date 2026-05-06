import SwiftUI

/// Scholarship Mode entry point — per spec §8a:
/// $20/mo. Hit a 30-day streak → 100% refund. Miss it → bennett keeps it.
/// On 30-day completion the backend automatically issues stripe.refunds.create
/// and writes a Friend persona "u earned it back" message to realTalks.
struct ScholarshipModeView: View {
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    @State private var loading = false
    @State private var error: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            header
            mechanicCard
            cta
            if let error {
                Text(error)
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
            }
        }
        .padding(20)
        .frame(maxWidth: 480)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("scholarship mode")
                .font(.system(size: 24, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            Text("here's the deal.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
        }
    }

    private var mechanicCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("$20")
                .font(.system(size: 48, weight: .heavy))
                .foregroundStyle(theme.palette.accent)
            Text("pay $20. hit a perfect 30-day streak. get it all back.")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            Text("miss a day? bennett keeps the $20.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
            Text("the money isn't the point. the skin in the game is.")
                .font(.system(size: 11))
                .foregroundStyle(theme.palette.muted)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(theme.palette.surface.opacity(0.4))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(theme.palette.border, lineWidth: 1)
                )
        }
    }

    private var cta: some View {
        Button {
            Task { await startCheckout() }
        } label: {
            HStack {
                Text(loading ? "starting checkout…" : "start scholarship mode")
                    .font(.system(size: 16, weight: .semibold))
                if loading { ProgressView().tint(.white).controlSize(.small) }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: 52)
            .background {
                RoundedRectangle(cornerRadius: 14).fill(theme.palette.accent)
            }
        }
        .buttonStyle(.plain)
        .disabled(loading)
    }

    private func startCheckout() async {
        guard let uid = session.user?.uid else { return }
        loading = true
        defer { loading = false }
        do {
            let res = try await RevenueService.shared.startCheckout(
                uid: uid,
                plan: .scholarshipMonthly,
                successUrl: "\(AppConfig.apiBaseURL.absoluteString)/?stripe=success",
                cancelUrl:  "\(AppConfig.apiBaseURL.absoluteString)/?stripe=cancel"
            )
            #if os(iOS)
            await UIApplication.shared.open(res.url)
            #else
            NSWorkspace.shared.open(res.url)
            #endif
        } catch {
            self.error = error.localizedDescription
        }
    }
}
