import SwiftUI

/// Today's shields panel. Shows connect-calendar CTA when not connected,
/// and the active/ignored shields when connected. Phase 2 deliberately
/// keeps this minimal — the full Bento Grid surfacing of shields, push
/// notifications, and ASWebAuthenticationSession-based OAuth land in
/// Phase 6 / Phase 7.
struct ShieldsTodayView: View {
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    @State private var data: ShieldsTodayResponse?
    @State private var loading: Bool = false
    @State private var error: String?
    @State private var realTalk: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            header
            content
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(theme.palette.surface.opacity(0.5))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(theme.palette.border, lineWidth: 1)
                )
        }
        .task { await refresh() }
    }

    private var header: some View {
        HStack {
            Text("today's shields")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            Spacer()
            Button {
                Task { await refresh() }
            } label: {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(theme.palette.muted)
            }
            .buttonStyle(.plain)
        }
    }

    @ViewBuilder
    private var content: some View {
        if loading && data == nil {
            ProgressView().tint(theme.palette.accent)
        } else if let error {
            Text(error)
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
        } else if let data, !data.connected {
            connectCTA
        } else if let data {
            connectedState(data)
        } else {
            connectCTA
        }
        if let realTalk {
            Text(realTalk)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(.white)
                .padding(12)
                .background {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(Color.red.opacity(0.85))
                }
        }
    }

    private var connectCTA: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("connect google calendar to let bennett protect ur focus time.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
            Button {
                Task { await connect() }
            } label: {
                Text("connect calendar")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background {
                        RoundedRectangle(cornerRadius: 10).fill(theme.palette.accent)
                    }
            }
            .buttonStyle(.plain)
        }
    }

    @ViewBuilder
    private func connectedState(_ d: ShieldsTodayResponse) -> some View {
        if d.shields.isEmpty {
            Text(d.freeBlocks?.isEmpty == false
                 ? "calendar's tight today. no shield placed."
                 : "ur calendar is wide open. nothing to shield.")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
        } else {
            ForEach(d.shields) { shield in
                shieldRow(shield)
            }
        }
    }

    private func shieldRow(_ shield: Shield) -> some View {
        HStack(spacing: 10) {
            Text("🛡")
            VStack(alignment: .leading, spacing: 2) {
                Text(timeRange(shield))
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                Text(shield.state.rawValue)
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.muted)
            }
            Spacer()
            if shield.state == .active {
                Button("ignore") {
                    Task { await reportIgnored(shield) }
                }
                .font(.system(size: 12, weight: .medium))
                .buttonStyle(.plain)
                .foregroundStyle(theme.palette.muted)
            }
        }
        .padding(.vertical, 4)
    }

    private func timeRange(_ shield: Shield) -> String {
        let f = DateFormatter()
        f.timeStyle = .short
        return "\(f.string(from: shield.startDate)) – \(f.string(from: shield.endDate))"
    }

    private func refresh() async {
        guard let uid = session.user?.uid else {
            data = ShieldsTodayResponse(connected: false, shields: [], freeBlocks: nil, realTalkMessage: nil)
            return
        }
        loading = true
        defer { loading = false }
        do {
            data = try await ShieldService.shared.refreshShieldsToday(
                uid: uid,
                energyPulse: session.energyPulseToday ?? 5
            )
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func connect() async {
        guard let uid = session.user?.uid else { return }
        do {
            let url = try await ShieldService.shared.consentURL(uid: uid)
            ShieldService.shared.openConsent(url)
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func reportIgnored(_ shield: Shield) async {
        guard let uid = session.user?.uid else { return }
        do {
            let msg = try await ShieldService.shared.reportIgnored(
                uid: uid,
                shieldId: shield.id,
                energyPulse: session.energyPulseToday ?? 5,
                userName: session.user?.username ?? "u"
            )
            if let msg { realTalk = msg }
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

#Preview {
    ShieldsTodayView()
        .environmentObject(ThemeEngine())
        .environmentObject(SessionStore())
        .padding()
        .frame(width: 360)
}
