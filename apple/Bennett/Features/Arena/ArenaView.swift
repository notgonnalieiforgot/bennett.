import SwiftUI
import FirebaseFirestore

/// Arena leaderboards. Two layers per spec §7:
///  - Global: ranks all users by Discipline Velocity. Username only.
///  - Sector: per-module leaderboard. Username + active module.
struct ArenaView: View {
    @EnvironmentObject var theme: ThemeEngine

    enum Layer: Hashable { case global, sector(KnowledgeModule) }
    @State private var layer: Layer = .global
    @State private var entries: [ArenaEntry] = []
    @State private var registration: ListenerRegistration?

    var body: some View {
        VStack(spacing: 16) {
            header
            picker
            list
        }
        .padding(20)
        .frame(maxWidth: 600)
        .frame(maxWidth: .infinity)
        .background(theme.palette.bg)
        .onAppear { resubscribe() }
        .onChange(of: layer) { _, _ in resubscribe() }
        .onDisappear { registration?.remove() }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("the arena")
                .font(.system(size: 26, weight: .heavy))
                .foregroundStyle(theme.palette.text)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(layer == .global
                 ? "global discipline velocity. username only."
                 : "specialized sector. who's actually putting the work in.")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var picker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                pill("global", on: layer == .global) { layer = .global }
                ForEach(KnowledgeModule.allCases, id: \.self) { m in
                    pill(m.rawValue.replacingOccurrences(of: "_", with: " "),
                         on: layer == .sector(m)) {
                        layer = .sector(m)
                    }
                }
            }
        }
    }

    private func pill(_ label: String, on: Bool, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(on ? .white : theme.palette.muted)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Capsule().fill(on ? theme.palette.accent : theme.palette.surface.opacity(0.3)))
        }
        .buttonStyle(.plain)
    }

    private var list: some View {
        VStack(spacing: 6) {
            if entries.isEmpty {
                Text("nobody's on the board yet.")
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
                    .padding(20)
            } else {
                ForEach(Array(entries.enumerated()), id: \.element.uid) { idx, entry in
                    row(rank: idx + 1, entry: entry)
                }
            }
        }
    }

    private func row(rank: Int, entry: ArenaEntry) -> some View {
        HStack(spacing: 10) {
            Text("\(rank)")
                .font(.system(size: 14, weight: .bold, design: .monospaced))
                .foregroundStyle(rank <= 3 ? theme.palette.accent : theme.palette.muted)
                .frame(width: 28, alignment: .leading)
            Text("@\(entry.username)")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            if let module = entry.module {
                Text(module.rawValue.replacingOccurrences(of: "_", with: " "))
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.muted)
            }
            Spacer()
            ForEach(entry.masteryBadges, id: \.self) { _ in
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(theme.palette.accent)
                    .font(.system(size: 10))
            }
            Text("\(Int(entry.disciplineVelocity))")
                .font(.system(size: 13, weight: .bold, design: .monospaced))
                .foregroundStyle(theme.palette.text)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 10)
        .background {
            RoundedRectangle(cornerRadius: 10)
                .fill(theme.palette.surface.opacity(0.3))
        }
    }

    private func resubscribe() {
        registration?.remove()
        switch layer {
        case .global:
            registration = ArenaService.shared.observeGlobal(limit: 50) { es in
                self.entries = es
            }
        case .sector(let module):
            registration = ArenaService.shared.observeSector(module, limit: 50) { es in
                self.entries = es
            }
        }
    }
}

#Preview {
    ArenaView()
        .environmentObject(ThemeEngine())
}
