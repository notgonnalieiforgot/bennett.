import SwiftUI

/// Read-only Market Insights feed. Filters by the 3 spec domains: Stocks,
/// Real Estate, AI & Digital. Founder publishing happens in the web admin
/// (Phase 3 keeps the Mac/iOS surfaces consumer-only).
struct MarketInsightsView: View {
    @EnvironmentObject var theme: ThemeEngine
    @State private var domain: MarketInsightDomain? = nil
    @State private var insights: [MarketInsight] = []
    @State private var loading: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("market insights")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                Spacer()
                domainPicker
            }
            if loading {
                ProgressView().tint(theme.palette.accent)
            } else if insights.isEmpty {
                Text("nothing published yet for this domain.")
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
            } else {
                ForEach(insights) { insight in
                    insightCard(insight)
                }
            }
        }
        .padding(16)
        .background {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(theme.palette.surface.opacity(0.4))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(theme.palette.border, lineWidth: 1)
                )
        }
        .task { await refresh() }
        .onChange(of: domain) { _, _ in Task { await refresh() } }
    }

    private var domainPicker: some View {
        Menu {
            Button("all") { domain = nil }
            ForEach(MarketInsightDomain.allCases, id: \.self) { d in
                Button(d.label) { domain = d }
            }
        } label: {
            Text(domain?.label ?? "all")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(theme.palette.muted)
        }
        .menuStyle(.borderlessButton)
    }

    private func insightCard(_ insight: MarketInsight) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(insight.domain.label)
                    .font(.system(size: 10, weight: .bold))
                    .textCase(.uppercase)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(theme.palette.accent.opacity(0.15)))
                    .foregroundStyle(theme.palette.accent)
                Spacer()
            }
            Text(insight.title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            Text(insight.summary)
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
                .lineLimit(3)
            if let f = insight.founderFilter, !f.isEmpty {
                Text("founder's filter: \(f)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(theme.palette.accent)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(theme.palette.bg.opacity(0.4))
        }
    }

    private func refresh() async {
        loading = true
        defer { loading = false }
        do {
            insights = try await DoerTabService.shared.listMarketInsights(domain: domain)
        } catch {
            insights = []
        }
    }
}
