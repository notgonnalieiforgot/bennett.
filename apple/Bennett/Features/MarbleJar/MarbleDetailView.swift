import SwiftUI

/// Sheet shown when the user taps a marble. Per spec §5b: shows date +
/// module completed. Ghost marbles get the "what could've been" framing
/// per Critical Rule #6 (loss aversion is the point).
struct MarbleDetailView: View {
    let marble: Marble
    var onClose: () -> Void

    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(spacing: 16) {
            kindBadge
            VStack(spacing: 4) {
                Text(formattedDate)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(theme.palette.muted)
                Text(headline)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(theme.palette.text)
                    .multilineTextAlignment(.center)
            }
            if let module = marble.moduleCompleted {
                Text("module: \(module)")
                    .font(.system(size: 13))
                    .foregroundStyle(theme.palette.muted)
            }
            Button(action: onClose) {
                Text("close")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: 240, minHeight: 44)
                    .background {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(theme.palette.accent)
                    }
            }
            .buttonStyle(.plain)
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(theme.palette.bg.ignoresSafeArea())
    }

    private var kindBadge: some View {
        let label: String
        let bg: Color
        switch marble.kind {
        case .clear:
            label = "marble"
            bg = theme.palette.text.opacity(0.85)
        case .gold:
            label = "gold · 7-day streak"
            bg = Color(red: 1.0, green: 0.81, blue: 0.13)
        case .diamond:
            label = "diamond · 30-day streak"
            bg = Color(red: 0.62, green: 0.92, blue: 1.0)
        case .ghost:
            label = "ghost · missed day"
            bg = theme.palette.muted
        }
        return Text(label)
            .font(.system(size: 11, weight: .semibold))
            .textCase(.uppercase)
            .foregroundStyle(.black.opacity(0.85))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background {
                Capsule().fill(bg)
            }
    }

    private var headline: String {
        switch marble.kind {
        case .clear:   return "u showed up that day"
        case .gold:    return "7 days locked in"
        case .diamond: return "30 days. legend tier."
        case .ghost:   return "this could've been ur marble"
        }
    }

    private var formattedDate: String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let d = f.date(from: marble.date) else { return marble.date }
        let display = DateFormatter()
        display.dateStyle = .long
        display.timeStyle = .none
        return display.string(from: d).lowercased()
    }
}
