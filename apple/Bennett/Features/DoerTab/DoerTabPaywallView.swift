import SwiftUI

/// Locked state. Per spec §8c (Option C — The Premium Signal):
/// $24/mo monthly, $16.99/mo annual ($204/yr), $40/mo anchor strikethrough.
/// Annual pre-selected. Stripe wiring lands in Phase 4.
struct DoerTabPaywallView: View {
    let reason: DoerTabAccessReason
    let currentStreak: Int

    @EnvironmentObject var theme: ThemeEngine

    enum Plan: String { case monthly, annual }
    @State private var plan: Plan = .annual

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                headline
                subheadline
                planToggle
                pricingCard
                features
                cta
                trustLine
                restoreLink
                if reason == .streakTooShort || reason == .noSubscriptionAndStreakTooShort {
                    streakNote
                }
            }
            .padding(24)
            .frame(maxWidth: 480)
            .frame(maxWidth: .infinity)
        }
    }

    private var headline: some View {
        Text("the war room.")
            .font(.system(size: 36, weight: .heavy))
            .foregroundStyle(theme.palette.text)
    }

    private var subheadline: some View {
        Text("where real ones lock in. market intel, knowledge modules, the global arena. all of it.")
            .font(.system(size: 14))
            .foregroundStyle(theme.palette.muted)
    }

    private var planToggle: some View {
        HStack(spacing: 0) {
            toggleButton("monthly", on: plan == .monthly) { plan = .monthly }
            toggleButton("annual · best value", on: plan == .annual) { plan = .annual }
        }
        .background {
            Capsule().fill(theme.palette.surface.opacity(0.4))
        }
        .clipShape(Capsule())
    }

    private func toggleButton(_ label: String, on: Bool, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: on ? .semibold : .regular))
                .foregroundStyle(on ? Color.white : theme.palette.muted)
                .frame(maxWidth: .infinity, minHeight: 36)
                .background(on ? theme.palette.accent : Color.clear)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private var pricingCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Text(plan == .annual ? "$480/yr" : "$40/mo")
                    .strikethrough()
                    .foregroundStyle(theme.palette.muted)
                Text(plan == .annual ? "57% OFF" : "40% OFF")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(theme.palette.accent))
            }
            Text(plan == .annual ? "$16.99/mo" : "$24/mo")
                .font(.system(size: 36, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            if plan == .annual {
                Text("billed as $204/year")
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
                Text("you save $84 this year")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(theme.palette.accent)
            }
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

    private var features: some View {
        VStack(alignment: .leading, spacing: 8) {
            featureLine("📈 live market insights + founder's filter")
            featureLine("🧠 all 5 knowledge modules + global knowledge bar")
            featureLine("🏆 arena leaderboard + mastery badges")
        }
    }

    private func featureLine(_ s: String) -> some View {
        Text(s)
            .font(.system(size: 14))
            .foregroundStyle(theme.palette.text)
    }

    private var cta: some View {
        Button {
            // Phase 4 wires Stripe checkout here.
        } label: {
            Text("unlock the doer tab")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(theme.palette.accent)
                }
        }
        .buttonStyle(.plain)
    }

    private var trustLine: some View {
        Text("cancel anytime. no games.")
            .font(.system(size: 11))
            .foregroundStyle(theme.palette.muted)
            .frame(maxWidth: .infinity)
    }

    private var restoreLink: some View {
        Button("restore purchases") { /* Phase 4 */ }
            .buttonStyle(.plain)
            .font(.system(size: 12))
            .foregroundStyle(theme.palette.muted)
            .frame(maxWidth: .infinity)
    }

    private var streakNote: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("ur \(currentStreak)-day streak.")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            Text("doer tab unlocks at 3+ days. paying alone doesn't open it.")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(theme.palette.surface.opacity(0.3))
        }
    }
}

#Preview {
    DoerTabPaywallView(reason: .noSubscriptionAndStreakTooShort, currentStreak: 1)
        .environmentObject(ThemeEngine())
}
