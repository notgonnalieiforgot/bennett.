import SwiftUI

/// User profile badges card. Pulls from /api/badges/list.
/// Phase 5 will lift this into the full profile screen alongside username,
/// streak count, etc.
struct MasteryBadgesView: View {
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore
    @State private var badges: [KnowledgeModule] = []
    @State private var loading = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("mastery badges")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                Spacer()
                Text(loading ? "…" : "\(badges.count) earned")
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.muted)
            }
            if badges.isEmpty {
                Text("none yet. finish a module + pass its quiz.")
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 110))], spacing: 8) {
                    ForEach(badges, id: \.self) { module in
                        badgeChip(module)
                    }
                }
            }
        }
        .padding(14)
        .background {
            RoundedRectangle(cornerRadius: 14)
                .fill(theme.palette.surface.opacity(0.4))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(theme.palette.border, lineWidth: 1)
                )
        }
        .task { await load() }
    }

    private func badgeChip(_ module: KnowledgeModule) -> some View {
        let label = module.rawValue.replacingOccurrences(of: "_", with: " ")
        return HStack(spacing: 6) {
            Image(systemName: "checkmark.seal.fill")
                .foregroundStyle(theme.palette.accent)
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(theme.palette.text)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background {
            Capsule().fill(theme.palette.bg.opacity(0.4))
        }
    }

    private func load() async {
        guard let uid = session.user?.uid else { return }
        loading = true
        defer { loading = false }
        struct Body: Decodable { let badges: [String] }
        do {
            var comps = URLComponents(
                url: AppConfig.apiBaseURL.appendingPathComponent("api/badges/list"),
                resolvingAgainstBaseURL: false
            )!
            comps.queryItems = [URLQueryItem(name: "uid", value: uid)]
            let (data, _) = try await URLSession.shared.data(from: comps.url!)
            let decoded = try JSONDecoder().decode(Body.self, from: data)
            badges = decoded.badges.compactMap { KnowledgeModule(rawValue: $0) }
        } catch {
            // Soft-fail: empty badges. Phase 6 adds error surfacing.
        }
    }
}
