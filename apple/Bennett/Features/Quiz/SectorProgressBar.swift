import SwiftUI

/// Per-sector OTF→PSM progress strip. Shows OTF rounds completed,
/// PSM unlock state, current lockout (if any), and Mastery Badge.
struct SectorProgressBar: View {
    let progress: SectorProgressDoc
    var onTakeBarExam: ((MasterySector) -> Void)? = nil

    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(progress.sector.label)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                if progress.psmPassed {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(theme.palette.accent)
                        .font(.system(size: 10))
                }
                Spacer()
                if progress.locked, let until = progress.lockoutUntil {
                    Text("locked · \(remaining(until: until))")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(.red.opacity(0.85))
                } else if progress.psmUnlocked {
                    Button("bar exam →") { onTakeBarExam?(progress.sector) }
                        .buttonStyle(.plain)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(theme.palette.accent)
                } else {
                    Text("\(progress.otfPassed)/\(progress.otfRequired) otf")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(theme.palette.muted)
                }
            }
            ProgressView(
                value: Double(min(progress.otfPassed, progress.otfRequired)),
                total: Double(progress.otfRequired)
            )
            .tint(progress.psmPassed ? theme.palette.accent : theme.palette.muted)
        }
        .padding(10)
        .background {
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(theme.palette.surface.opacity(0.3))
        }
    }

    private func remaining(until: TimeInterval) -> String {
        let now = Date.now.timeIntervalSince1970 * 1000
        let ms = max(0, until - now)
        let hours = Int(ms / (1000 * 60 * 60))
        let minutes = Int(ms.truncatingRemainder(dividingBy: 1000 * 60 * 60) / (1000 * 60))
        return "\(hours)h \(minutes)m"
    }
}
