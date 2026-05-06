import SwiftUI

/// Doer Tab unlocked state. Layout:
///  1. Knowledge Bar at top (persistent)
///  2. Sector Progress Bars (mastery quiz spec)
///  3. Bento Grid of module tiles
///  4. Market Insights feed
struct DoerTabHomeView: View {
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore
    @State private var selectedModule: KnowledgeModule? = nil
    @State private var moduleTiles: [DoerModuleTile] = KnowledgeModuleCatalog.all.map {
        DoerModuleTile(id: $0.id, name: $0.name, emoji: $0.emoji, oneLiner: $0.oneLiner)
    }
    @State private var sectorProgress: [SectorProgressDoc] = []
    @State private var psmQuiz: PSMQuizDoc?
    @State private var psmReason: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("the war room")
                    .font(.system(size: 30, weight: .heavy))
                    .foregroundStyle(theme.palette.text)
                KnowledgeBarView()
                if !sectorProgress.isEmpty {
                    sectorProgressSection
                }
                BentoGrid(
                    items: $moduleTiles,
                    size: { _ in .small },
                    content: { tile in
                        Button {
                            selectedModule = tile.id
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(tile.emoji)
                                    .font(.system(size: 28))
                                Text(tile.name.lowercased())
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundStyle(theme.palette.text)
                                Text(tile.oneLiner)
                                    .font(.system(size: 11))
                                    .foregroundStyle(theme.palette.muted)
                                    .lineLimit(2)
                            }
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                            .bnSurface()
                        }
                        .buttonStyle(.plain)
                    }
                )
                .frame(minHeight: 320)
                MarketInsightsView()
            }
            .padding(20)
        }
        .background(theme.palette.bg)
        .task { await loadProgress() }
        .sheet(item: $selectedModule) { id in
            if let module = KnowledgeModuleCatalog.byId(id) {
                ModuleDetailView(module: module)
                    #if os(macOS)
                    .frame(minWidth: 600, minHeight: 720)
                    #endif
            }
        }
        .sheet(item: $psmQuiz) { quiz in
            PSMQuizView(quiz: quiz) {
                psmQuiz = nil
                Task { await loadProgress() }
            }
            #if os(macOS)
            .frame(minWidth: 540, minHeight: 600)
            #endif
        }
    }

    private var sectorProgressSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("sector progress")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(theme.palette.text)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 220), spacing: 8)], spacing: 8) {
                ForEach(sectorProgress) { p in
                    SectorProgressBar(progress: p, onTakeBarExam: { sector in
                        Task { await fetchPSM(sector: sector) }
                    })
                }
            }
            if let psmReason {
                Text(psmReason)
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.muted)
            }
        }
    }

    private func loadProgress() async {
        guard let uid = session.user?.uid else { return }
        do {
            sectorProgress = try await MasteryService.shared.sectorProgress(uid: uid)
        } catch {
            sectorProgress = []
        }
    }

    private func fetchPSM(sector: MasterySector) async {
        guard let uid = session.user?.uid else { return }
        do {
            let res = try await MasteryService.shared.fetchPSM(uid: uid, sector: sector)
            if res.unlocked, let quiz = res.quiz {
                psmQuiz = quiz
            } else {
                psmReason = res.reason ?? "locked"
            }
        } catch {
            psmReason = error.localizedDescription
        }
    }
}

extension KnowledgeModule: Identifiable {
    public var id: String { rawValue }
}

private struct DoerModuleTile: Identifiable, Equatable {
    let id: KnowledgeModule
    let name: String
    let emoji: String
    let oneLiner: String
}
